###*
  * Utilities
  * @module utils
  * @borrows module:auth_token as generate_auth_token
###

_ = require("lodash")
config = require("./config")
crypto = require('crypto')
querystring = require('querystring')
url = require('url')

utils = exports
generate_token = require("./auth_token")
exports.generate_auth_token = (options)->
  token_options = Object.assign {}, config().auth_token, options
  generate_token token_options

exports.CF_SHARED_CDN = "d3jpl91pxevbkh.cloudfront.net"
exports.OLD_AKAMAI_SHARED_CDN = "cloudinary-a.akamaihd.net"
exports.AKAMAI_SHARED_CDN = "res.cloudinary.com"
exports.SHARED_CDN = exports.AKAMAI_SHARED_CDN

try
  exports.VERSION = require('../package.json').version
catch


exports.USER_AGENT = "CloudinaryNodeJS/#{exports.VERSION}"
# Add platform information to the USER_AGENT header
# This is intended for platform information and not individual applications!
exports.userPlatform = ""
exports.getUserAgent = ()->
  if _.isEmpty(utils.userPlatform)
    "#{utils.USER_AGENT}"
  else
    "#{utils.userPlatform} #{utils.USER_AGENT}"

DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION = {width: "auto", crop: "limit"}
exports.DEFAULT_POSTER_OPTIONS = {format: 'jpg', resource_type: 'video'}
exports.DEFAULT_VIDEO_SOURCE_TYPES = ['webm', 'mp4', 'ogv']

CONDITIONAL_OPERATORS =
  "=": 'eq'
  "!=": 'ne'
  "<": 'lt'
  ">": 'gt'
  "<=": 'lte'
  ">=": 'gte'
  "&&": 'and'
  "||": 'or'
  "*": "mul"
  "/": "div"
  "+": "add"
  "-": "sub"


PREDEFINED_VARS =
  "aspect_ratio": "ar"
  "aspectRatio": "ar"
  "current_page": "cp"
  "currentPage": "cp"
  "face_count": "fc"
  "faceCount": "fc"
  "height": "h"
  "initial_aspect_ratio": "iar"
  "initial_height": "ih"
  "initial_width": "iw"
  "initialAspectRatio": "iar"
  "initialHeight": "ih"
  "initialWidth": "iw"
  "page_count": "pc"
  "page_x": "px"
  "page_y": "py"
  "pageCount": "pc"
  "pageX": "px"
  "pageY": "py"
  "tags": "tags"
  "width": "w"

LAYER_KEYWORD_PARAMS =
  font_weight: "normal"
  font_style: "normal"
  text_decoration: "none"
  text_align: null
  stroke: "none"

textStyle = (layer)->
  font_family = layer["font_family"]
  font_size = layer["font_size"]
  keywords = []
  for attr, default_value of LAYER_KEYWORD_PARAMS
    attr_value = layer[attr] || default_value
    keywords.push(attr_value) unless attr_value == default_value
  letter_spacing = layer["letter_spacing"]
  keywords.push("letter_spacing_#{letter_spacing}") if letter_spacing
  line_spacing = layer["line_spacing"]
  keywords.push("line_spacing_#{line_spacing}") if line_spacing
  if font_size || font_family || !_.isEmpty(keywords)
    raise(CloudinaryException, "Must supply font_family for text in overlay/underlay") unless font_family
    raise(CloudinaryException, "Must supply font_size for text in overlay/underlay") unless font_size
    keywords.unshift(font_size)
    keywords.unshift(font_family)
    _.compact(keywords).join("_")

###*
  * Parse "if" parameter
  * Translates the condition if provided.
  * @return [string] "if_" + ifValue
  * @private
###
normalize_expression = (expression) ->
  return expression if !_.isString(expression) || expression.length == 0 || expression.match(/^!.+!$/)

  operators = "\\|\\||>=|<=|&&|!=|>|=|<|/|-|\\+|\\*"
  pattern = "((" + operators + ")(?=[ _])|" + Object.keys(PREDEFINED_VARS).join("|") + ")"
  replaceRE = new RegExp(pattern, "g")
  expression = expression.replace replaceRE, (match)->
    CONDITIONAL_OPERATORS[match] || PREDEFINED_VARS[match]
  expression.replace(/[ _]+/g, '_')

process_if = (ifValue)->
  if ifValue
    "if_" + normalize_expression(ifValue)
  else
    ifValue

###*
  * Parse layer options
  * @return [string] layer transformation string
  * @private
###
process_layer = (layer)->
  if _.isPlainObject(layer)
    public_id = layer["public_id"]
    format = layer["format"]
    resource_type = layer["resource_type"] || "image"
    type = layer["type"] || "upload"
    text = layer["text"]
    style = null
    components = []

    unless _.isEmpty(public_id)
      public_id = public_id.replace(new RegExp("/", 'g'), ":")
      public_id = "#{public_id}.#{format}" if format?

    if _.isEmpty(text) && resource_type != "text"
      if _.isEmpty(public_id)
        throw "Must supply public_id for resource_type layer_parameter"
      if resource_type == "subtitles"
        style = textStyle(layer)

    else
      resource_type = "text"
      type = null
      # // type is ignored for text layers
      style = textStyle(layer)
      unless _.isEmpty(text)
        unless _.isEmpty(public_id) ^ _.isEmpty(style)
          throw "Must supply either style parameters or a public_id when providing text parameter in a text overlay/underlay"
        re = /\$\([a-zA-Z]\w*\)/g
        start = 0
#        textSource = text.replace(new RegExp("[,/]", 'g'), (c)-> "%#{c.charCodeAt(0).toString(16).toUpperCase()}")
        textSource = smart_escape(decodeURIComponent(text), /[,/]/g)
        text = ""
        while res = re.exec(textSource)
          text += smart_escape(textSource.slice(start, res.index))
          text += res[0]
          start = res.index + res[0].length
        text += encodeURIComponent(textSource.slice(start))
        # console.log("NADAV = #{text}")
    # console.log("NADAV = #{text}")
    components.push(resource_type) if resource_type != "image"
    components.push(type) if type != "upload"
    components.push(style)
    components.push(public_id)
    components.push(text)
    layer = _.compact(components).join(":")
  layer

exports.build_upload_params = (options) ->
  params =
    access_mode: options.access_mode
    allowed_formats: options.allowed_formats && utils.build_array(options.allowed_formats).join(",")
    backup: utils.as_safe_bool(options.backup)
    callback: options.callback
    colors: utils.as_safe_bool(options.colors)
    discard_original_filename: utils.as_safe_bool(options.discard_original_filename)
    eager: utils.build_eager(options.eager)
    eager_async: utils.as_safe_bool(options.eager_async)
    eager_notification_url: options.eager_notification_url
    exif: utils.as_safe_bool(options.exif)
    faces: utils.as_safe_bool(options.faces)
    folder: options.folder
    format: options.format
    image_metadata: utils.as_safe_bool(options.image_metadata)
    invalidate: utils.as_safe_bool(options.invalidate)
    moderation: options.moderation
    notification_url: options.notification_url
    overwrite: utils.as_safe_bool(options.overwrite)
    phash: utils.as_safe_bool(options.phash)
    proxy: options.proxy
    public_id: options.public_id
    responsive_breakpoints: utils.generate_responsive_breakpoints_string(options["responsive_breakpoints"])
    return_delete_token: utils.as_safe_bool(options.return_delete_token)
    timestamp: exports.timestamp()
    transformation: utils.generate_transformation_string(_.clone(options))
    type: options.type
    unique_filename: utils.as_safe_bool(options.unique_filename)
    upload_preset: options.upload_preset
    use_filename: utils.as_safe_bool(options.use_filename)
  utils.updateable_resource_params(options, params)

exports.timestamp = ->
  Math.floor(new Date().getTime() / 1000)

###*
# Deletes `option_name` from `options` and return the value if present.
# If `options` doesn't contain `option_name` the default value is returned.
# @param {Object} options a collection
# @param {String} option_name the name (key) of the desired value
# @param [default_value] the value to return is option_name is missing
###
exports.option_consume = (options, option_name, default_value) ->
  result = options[option_name]
  delete options[option_name]

  if result? then result else default_value

exports.build_array = (arg) ->
  if !arg?
    []
  else if _.isArray(arg)
    arg
  else
    [arg]

exports.encode_double_array = (array) ->
  array = utils.build_array(array)
  if array.length > 0 and _.isArray(array[0])
    array.map((e) -> utils.build_array(e).join(",")).join("|")
  else
    array.join(",")

exports.encode_key_value = (arg) ->
  if _.isObject(arg)
    pairs = for k, v of arg
      "#{k}=#{v}"
    pairs.join("|")
  else
    arg

exports.encode_context = (arg) ->
  if _.isObject(arg)
    pairs = for k, v of arg
      v = v.replace /([=|])/g, (match)-> "\\#{match}"
      "#{k}=#{v}"
    pairs.join("|")
  else
    arg

exports.build_eager = (transformations) ->
  (for transformation in utils.build_array(transformations)
    transformation = _.clone(transformation)
    _.filter([utils.generate_transformation_string(transformation), transformation.format], utils.present).join("/")
  ).join("|")

exports.build_custom_headers = (headers) ->
  switch
    when !headers?
      undefined
    when _.isArray headers
      headers.join "\n"
    when _.isObject headers
      [k + ": " + v for k, v of headers].join "\n"
    else
      headers

exports.present = (value) ->
  not _.isUndefined(value) and ("" + value).length > 0

exports.generate_transformation_string = (options) ->
  if _.isArray(options)
    result = for base_transformation in options
      utils.generate_transformation_string(_.clone(base_transformation))
    return result.join("/")

  responsive_width = utils.option_consume(options, "responsive_width", config().responsive_width)
  width = options["width"]
  height = options["height"]
  size = utils.option_consume(options, "size")
  [options["width"], options["height"]] = [width, height] = size.split("x") if size

  has_layer = options.overlay or options.underlay
  crop = utils.option_consume(options, "crop")
  angle = utils.build_array(utils.option_consume(options, "angle")).join(".")
  no_html_sizes = has_layer or utils.present(angle) or crop == "fit" or crop == "limit" or responsive_width

  delete options["width"] if width and (width.toString().indexOf("auto") == 0 or no_html_sizes or parseFloat(width) < 1)
  delete options["height"] if height and (no_html_sizes or parseFloat(height) < 1)

  background = utils.option_consume(options, "background")
  background = background and background.replace(/^#/, "rgb:")
  color = utils.option_consume(options, "color")
  color = color and color.replace(/^#/, "rgb:")
  base_transformations = utils.build_array(utils.option_consume(options, "transformation", []))
  named_transformation = []
  if base_transformations.length != 0 and _.filter(base_transformations, _.isObject).length > 0
    base_transformations = _.map(base_transformations, (base_transformation) ->
      if _.isObject(base_transformation)
        utils.generate_transformation_string(_.clone(base_transformation))
      else
        utils.generate_transformation_string(transformation: base_transformation)
    )
  else
    named_transformation = base_transformations.join(".")
    base_transformations = []

  effect = utils.option_consume(options, "effect")

  if _.isArray(effect)
    effect = effect.join(":")
  else if _.isObject(effect)
    effect = "#{key}:#{value}" for key,value of effect

  border = utils.option_consume(options, "border")
  if _.isObject(border)
    border = "#{border.width ? 2}px_solid_#{(border.color ? "black").replace(/^#/, 'rgb:')}"
  else if /^\d+$/.exec(border) #fallback to html border attributes
    options.border = border
    border = undefined

  flags = utils.build_array(utils.option_consume(options, "flags")).join(".")
  dpr = utils.option_consume(options, "dpr", config().dpr)

  if options["offset"]?
    [options["start_offset"], options["end_offset"]] = split_range(utils.option_consume(options, "offset"))

  overlay = process_layer(utils.option_consume(options, "overlay"))
  underlay = process_layer(utils.option_consume(options, "underlay"))
  ifValue = process_if(utils.option_consume(options, "if"))

  params =
    a: normalize_expression(angle)
    ar: normalize_expression(utils.option_consume(options, "aspect_ratio"))
    b: background
    bo: border
    c: crop
    co: color
    dpr: normalize_expression(dpr)
    e: normalize_expression(effect)
    fl: flags
    h: normalize_expression(height)
    l: overlay
    o: normalize_expression(utils.option_consume(options, "opacity"))
    q: normalize_expression(utils.option_consume(options, "quality"))
    r: normalize_expression(utils.option_consume(options, "radius"))
    t: named_transformation
    u: underlay
    w: normalize_expression(width)
    x: normalize_expression(utils.option_consume(options, "x"))
    y: normalize_expression(utils.option_consume(options, "y"))
    z: normalize_expression(utils.option_consume(options, "zoom"))

  simple_params =
    audio_codec: "ac"
    audio_frequency: "af"
    bit_rate: 'br'
    color_space: "cs"
    default_image: "d"
    delay: "dl"
    density: "dn"
    duration: "du"
    end_offset: "eo"
    fetch_format: "f"
    gravity: "g"
    page: "pg"
    prefix: "p"
    start_offset: "so"
    streaming_profile: "sp"
    video_codec: "vc"
    video_sampling: "vs"

  for param, short of simple_params
    params[short] = utils.option_consume(options, param)

  params["vc"] = process_video_params(params["vc"]) if params["vc"]?
  for range_value in ["so", "eo", "du"]
    params[range_value] = norm_range_value(params[range_value]) if range_value of params

  variables = utils.option_consume(options, "variables")
  var_params = []
  for key, value of options when key.match(/^\$/)
    delete options[key]
    var_params.push "#{key}_#{normalize_expression(value)}"

  var_params = var_params.sort()
  unless _.isEmpty(variables)
    for [name, value] in variables
      var_params.push "#{name}_#{normalize_expression(value)}"
  variables = var_params.filter((x)->x).join(',')
  sortedParams = []
  keys = Object.keys(params)
  keys.sort()
  keys.forEach (key) ->
    if utils.present(params[key])
      sortedParams.push key + '_' + params[key]
    return
  transformations = sortedParams.join(',')
  raw_transformation = utils.option_consume(options, 'raw_transformation')
  transformations = _.compact([ifValue, variables, transformations, raw_transformation]).join(",")
  base_transformations.push transformations
  transformations = base_transformations
  if responsive_width
    responsive_width_transformation = config().responsive_width_transformation or DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION
    transformations.push utils.generate_transformation_string(_.clone(responsive_width_transformation))
  if width?.toString().indexOf("auto") == 0 or responsive_width
    options.responsive = true
  if dpr == "auto"
    options.hidpi = true
  _.filter(transformations, utils.present).join "/"

exports.updateable_resource_params = (options, params = {}) ->
  params.auto_tagging = options.auto_tagging if options.auto_tagging?
  params.background_removal = options.background_removal if options.background_removal?
  params.categorization = options.categorization if options.categorization?
  params.context = utils.encode_context(options.context) if options.context?
  params.custom_coordinates = utils.encode_double_array(options.custom_coordinates) if options.custom_coordinates?
  params.detection = options.detection if options.detection?
  params.face_coordinates = utils.encode_double_array(options.face_coordinates) if options.face_coordinates?
  params.headers = utils.build_custom_headers(options.headers) if options.headers?
  params.ocr = options.ocr if options.ocr?
  params.raw_convert = options.raw_convert if options.raw_convert?
  params.similarity_search = options.similarity_search if options.similarity_search?
  params.tags = utils.build_array(options.tags).join(",") if options.tags?

  params

exports.url = (public_id, options = {}) ->
  type = utils.option_consume(options, "type", null)
  options.fetch_format ?= utils.option_consume(options, "format") if type is "fetch"
  transformation = utils.generate_transformation_string(options)
  resource_type = utils.option_consume(options, "resource_type", "image")
  version = utils.option_consume(options, "version")
  format = utils.option_consume(options, "format")
  cloud_name = utils.option_consume(options, "cloud_name", config().cloud_name)
  throw "Unknown cloud_name"  unless cloud_name
  private_cdn = utils.option_consume(options, "private_cdn", config().private_cdn)
  secure_distribution = utils.option_consume(options, "secure_distribution", config().secure_distribution)
  secure = utils.option_consume(options, "secure", null)
  ssl_detected = utils.option_consume(options, "ssl_detected", config().ssl_detected)
  secure = ssl_detected || config().secure if secure == null
  cdn_subdomain = utils.option_consume(options, "cdn_subdomain", config().cdn_subdomain)
  secure_cdn_subdomain = utils.option_consume(options, "secure_cdn_subdomain", config().secure_cdn_subdomain)
  cname = utils.option_consume(options, "cname", config().cname)
  shorten = utils.option_consume(options, "shorten", config().shorten)
  sign_url = utils.option_consume(options, "sign_url", config().sign_url)
  api_secret = utils.option_consume(options, "api_secret", config().api_secret)
  url_suffix = utils.option_consume(options, "url_suffix")
  use_root_path = utils.option_consume(options, "use_root_path", config().use_root_path)
  auth_token = utils.option_consume(options, "auth_token")
  if auth_token != false
    auth_token = exports.merge config().auth_token, auth_token

  preloaded = /^(image|raw)\/([a-z0-9_]+)\/v(\d+)\/([^#]+)$/.exec(public_id)
  if preloaded
    resource_type = preloaded[1]
    type = preloaded[2]
    version = preloaded[3]
    public_id = preloaded[4]

  if url_suffix and not private_cdn
    throw 'URL Suffix only supported in private CDN'


  original_source = public_id
  return original_source unless public_id?
  public_id = public_id.toString()

  if type == null && public_id.match(/^https?:\//i)
    return original_source

  [ resource_type , type ] = finalize_resource_type(resource_type, type, url_suffix, use_root_path, shorten)
  [ public_id, source_to_sign ]= finalize_source(public_id, format, url_suffix)


  version ?= 1 if source_to_sign.indexOf("/") > 0 && !source_to_sign.match(/^v[0-9]+/) && !source_to_sign.match(/^https?:\//)
  version = "v#{version}" if version?

  transformation = transformation.replace(/([^:])\/\//g, '$1/')
  if sign_url && _.isEmpty(auth_token)
    to_sign = [transformation, source_to_sign].filter((part) -> part? && part != '').join('/')
    shasum = crypto.createHash('sha1')
    shasum.update(utf8_encode(to_sign + api_secret), 'binary')
    signature = shasum.digest('base64').replace(/\//g, '_').replace(/\+/g, '-').substring(0, 8)
    signature = "s--#{signature}--"


  prefix = unsigned_url_prefix(public_id, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution)
  resultUrl = [prefix, resource_type, type, signature, transformation, version,
    public_id].filter((part) -> part? && part != '').join('/')
  if sign_url && !_.isEmpty(auth_token)
    auth_token.url = url.parse(resultUrl).path
    token = generate_token( auth_token)
    resultUrl += "?#{token}"
  resultUrl

exports.video_url = (public_id, options) ->
  options = _.extend({resource_type: 'video'}, options)
  utils.url(public_id, options)

finalize_source = (source, format, url_suffix) ->
  source = source.replace(/([^:])\/\//g, '$1/')
  if source.match(/^https?:\//i)
    source = smart_escape(source)
    source_to_sign = source
  else
    source = encodeURIComponent(decodeURIComponent(source)).replace(/%3A/g, ":").replace(/%2F/g, "/")
    source_to_sign = source
    if !!url_suffix
      throw new Error('url_suffix should not include . or /') if url_suffix.match(/[\.\/]/)
      source = source + '/' + url_suffix
    if format?
      source = source + '.' + format
      source_to_sign = source_to_sign + '.' + format
  [source, source_to_sign]

exports.video_thumbnail_url = (public_id, options) ->
  options = _.extend({}, exports.DEFAULT_POSTER_OPTIONS, options)
  utils.url(public_id, options)

finalize_resource_type = (resource_type, type, url_suffix, use_root_path, shorten) ->
  type?='upload'
  if url_suffix?
    if resource_type == 'image' && type == 'upload'
      resource_type = "images"
      type = null
    else if resource_type == 'raw' && type == 'upload'
      resource_type = 'files'
      type = null
    else
      throw new Error("URL Suffix only supported for image/upload and raw/upload")
  if use_root_path
    if (resource_type == 'image' && type == 'upload') || (resource_type == 'images' && !type?)
      resource_type = null
      type = null
    else
      throw new Error("Root path only supported for image/upload")
  if shorten && resource_type == 'image' && type == 'upload'
    resource_type = 'iu'
    type = null
  [resource_type, type]

# cdn_subdomain and secure_cdn_subdomain
# 1) Customers in shared distribution (e.g. res.cloudinary.com)
#   if cdn_domain is true uses res-[1-5].cloudinary.com for both http and https. Setting secure_cdn_subdomain to false disables this for https.
# 2) Customers with private cdn 
#   if cdn_domain is true uses cloudname-res-[1-5].cloudinary.com for http
#   if secure_cdn_domain is true uses cloudname-res-[1-5].cloudinary.com for https (please contact support if you require this)
# 3) Customers with cname
#   if cdn_domain is true uses a[1-5].cname for http. For https, uses the same naming scheme as 1 for shared distribution and as 2 for private distribution.
#
unsigned_url_prefix = (source, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution) ->
  return '/res' + cloud_name if cloud_name.indexOf("/") == 0

  shared_domain = !private_cdn

  if secure
    if !secure_distribution? || secure_distribution == exports.OLD_AKAMAI_SHARED_CDN
      secure_distribution = if private_cdn then cloud_name + "-res.cloudinary.com" else exports.SHARED_CDN
    shared_domain ?= secure_distribution == exports.SHARED_CDN
    secure_cdn_subdomain = cdn_subdomain if !secure_cdn_subdomain? && shared_domain

    if secure_cdn_subdomain
      secure_distribution = secure_distribution.replace('res.cloudinary.com', 'res-' + ((crc32(source) % 5) + 1 + '.cloudinary.com'))

    prefix = 'https://' + secure_distribution
  else if cname
    subdomain = if cdn_subdomain then 'a' + ((crc32(source) % 5) + 1) + '.' else ''
    prefix = 'http://' + subdomain + cname
  else
    cdn_part = if private_cdn then cloud_name + '-' else ''
    subdomain_part = if cdn_subdomain then '-' + ((crc32(source) % 5) + 1) else ''
    host = [cdn_part, 'res', subdomain_part, '.cloudinary.com'].join('')
    prefix = 'http://' + host

  prefix += '/' + cloud_name if shared_domain
  prefix


# Based on CGI::unescape. In addition does not escape / :
#smart_escape = (string)->
#  encodeURIComponent(string).replace(/%3A/g, ":").replace(/%2F/g, "/")
smart_escape = (string, unsafe = /([^a-zA-Z0-9_.\-\/:]+)/g)->
  string.replace unsafe, (match)->
    match.split("").map((c)-> "%"+c.charCodeAt(0).toString(16).toUpperCase()).join("")

# http://kevin.vanzonneveld.net
# +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
# +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
# +   improved by: sowberry
# +    tweaked by: Jack
# +   bugfixed by: Onno Marsman
# +   improved by: Yves Sucaet
# +   bugfixed by: Onno Marsman
# +   bugfixed by: Ulrich
# +   bugfixed by: Rafal Kukawski
# +   improved by: kirilloid
# *     example 1: utf8_encode('Kevin van Zonneveld')
# *     returns 1: 'Kevin van Zonneveld'
utf8_encode = (argString) ->
  return "" unless argString?
  string = (argString + "")
  utftext = ""
  start = undefined
  end = undefined
  stringl = 0
  start = end = 0
  stringl = string.length
  n = 0

  while n < stringl
    c1 = string.charCodeAt(n)
    enc = null
    if c1 < 128
      end++
    else if c1 > 127 and c1 < 2048
      enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128)
    else
      enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128)
    if enc isnt null
      utftext += string.slice(start, end)  if end > start
      utftext += enc
      start = end = n + 1
    n++
  utftext += string.slice(start, stringl)  if end > start
  utftext

# http://kevin.vanzonneveld.net
# +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
# +   improved by: T0bsn
# +   improved by: http://stackoverflow.com/questions/2647935/javascript-crc32-function-and-php-crc32-not-matching
# -    depends on: utf8_encode
# *     example 1: crc32('Kevin van Zonneveld')
# *     returns 1: 1249991249
crc32 = (str) ->
  str = utf8_encode(str)
  table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D"
  crc = 0
  x = 0
  y = 0
  crc = crc ^ (-1)
  i = 0
  iTop = str.length

  while i < iTop
    y = (crc ^ str.charCodeAt(i)) & 0xFF
    x = "0x" + table.substr(y * 9, 8)
    crc = (crc >>> 8) ^ x
    i++
  crc = crc ^ (-1)
  crc += 4294967296  if crc < 0
  crc

exports.api_url = (action = 'upload', options = {}) ->
  cloudinary = options["upload_prefix"] ? config().upload_prefix ? "https://api.cloudinary.com"
  cloud_name = options["cloud_name"] ? config().cloud_name ? throw("Must supply cloud_name")
  resource_type = options["resource_type"] ? "image"
  return [cloudinary, "v1_1", cloud_name, resource_type, action].join("/")

exports.random_public_id = ->
  crypto.randomBytes(12).toString('base64').replace(/[^a-z0-9]/g, "")

exports.signed_preloaded_image = (result) ->
  "#{result.resource_type}/upload/v#{result.version}/#{_.filter([result.public_id,
    result.format], utils.present).join(".")}##{result.signature}"

exports.api_sign_request = (params_to_sign, api_secret) ->
  to_sign = _.sortBy("#{k}=#{utils.build_array(v).join(",")}" for k, v of params_to_sign when v?, _.identity).join("&")
  shasum = crypto.createHash('sha1')
  shasum.update(utf8_encode(to_sign + api_secret), 'binary')
  shasum.digest('hex')

exports.clear_blank = (hash) ->
  filtered_hash = {}
  for k, v of hash when exports.present(v)
    filtered_hash[k] = hash[k]
  filtered_hash

exports.merge = (hash1, hash2) ->
  result = {}
  result[k] = hash1[k] for k, v of hash1
  result[k] = hash2[k] for k, v of hash2
  result

exports.sign_request = (params, options = {}) ->
  api_key = options.api_key ? config().api_key ? throw("Must supply api_key")
  api_secret = options.api_secret ? config().api_secret ? throw("Must supply api_secret")
  params = exports.clear_blank(params)
  params.signature = exports.api_sign_request(params, api_secret)
  params.api_key = api_key

  return params

exports.webhook_signature = (data, timestamp, options = {}) ->
  throw "Must supply data"  unless data
  throw "Must supply timestamp"  unless timestamp
  api_secret = options.api_secret ? config().api_secret ? throw("Must supply api_secret")
  shasum = crypto.createHash('sha1')
  shasum.update(data + timestamp + api_secret, 'binary')
  shasum.digest('hex')

exports.process_request_params = (params, options) ->
  if options.unsigned? && options.unsigned
    params = exports.clear_blank(params)
    delete params["timestamp"]
  else
    params = exports.sign_request(params, options)
  params

exports.private_download_url = (public_id, format, options = {}) ->
  params = exports.sign_request({
    timestamp: exports.timestamp(),
    public_id: public_id,
    format: format,
    type: options.type,
    attachment: options.attachment,
    expires_at: options.expires_at
  }, options)
  exports.api_url("download", options) + "?" + querystring.stringify(params)

###*
# Utility method that uses the deprecated ZIP download API.
# @deprecated Replaced by {download_zip_url} that uses the more advanced and robust archive generation and download API
###
exports.zip_download_url = (tag, options = {}) ->
  params = exports.sign_request({
    timestamp: exports.timestamp(),
    tag: tag,
    transformation: utils.generate_transformation_string(options)
  }, options)
  exports.api_url("download_tag.zip", options) + "?" + hashToQuery(params)

###*
# Returns a URL that when invokes creates an archive and returns it.
# @param options [Hash]
# @param {string} [options.resource_type="image"]  The resource type of files to include in the archive. Must be one of :image | :video | :raw
# @param {string} [options.type="upload"] The specific file type of resources: :upload|:private|:authenticated
# @param {string|Array} [options.tags] list of tags to include in the archive
# @param {string|Array<string>} [options.public_ids] list of public_ids to include in the archive
# @param {string|Array<string>} [options.prefixes]  list of prefixes of public IDs (e.g., folders).
# @param {string|Array<string>} [options.transformations]  list of transformations.
#   The derived images of the given transformations are included in the archive. Using the string representation of
#   multiple chained transformations as we use for the 'eager' upload parameter.
# @param {string} [options.mode="create"] return the generated archive file or to store it as a raw resource and
#   return a JSON with URLs for accessing the archive. Possible values: :download, :create
# @param {string} [options.target_format="zip"]
# @param {string} [options.target_public_id]  public ID of the generated raw resource.
#   Relevant only for the create mode. If not specified, random public ID is generated.
# @param {boolean} [options.flatten_folders=false] If true, flatten public IDs with folders to be in the root of the archive.
#   Add numeric counter to the file name in case of a name conflict.
# @param {boolean} [options.flatten_transformations=false] If true, and multiple transformations are given,
#   flatten the folder structure of derived images and store the transformation details on the file name instead.
# @param {boolean} [options.use_original_filename] Use the original file name of included images (if available) instead of the public ID.
# @param {boolean} [options.async=false] If true, return immediately and perform the archive creation in the background.
#   Relevant only for the create mode.
# @param {string} [options.notification_url]  URL to send an HTTP post request (webhook) when the archive creation is completed.
# @param {string|Array<string} [options.target_tags=]  array. Allows assigning one or more tag to the generated archive file (for later housekeeping via the admin API).
# @param {string} [options.keep_derived=false] keep the derived images used for generating the archive
# @return [String] archive url
###
exports.download_archive_url = (options = {})->
  cloudinary_params = exports.sign_request(exports.archive_params(_.merge(options, mode: "download")), options)
  exports.api_url("generate_archive", options) + "?" + hashToQuery(cloudinary_params)

###*
# Returns a URL that when invokes creates an zip archive and returns it.
# @see download_archive_url
###
exports.download_zip_url = (options = {})->
  exports.download_archive_url(_.merge(options, target_format: "zip"))

join_pair = (key, value) ->
  if !value
    undefined
  else if value is true
    return key
  else
    return key + "='" + value + "'";

exports.html_attrs = (attrs) ->
  pairs = _.filter(_.map(attrs, (value, key) -> return join_pair(key, value)))
  pairs.sort()
  return pairs.join(" ")

CLOUDINARY_JS_CONFIG_PARAMS = ['api_key', 'cloud_name', 'private_cdn', 'secure_distribution', 'cdn_subdomain']
exports.cloudinary_js_config = ->
  params = {}
  for param in CLOUDINARY_JS_CONFIG_PARAMS
    value = config()[param]
    params[param] = value if value?
  "<script type='text/javascript'>\n" +
    "$.cloudinary.config(" + JSON.stringify(params) + ");\n" +
    "</script>\n"

v1_result_adapter = (callback) ->
  if callback?
    return (result) ->
      if result.error?
        callback(result.error)
      else
        callback(undefined, result)
  else
    null

v1_adapter = (name, num_pass_args, v1) ->
  return (args...) ->
    pass_args = _.take(args, num_pass_args)
    options = args[num_pass_args]
    callback = args[num_pass_args + 1]
    if !callback? && _.isFunction(options)
      callback = options
      options = {}
    callback = v1_result_adapter(callback)
    args = pass_args.concat([callback, options])
    return v1[name].apply(this, args)

exports.v1_adapters = (exports, v1, mapping) ->
  for name, num_pass_args of mapping
    exports[name] = v1_adapter(name, num_pass_args, v1)

exports.as_safe_bool = (value)->
  return undefined if !value?
  value = 1 if value == true || value == 'true' || value == '1'
  value = 0 if value == false || value == 'false' || value == '0'
  return value

number_pattern = "([0-9]*)\\.([0-9]+)|([0-9]+)"

offset_any_pattern = "(#{number_pattern})([%pP])?"

# Replace with ///(#{offset_any_pattern()})\.\.(#{offset_any_pattern()})///
# After jetbrains fixes bug
offset_any_pattern_re = RegExp("(#{offset_any_pattern})\\.\\.(#{offset_any_pattern})")

# Split a range into the start and end values
split_range = (range) -> # :nodoc:
  switch range.constructor
    when String
      range.split ".." if offset_any_pattern_re = ~range
    when Array
      [_.first(range), _.last(range)]
    else
      [null, null]

###*
# Normalize an offset value
# @param {String} value a decimal value which may have a 'p' or '%' postfix. E.g. '35%', '0.4p'
# @return {Object|String} a normalized String of the input value if possible otherwise the value itself
###
norm_range_value = (value) -> # :nodoc:
  offset = String(value).match(RegExp("^#{offset_any_pattern}$"))
  if offset
    modifier = if offset[5] then 'p' else ''
    value = "#{offset[1] || offset[4]}#{modifier}"
  value

###*
# A video codec parameter can be either a String or a Hash.
# @param {Object} param <code>vc_<codec>[ : <profile> : [<level>]]</code>
#                       or <code>{ codec: 'h264', profile: 'basic', level: '3.1' }</code>
# @return {String} <code><codec> : <profile> : [<level>]]</code> if a Hash was provided
#                   or the param if a String was provided.
#                   Returns null if param is not a Hash or String
###
process_video_params = (param) ->
  switch param.constructor
    when Object
      video = ""
      if 'codec' of param
        video = param['codec']
        if 'profile' of param
          video += ":" + param['profile']
          if 'level' of param
            video += ":" + param['level']
      video
    when String
      param
    else
      null

###*
# Returns a Hash of parameters used to create an archive
# @param [Hash] options
# @private
###
exports.archive_params = (options = {})->
  async: exports.as_safe_bool(options.async)
  flatten_folders: exports.as_safe_bool(options.flatten_folders)
  flatten_transformations: exports.as_safe_bool(options.flatten_transformations)
  keep_derived: exports.as_safe_bool(options.keep_derived)
  mode: options.mode
  notification_url: options.notification_url
  prefixes: options.prefixes && exports.build_array(options.prefixes)
  transformations: utils.build_eager(options.transformations)
  public_ids: options.public_ids && exports.build_array(options.public_ids)
  tags: options.tags && exports.build_array(options.tags)
  target_format: options.target_format
  target_public_id: options.target_public_id
  target_tags: options.target_tags && exports.build_array(options.target_tags)
  timestamp: (options.timestamp ? exports.timestamp())
  transformations: utils.build_eager(options.transformations)
  type: options.type
  use_original_filename: exports.as_safe_bool(options.use_original_filename)

build_custom_headers = (headers)->
  (for a in Array(headers) when a?.join?
    a.join(": ")
  ).join("\n")

exports.build_explicit_api_params = (public_id, options = {})->
  opt = [
    callback: options.callback
    colors: utils.as_safe_bool(options.colors)
    custom_coordinates: options.custom_coordinates && utils.encode_double_array(options.custom_coordinates)
    eager: utils.build_eager(options.eager)
    eager_async: utils.as_safe_bool(options.eager_async)
    eager_notification_url: options.eager_notification_url
    face_coordinates: options.face_coordinates && utils.encode_double_array(options.face_coordinates)
    headers: build_custom_headers(options.headers)
    image_metadata: utils.as_safe_bool(options.image_metadata)
    invalidate: utils.as_safe_bool(options.invalidate)
    moderation: options.moderation
    phash: utils.as_safe_bool(options.phash)
    public_id: public_id
    responsive_breakpoints: utils.generate_responsive_breakpoints_string(options.responsive_breakpoints)
    tags: options.tags && utils.build_array(options.tags).join(",")
    timestamp: (options.timestamp || exports.timestamp())
    type: options.type
  ]
  opt

exports.generate_responsive_breakpoints_string = (breakpoints)->
  return unless breakpoints?
  breakpoints = _.clone(breakpoints)
  unless _.isArray(breakpoints)
    breakpoints = [breakpoints]

  for breakpoint_settings in breakpoints
    if breakpoint_settings?
      transformation = breakpoint_settings.transformation
      delete breakpoint_settings.transformation
      if transformation
        breakpoint_settings.transformation = utils.generate_transformation_string(_.clone(transformation))
  JSON.stringify(breakpoints)

exports.build_streaming_profiles_param = (options={})->
  params = utils.only(options, "display_name", "representations")
  if _.isArray(params["representations"])
    params["representations"] = JSON.stringify(params["representations"].map (r)->
      {transformation: utils.generate_transformation_string(r.transformation)}
    )
  params

exports.only = (hash, keys...) ->
  result = {}
  for key in keys
    result[key] = hash[key] if hash[key]?
  result

###*
# @private
###
build_eager = (eager)->
  return undefined unless eager?
  ret = (for transformation in Array(eager)
    transformation = _.clone(transformation)
    format = transformation.format if transformation.format?
    delete transformation.format
    _.compact([utils.generate_transformation_string(transformation), format]).join("/")
  ).join("|")
  ret


hashToQuery = (hash)->
  _.compact(for key, value of hash
    if _.isArray(value)
      (for v in value
        key = "#{key}[]" unless key.match(/\w+\[\]/)
        "#{querystring.escape("#{key}")}=#{querystring.escape(v)}"
      ).join("&")
    else
      "#{querystring.escape(key)}=#{querystring.escape(value)}"
  ).sort().join('&')

