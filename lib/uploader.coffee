_ = require("underscore")
https = require('https')
#http = require('http')
utils = require("./utils")
config = require("./config")
fs = require('fs')
path = require('path')

# Multipart support based on http://onteria.wordpress.com/2011/05/30/multipartform-data-uploads-using-node-js-and-http-request/

timestamp = ->
  Math.floor(new Date().getTime()/1000)

build_upload_params = (options) ->
  params = 
    timestamp: timestamp(),
    transformation: utils.generate_transformation_string(options),
    public_id: options.public_id,
    callback: options.callback,
    format: options.format,
    type: options.type,
    tags: options.tags ? utils.build_array(options.tags).join(",")
  if options.eager?
    params.eager = (for transformation, format of utils.build_array(options.eager)
      transformation = _.clone(transformation)
      format = transformation.format ? format
      _.filter([utils.generate_transformation_string(transformation), format], utils.present).join("/")
    ).join("|")
  params
 
exports.upload = (file, callback, options={}) ->
  call_api "upload", callback, options, ->
    params = build_upload_params(options)
    if file.match(/^https?:/)
      params.file = file
      return params
    else 
      return [params, file]

exports.destroy = (public_id, callback, options={}) ->
  call_api "destroy", callback, options, ->
    return timestamp: timestamp(), type: options.type, public_id:  public_id

TEXT_PARAMS = ["public_id", "font_family", "font_size", "font_color", "text_align", "font_weight", "font_style", "background", "opacity", "text_decoration"]
exports.text = (text, callback, options={}) ->
  call_api "text", callback, options, ->
    params = {timestamp: timestamp(), text: text}
    for k in TEXT_PARAMS when options[k]?
      params[k] = options[k]
    [params]
  
exports.generate_sprite = (tag, callback, options={}) ->
  call_api "sprite", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend(options, fetch_format: options.format))
    return [{timestamp: timestamp(), tag: tag, transformation: transformation}]

# options may include 'exclusive' (boolean) which causes clearing this tag from all other resources 
exports.add_tag = (tag, callback, public_ids = [], options = {}) ->
  exclusive = utils.option_consume("exclusive", options)
  command = if exclusive then "set_exclusive" else "add"
  call_tags_api(tag, command, callback, public_ids, options)

exports.remove_tag = (tag, callback, public_ids = [], options = {}) ->
  call_tags_api(tag, "remove", callback, public_ids, options)

exports.replace_tag = (tag, callback, public_ids = [], options = {}) ->
  call_tags_api(tag, "replace", callback, public_ids, options)

call_tags_api = (tag, command, callback, public_ids = [], options = {}) ->
  call_api "tags", callback, options, ->
    return [{timestamp: timestamp, tag: tag, public_ids:  utils.build_array(public_ids), command:  command}]
   
call_api = (action, callback, options, get_params) ->
  options = _.clone(options)
  api_key = options.api_key ? config().api_key ? throw("Must supply api_key")
  api_secret = options.api_secret ? config().api_secret ? throw("Must supply api_secret")

  [params, file] = get_params.call()
  
  params.signature = utils.api_sign_request(params, api_secret)
  params.api_key = api_key

  api_url = utils.api_url(action, resource_type: options.resource_type, upload_prefix: options.upload_prefix)
  
  boundary = utils.random_public_id()

  handle_response = (res) ->
    if _.include([200,400,401,500], res.statusCode)
      buffer = ""
      error = false
      res.on "data", (d) -> buffer += d
      res.on "end", ->
        return if error
        result = JSON.parse(buffer)
        result["error"]["http_code"] = res.statusCode if result["error"]
        callback(result)
      res.on "error", (e) ->
        error = true
        callback(error: e)
    else
      callback(error: {message: "Server returned unexpected status code - #{res.statusCode}"})

  post_data = (new Buffer(EncodeFieldPart(boundary, key, value), 'ascii') for key, value of params when utils.present(value))
  if file?
    post_data.push(new Buffer(EncodeFilePart(boundary, 'application/octet-stream', 'file', path.basename(file)), 'binary'));

    file_reader = fs.createReadStream(file, {encoding: 'binary'});
    file_contents = '';
    file_reader.on 'data', (data) -> file_contents += data;
    file_reader.on 'end', ->
      post_data.push(new Buffer(file_contents, 'binary'))
      post_data.push(new Buffer("\r\n--" + boundary + "--"), 'ascii');
      post api_url, post_data, boundary, handle_response
  else
    post_data.push(new Buffer("--" + boundary + "--"), 'ascii');
    post api_url, post_data, boundary, handle_response

post = (url, post_data, boundary, callback) ->
  length = 0
  for i in [0..post_data.length-1]
    length += post_data[i].length

  post_options = require('url').parse(url)
  post_options = _.extend post_options,
    port: '443',
    #host: 'localhost', 
    #port: 8081,
    #protocol: 'http:',
    #path: "/",
    method: 'POST',
    headers: 
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': length

  post_request = https.request(post_options, callback)
  post_request.setTimeout 60

  for i in [0..post_data.length-1]
    post_request.write(post_data[i])
  post_request.end()

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

