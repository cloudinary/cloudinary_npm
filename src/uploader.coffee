_ = require("lodash")
config = require("./config")
if config().upload_prefix && config().upload_prefix[0..4] == 'http:'
  https = require('http')
else
  https = require('https')
#http = require('http')
UploadStream = require('./upload_stream')
utils = require("./utils")
util = require("util")
fs = require('fs')
path = require('path')
Q = require('q')
Writable = require("stream").Writable


# Multipart support based on http://onteria.wordpress.com/2011/05/30/multipartform-data-uploads-using-node-js-and-http-request/
build_upload_params = (options) ->
  utils.build_upload_params(options)

exports.unsigned_upload_stream = (upload_preset, callback, options = {}) ->
  exports.upload_stream(callback, utils.merge(options, unsigned: true, upload_preset: upload_preset))

exports.upload_stream = (callback, options = {}) ->
  exports.upload(null, callback, _.extend({stream: true}, options))

exports.unsigned_upload = (file, upload_preset, callback, options = {}) ->
  exports.upload(file, callback, utils.merge(options, unsigned: true, upload_preset: upload_preset))

exports.upload = (file, callback, options = {}) ->
  call_api "upload", callback, options, ->
    params = build_upload_params(options)
    if file? && file.match(/^ftp:|^https?:|^s3:|^data:[^;]*;base64,([a-zA-Z0-9\/+\n=]+)$/)
      [params, file: file]
    else
      [params, {}, file]

exports.upload_large = (path, callback, options = {}) ->
  exports.upload_chunked(path, callback, _.extend({resource_type: 'raw'}, options))

exports.upload_chunked = (path, callback, options) ->
  file_reader = fs.createReadStream(path)
  out_stream = exports.upload_chunked_stream(callback, options)
  return file_reader.pipe(out_stream)

class Chunkable extends Writable
  constructor: (options)->
    @chunk_size = options.chunk_size  ? 20000000
    @buffer = new Buffer(0)
    @active = true
    super(options)
    @on 'finish', () =>
      @emit('ready', @buffer, true, ->) if @active

  _write: (data, encoding, done) ->
    return done() unless @active
    if @buffer.length + data.length <= @chunk_size
      @buffer = Buffer.concat([@buffer, data], @buffer.length + data.length);
      done()
    else
      grab = @chunk_size - @buffer.length
      @buffer = Buffer.concat([@buffer, data.slice(0, grab)], @buffer.length + grab)
      @emit 'ready', @buffer, false, (@active) =>
        if @active
          @buffer = data.slice(grab)
          done()

exports.upload_large_stream = (_unused_, callback, options = {}) ->
  exports.upload_chunked_stream(callback, _.extend({resource_type: 'raw'}, options))

exports.upload_chunked_stream = (callback, options = {}) ->
  options = _.extend({}, options, stream: true)
  options.x_unique_upload_id = utils.random_public_id()
  params = build_upload_params(options)

  chunk_size = options.chunk_size ? options.part_size
  chunker = new Chunkable(chunk_size: chunk_size)
  sent = 0

  chunker.on 'ready', (buffer, is_last, done) ->
    chunk_start = sent
    sent += buffer.length
    options.content_range = util.format("bytes %d-%d/%d", chunk_start, sent - 1, if is_last then sent else -1)
    finished_part = (result) ->
      if result.error? || is_last
        callback?(result)
        done(false)
      else
        done(true)
    stream = call_api "upload", finished_part, options, ->
      [params, {}, buffer]
    stream.write(buffer, 'buffer', -> stream.end())

  return chunker

exports.explicit = (public_id, callback, options = {}) ->
  call_api "explicit", callback, options, ->
    utils.build_explicit_api_params(public_id, options)


# Creates a new archive in the server and returns information in JSON format
exports.create_archive = (callback, options = {}, target_format = null)->
  call_api "generate_archive", callback, options, ->
    opt = utils.archive_params(options)
    opt.target_format = target_format if target_format
    [opt]

# Creates a new zip archive in the server and returns information in JSON format
exports.create_zip = (callback, options = {})->
  exports.create_archive(callback, options, "zip")

exports.destroy = (public_id, callback, options = {}) ->
  call_api "destroy", callback, options, ->
    return [timestamp: utils.timestamp(), type: options.type, invalidate: options.invalidate, public_id: public_id]

exports.rename = (from_public_id, to_public_id, callback, options = {}) ->
  call_api "rename", callback, options, ->
    return [
      timestamp: utils.timestamp(),
      type: options.type,
      from_public_id: from_public_id,
      to_public_id: to_public_id,
      overwrite: options.overwrite,
      invalidate: options.invalidate,
      to_type: options.to_type
    ]

TEXT_PARAMS = ["public_id", "font_family", "font_size", "font_color", "text_align", "font_weight", "font_style",
  "background", "opacity", "text_decoration"]
exports.text = (text, callback, options = {}) ->
  call_api "text", callback, options, ->
    params = {timestamp: utils.timestamp(), text: text}
    for k in TEXT_PARAMS when options[k]?
      params[k] = options[k]
    [params]

exports.generate_sprite = (tag, callback, options = {}) ->
  call_api "sprite", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend({}, options, fetch_format: options.format))
    return [{
      timestamp: utils.timestamp(),
      tag: tag,
      transformation: transformation,
      async: options.async,
      notification_url: options.notification_url
    }]

exports.multi = (tag, callback, options = {}) ->
  call_api "multi", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend({}, options))
    return [{
      timestamp: utils.timestamp(),
      tag: tag,
      transformation: transformation,
      format: options.format,
      async: options.async,
      notification_url: options.notification_url
    }]

exports.explode = (public_id, callback, options = {}) ->
  call_api "explode", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend({}, options))
    return [{
      timestamp: utils.timestamp(),
      public_id: public_id,
      transformation: transformation,
      format: options.format,
      type: options.type,
      notification_url: options.notification_url
    }]

# options may include 'exclusive' (boolean) which causes clearing this tag from all other resources 
exports.add_tag = (tag, public_ids = [], callback, options = {}) ->
  exclusive = utils.option_consume("exclusive", options)
  command = if exclusive then "set_exclusive" else "add"
  call_tags_api(tag, command, public_ids, callback, options)

exports.remove_tag = (tag, public_ids = [], callback, options = {}) ->
  call_tags_api(tag, "remove", public_ids, callback, options)

exports.remove_all_tags = (public_ids = [], callback, options = {}) ->
  call_tags_api(null, "remove_all", public_ids, callback, options)

exports.replace_tag = (tag, public_ids = [], callback, options = {}) ->
  call_tags_api(tag, "replace", public_ids, callback, options)

call_tags_api = (tag, command, public_ids = [], callback, options = {}) ->
  call_api "tags", callback, options, ->
    params = {
      timestamp: utils.timestamp(),
      public_ids: utils.build_array(public_ids),
      command: command,
      type: options.type
    }
    if tag?
      params.tag = tag
    return [params]

exports.add_context = (context, public_ids = [], callback, options = {}) ->
  call_context_api(context, 'add', public_ids, callback, options)

exports.remove_all_context = (public_ids = [], callback, options = {}) ->
  call_context_api(null, 'remove_all', public_ids, callback, options)

call_context_api = (context, command, public_ids = [], callback, options = {}) ->
  call_api 'context', callback, options, ->
    params = {
      timestamp: utils.timestamp(),
      public_ids: utils.build_array(public_ids),
      command: command,
      type: options.type
    }
    if context?
      params.context = utils.encode_context(context)
    return [params]

call_api = (action, callback, options, get_params) ->
  deferred = Q.defer()
  options ?= {}

  [params, unsigned_params, file] = get_params.call()

  params = utils.process_request_params(params, options)
  params = _.extend(params, unsigned_params)

  api_url = utils.api_url(action, options)

  boundary = utils.random_public_id()

  error = false
  handle_response = (res) ->
    if error
# Already reported
    else if res.error
      error = true
      deferred.reject(res)
      callback?(res)
    else if _.includes([200, 400, 401, 404, 420, 500], res.statusCode)
      buffer = ""
      res.on "data", (d) -> buffer += d
      res.on "end", ->
        return if error
        try
          result = JSON.parse(buffer)
        catch e
          result = {error: {message: "Server return invalid JSON response. Status Code #{res.statusCode}"}}
        result["error"]["http_code"] = res.statusCode if result["error"]
        if result.error
          deferred.reject(result.error)
        else
          deferred.resolve(result)
        callback?(result)
      res.on "error", (e) ->
        error = true
        deferred.reject(e)
        callback?(error: e)
    else
      error_obj =
        error: {message: "Server returned unexpected status code - #{res.statusCode}", http_code: res.statusCode}
      deferred.reject(error_obj.error)
      callback?(error_obj)
  post_data = []
  for key, value of params
    if _.isArray(value)
      for v in value
        post_data.push new Buffer(EncodeFieldPart(boundary, key + "[]", v), 'utf8')
    else if utils.present(value)
      post_data.push new Buffer(EncodeFieldPart(boundary, key, value), 'utf8')

  result = post api_url, post_data, boundary, file, handle_response, options
  if _.isObject(result)
    return result
  else
    return deferred.promise

post = (url, post_data, boundary, file, callback, options) ->
  finish_buffer = new Buffer("--" + boundary + "--", 'ascii')
  if file? || options.stream
    filename = if options.stream then "file" else path.basename(file)
    file_header = new Buffer(EncodeFilePart(boundary, 'application/octet-stream', 'file', filename), 'binary')

  post_options = require('url').parse(url)
  headers =
    'Content-Type': 'multipart/form-data; boundary=' + boundary
    'User-Agent': utils.getUserAgent()
  headers['Content-Range'] = options.content_range if options.content_range?
  headers['X-Unique-Upload-Id'] = options.x_unique_upload_id if options.x_unique_upload_id?
  post_options = _.extend post_options,
    method: 'POST',
    headers: headers
  post_options.agent = options.agent if options.agent?
  post_request = https.request(post_options, callback)
  upload_stream = new UploadStream({boundary: boundary})
  upload_stream.pipe(post_request)
  timeout = false
  post_request.on "error", (e) ->
    if timeout
      callback(error: {message: "Request Timeout", http_code: 499})
    else
      callback(error: e)
  post_request.setTimeout options.timeout ? 60000, ->
    timeout = true
    post_request.abort()

  for i in [0..post_data.length - 1]
    post_request.write(post_data[i])

  if options.stream
    post_request.write(file_header)
    return upload_stream
  else if file?
    post_request.write(file_header)
    fs.createReadStream(file)
    .on('error', (error)->
      callback(error: error)
      post_request.abort()
    ).pipe(upload_stream)
  else
    post_request.write(finish_buffer)
    post_request.end()

  true

EncodeFieldPart = (boundary, name, value) ->
  return_part = "--#{boundary}\r\n"
  return_part += "Content-Disposition: form-data; name=\"#{name}\"\r\n\r\n"
  return_part += value + "\r\n"
  return_part

EncodeFilePart = (boundary, type, name, filename) ->
  return_part = "--#{boundary}\r\n"
  return_part += "Content-Disposition: form-data; name=\"#{name}\"; filename=\"#{filename}\"\r\n"
  return_part += "Content-Type: #{type}\r\n\r\n"
  return_part

exports.direct_upload = (callback_url, options = {}) ->
  params = build_upload_params(_.extend({callback: callback_url}, options))
  params = utils.process_request_params(params, options)
  api_url = utils.api_url("upload", options)

  return hidden_fields: params, form_attrs: {action: api_url, method: "POST", enctype: "multipart/form-data"}

exports.upload_tag_params = (options = {}) ->
  params = build_upload_params(options)
  params = utils.process_request_params(params, options)
  JSON.stringify(params)

exports.upload_url = (options = {}) ->
  options.resource_type ?= "auto"
  utils.api_url("upload", options)

exports.image_upload_tag = (field, options = {}) ->
  html_options = options.html ? {}

  tag_options = _.extend( {
    type: "file",
    name: "file",
    "data-url": exports.upload_url(options),
    "data-form-data": exports.upload_tag_params(options),
    "data-cloudinary-field": field,
    "data-max-chunk-size": options.chunk_size,
    "class": [html_options["class"], "cloudinary-fileupload"].join(" ")
  }, html_options)
  return '<input ' + utils.html_attrs(tag_options) + '/>'

exports.unsigned_image_upload_tag = (field, upload_preset, options = {}) ->
  exports.image_upload_tag(field, utils.merge(options, unsigned: true, upload_preset: upload_preset))
