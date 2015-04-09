_ = require("lodash")
https = require('https')
#http = require('http')
UploadStream = require('./upload_stream')
utils = require("./utils")
config = require("./config")
fs = require('fs')
path = require('path')
Q = require('q')


# Multipart support based on http://onteria.wordpress.com/2011/05/30/multipartform-data-uploads-using-node-js-and-http-request/
build_upload_params = (options) ->
  utils.build_upload_params(options)

exports.unsigned_upload_stream = (upload_preset, callback, options={}) ->
  exports.upload_stream(callback, utils.merge(options, unsigned: true, upload_preset: upload_preset))
 
exports.upload_stream = (callback, options={}) ->
  exports.upload(null, callback, _.extend({stream: true}, options))

exports.unsigned_upload = (file, upload_preset, callback, options={}) ->
  exports.upload(file, callback, utils.merge(options, unsigned: true, upload_preset: upload_preset))

exports.upload = (file, callback, options={}) ->
  call_api "upload", callback, options, ->
    params = build_upload_params(options)
    if file? && file.match(/^ftp:|^https?:|^s3:|^data:[^;]*;base64,([a-zA-Z0-9\/+\n=]+)$/)
      [params, file: file]
    else 
      [params, {}, file]

exports.upload_large_part = (callback, options={}) ->
  call_api "upload_large", callback, _.extend(resource_type: "raw", stream: true, options), ->
    return [
      timestamp: utils.timestamp()
      type: options.type
      public_id: options.public_id
      backup: options.backup
      final: options.final
      part_number: options.part_number
      upload_id: options.upload_id
      tags: options.tags && utils.build_array(options.tags).join(',')
    ]

exports.upload_large = (path, callback, options={}) ->
  options =  _.extend({}, options, part_number: 0, final: false)
  options.part_size ?= 20000000
  start = (err, stats) ->
    if err?
      callback(error: err) if callback?
      return
    file_size = stats.size
    part_number = 0
    total_uploaded_size = 0
    current_part_size = 0
    stream = null
    first_part = true
    file_reader = fs.createReadStream(path)
        
    file_reader.on 'end', ->
      stream.end()          
    file_reader.on 'data', (chunk) ->
      upload_request = ->
        options.final = total_uploaded_size + options.part_size >= file_size
        options.part_number += 1
        stream = exports.upload_large_part(finished_part, options) 
        stream.write(chunk) 
      finished_part = (upload_large_part_result) ->
        if options.final
          callback(upload_large_part_result) if callback?
        else
          options.public_id = upload_large_part_result.public_id
          options.upload_id = upload_large_part_result.upload_id            
          current_part_size = chunk.length
          if first_part
            first_part = false  
          else
            file_reader.resume()         
          upload_request()

      current_part_size += chunk.length
      total_uploaded_size += chunk.length
      first_part = !stream?
      if first_part || current_part_size > options.part_size        
        if first_part
          upload_request()
        else
          file_reader.pause()
          stream.end()
      else
        stream.write(chunk)
  fs.stat(path, start)
  
exports.explicit = (public_id, callback, options={}) ->
  call_api "explicit", callback, options, ->
    return [
      timestamp: utils.timestamp()
      type: options.type
      public_id: public_id
      callback: options.callback
      eager: utils.build_eager(options.eager)
      eager_notification_url: options.eager_notification_url
      eager_async: utils.as_safe_bool(options.eager_async)
      headers: utils.build_custom_headers(options.headers)
      tags: options.tags ? utils.build_array(options.tags).join(",")
      face_coordinates: options.face_coordinates && utils.encode_double_array(options.face_coordinates)
      custom_coordinates: options.custom_coordinates && utils.encode_double_array(options.custom_coordinates)
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
    transformation = utils.generate_transformation_string(_.extend({}, options, fetch_format: options.format))
    return [{timestamp: utils.timestamp(), tag: tag, transformation: transformation, async: options.async, notification_url: options.notification_url}]

exports.multi = (tag, callback, options={}) ->
  call_api "multi", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend({}, options))
    return [{timestamp: utils.timestamp(), tag: tag, transformation: transformation, format: options.format, async: options.async, notification_url: options.notification_url}]

exports.explode = (public_id, callback, options={}) ->
  call_api "explode", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend({}, options))
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
  deferred = Q.defer()
  options = _.clone(options)

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
      callback(res) if callback?
    else if _.includes([200,400,401,404,420,500], res.statusCode)
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
        callback(result) if callback?
      res.on "error", (e) ->
        error = true
        deferred.reject(e)
        callback(error: e) if callback?
    else
      error_obj = error: {message: "Server returned unexpected status code - #{res.statusCode}", http_code: res.statusCode}
      deferred.reject(error_obj.error)
      callback(error_obj) if callback?
  post_data = []
  for key, value of params 
    if _.isArray(value)
      for v in value 
        post_data.push new Buffer(EncodeFieldPart(boundary, key+"[]", v), 'utf8')
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
  post_options = _.extend post_options,
    method: 'POST',
    headers: 
      'Content-Type': 'multipart/form-data; boundary=' + boundary
      'User-Agent': utils.USER_AGENT
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

  for i in [0..post_data.length-1]
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

EncodeFilePart = (boundary,type,name,filename) ->
  return_part = "--#{boundary}\r\n"
  return_part += "Content-Disposition: form-data; name=\"#{name}\"; filename=\"#{filename}\"\r\n"
  return_part += "Content-Type: #{type}\r\n\r\n"
  return_part

exports.direct_upload = (callback_url, options={}) ->
  params = build_upload_params(_.extend({callback: callback_url}, options))
  params = utils.process_request_params(params, options)
  api_url = utils.api_url("upload", options)

  return hidden_fields: params, form_attrs: {action: api_url, method: "POST", enctype: "multipart/form-data"}

exports.upload_tag_params = (options={}) ->
  params = build_upload_params(options)
  params = utils.process_request_params(params, options)
  JSON.stringify(params)
  
exports.upload_url = (options={}) ->
  options.resource_type ?= "auto"
  utils.api_url("upload", options)

exports.image_upload_tag = (field, options={}) ->
  html_options = options.html ? {}

  tag_options = _.extend(html_options, {
      type: "file", 
      name: "file",
      "data-url": exports.upload_url(options),
      "data-form-data": exports.upload_tag_params(options),
      "data-cloudinary-field": field,
      "class": [html_options["class"], "cloudinary-fileupload"].join(" ") 
  })
  return '<input ' + utils.html_attrs(tag_options) + '/>'

exports.unsigned_image_upload_tag = (field, upload_preset, options={}) ->
  exports.image_upload_tag(field, utils.merge(options, unsigned: true, upload_preset: upload_preset))
