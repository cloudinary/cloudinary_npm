_ = require("underscore")
https = require('https')
#http = require('http')
utils = require("./utils")
config = require("./config")
fs = require('fs')
path = require('path')

# Multipart support based on http://onteria.wordpress.com/2011/05/30/multipartform-data-uploads-using-node-js-and-http-request/

build_eager = (transformations) ->
  (for transformation in utils.build_array(transformations)
    transformation = _.clone(transformation)
    _.filter([utils.generate_transformation_string(transformation), transformation.format], utils.present).join("/")
  ).join("|")
    
build_custom_headers = (headers) ->
  if !headers?
    return undefined
  else if _.isArray(headers) 
    ;
  else if _.isObject(headers)
    headers = [k + ": " + v for k, v of headers]    
  else
    return headers
  return headers.join("\n")

build_upload_params = (options) ->
  params = 
    timestamp: utils.timestamp(),
    transformation: utils.generate_transformation_string(options),
    public_id: options.public_id,
    callback: options.callback,
    format: options.format,
    backup: options.backup,
    faces: options.faces,
    exif: options.exif,
    image_metadata: options.image_metadata,
    colors: options.colors,
    type: options.type,
    eager: build_eager(options.eager),
    headers: build_custom_headers(options.headers),
    use_filename: options.use_filename, 
    discard_original_filename: options.discard_original_filename, 
    notification_url: options.notification_url,
    eager_notification_url: options.eager_notification_url,
    eager_async: options.eager_async,
    invalidate: options.invalidate,
    tags: options.tags && utils.build_array(options.tags).join(",")
  params
 
exports.upload_stream = (callback, options={}) ->
  exports.upload(null, callback, _.extend({stream: true}, options))

exports.upload = (file, callback, options={}) ->
  call_api "upload", callback, options, ->
    params = build_upload_params(options)
    if file? && file.match(/^https?:|^s3:|^data:image\/\w*;base64,([a-zA-Z0-9\/+\n=]+)$/)
      return [params, file: file]
    else 
      return [params, {}, file]

exports.explicit = (public_id, callback, options={}) ->
  call_api "explicit", callback, options, ->
    return [
      timestamp: utils.timestamp()
      type: options.type
      public_id: public_id
      callback: options.callback
      eager: build_eager(options.eager)
      headers: build_custom_headers(options.headers)
      tags: options.tags ? utils.build_array(options.tags).join(",")
    ]
    
exports.destroy = (public_id, callback, options={}) ->
  call_api "destroy", callback, options, ->
    return [timestamp: utils.timestamp(), type: options.type, invalidate: options.invalidate,public_id:  public_id]

exports.rename = (from_public_id, to_public_id, callback, options={}) ->
  call_api "rename", callback, options, ->
    return [timestamp: utils.timestamp(), type: options.type, from_public_id: from_public_id, to_public_id: to_public_id, overwrite: options.overwrite]

TEXT_PARAMS = ["public_id", "font_family", "font_size", "font_color", "text_align", "font_weight", "font_style", "background", "opacity", "text_decoration"]
exports.text = (text, callback, options={}) ->
  call_api "text", callback, options, ->
    params = {timestamp: utils.timestamp(), text: text}
    for k in TEXT_PARAMS when options[k]?
      params[k] = options[k]
    [params]
  
exports.generate_sprite = (tag, callback, options={}) ->
  call_api "sprite", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend(options, fetch_format: options.format))
    return [{timestamp: utils.timestamp(), tag: tag, transformation: transformation, async: options.async, notification_url: options.notification_url}]

exports.multi = (tag, callback, options={}) ->
  call_api "multi", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend(options))
    return [{timestamp: utils.timestamp(), tag: tag, transformation: transformation, format: options.format, async: options.async, notification_url: options.notification_url}]

exports.explode = (public_id, callback, options={}) ->
  call_api "explode", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend(options))
    return [{timestamp: utils.timestamp(), public_id: public_id, transformation: transformation, format: options.format, type: options.type, notification_url: options.notification_url}]

# options may include 'exclusive' (boolean) which causes clearing this tag from all other resources 
exports.add_tag = (tag, public_ids = [], callback, options = {}) ->
  exclusive = utils.option_consume("exclusive", options)
  command = if exclusive then "set_exclusive" else "add"
  call_tags_api(tag, command, public_ids, callback, options)

exports.remove_tag = (tag, public_ids = [], callback, options = {}) ->
  call_tags_api(tag, "remove", public_ids, callback, options)

exports.replace_tag = (tag, public_ids = [], callback, options = {}) ->
  call_tags_api(tag, "replace", public_ids, callback, options)

call_tags_api = (tag, command, public_ids = [], callback, options = {}) ->
  call_api "tags", callback, options, ->
    return [{timestamp: utils.timestamp(), tag: tag, public_ids:  utils.build_array(public_ids), command:  command, type: options.type}]
   
call_api = (action, callback, options, get_params) ->
  options = _.clone(options)
  api_key = options.api_key ? config().api_key ? throw("Must supply api_key")
  api_secret = options.api_secret ? config().api_secret ? throw("Must supply api_secret")

  [params, unsigned_params, file] = get_params.call()
  
  params.signature = utils.api_sign_request(params, api_secret)
  params.api_key = api_key
  params = _.extend(params, unsigned_params)

  api_url = utils.api_url(action, options)
  
  boundary = utils.random_public_id()

  handle_response = (res) ->
    if _.include([200,400,401,500], res.statusCode)
      buffer = ""
      error = false
      res.on "data", (d) -> buffer += d
      res.on "end", ->
        return if error
        try
          result = JSON.parse(buffer)
        catch e
          result = {error: {message: "Server return invalid JSON response. Status Code #{res.statusCode}"}}
        result["error"]["http_code"] = res.statusCode if result["error"]
        callback(result)
      res.on "error", (e) ->
        error = true
        callback(error: e)
    else
      callback(error: {message: "Server returned unexpected status code - #{res.statusCode}"})
  post_data = []
  for key, value of params 
    if _.isArray(value)
      for v in value 
        post_data.push new Buffer(EncodeFieldPart(boundary, key+"[]", v), 'ascii')
    else if utils.present(value)
      post_data.push new Buffer(EncodeFieldPart(boundary, key, value), 'ascii') 
  post api_url, post_data, boundary, file, handle_response, options
  
post = (url, post_data, boundary, file, callback, options) ->
  finish_buffer = new Buffer("--" + boundary + "--", 'ascii')
  if file? || options.stream
    filename = options.stream ? "file" : path.basename(file) 
    file_header = new Buffer(EncodeFilePart(boundary, 'application/octet-stream', 'file', filename), 'binary')

  post_options = require('url').parse(url)
  post_options = _.extend post_options,
    method: 'POST',
    headers: 
      'Content-Type': 'multipart/form-data; boundary=' + boundary

  post_request = https.request(post_options, callback)
  post_request.on "error", (e) -> callback(error: e)
  post_request.setTimeout options.timeout ? 60

  for i in [0..post_data.length-1]
    post_request.write(post_data[i])
 
  done = ->
    post_request.write(finish_buffer)
    post_request.end()

  if options.stream
    post_request.write(file_header)
    return {
      write: (data) ->
        post_request.write(new Buffer(data, 'binary'))
      end: ->
        post_request.write(new Buffer("\r\n", 'ascii'))
        done()        
    }
  else if file?
    post_request.write(file_header)
    file_reader = fs.createReadStream(file, {encoding: 'binary'});
    file_reader.on 'data', (data) -> post_request.write(new Buffer(data, 'binary'))
    file_reader.on 'end', ->
      post_request.write(new Buffer("\r\n", 'ascii'))
      done()
  else
    done()
  true

EncodeFieldPart = (boundary, name, value) ->
  return_part = "--#{boundary}\r\n";
  return_part += "Content-Disposition: form-data; name=\"#{name}\"\r\n\r\n"
  return_part += value + "\r\n"
  return_part

EncodeFilePart = (boundary,type,name,filename) ->
  return_part = "--#{boundary}\r\n";
  return_part += "Content-Disposition: form-data; name=\"#{name}\"; filename=\"#{filename}\"\r\n";
  return_part += "Content-Type: #{type}\r\n\r\n";
  return_part

exports.direct_upload = (callback_url, options) ->
  params = build_upload_params(_.extend({callback: callback_url}, options))
  params.signature = utils.api_sign_request(params, config().api_secret)
  params.api_key = config().api_key

  api_url = utils.api_url("upload", options)

  for k, v of params when not utils.present(v)
    delete params[k]

  return hidden_fields: params, form_attrs: {action: api_url, method: "POST", enctype: "multipart/form-data"}


exports.image_upload_tag = (field, options={}) ->
  html_options = options.html ? {}
  options.resource_type ?= "auto"
  cloudinary_upload_url = utils.api_url("upload", options)

  api_key = options.api_key ? config().api_key ? throw("Must supply api_key")
  api_secret = options.api_secret ? config().api_secret ? throw("Must supply api_secret")

  params = build_upload_params(options)
  params["signature"] = utils.api_sign_request(params, api_secret)
  params["api_key"] = api_key

  # Remove blank parameters
  for k, v of params when not utils.present(v)
    delete params[k]

  tag_options = _.extend(html_options, {
      type: "file", 
      name: "file",
      "data-url": cloudinary_upload_url,
      "data-form-data": JSON.stringify(params),
      "data-cloudinary-field": field,
      "class": [html_options["class"], "cloudinary-fileupload"].join(" ") 
  })
  return '<input ' + utils.html_attrs(tag_options) + '/>'


