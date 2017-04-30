_ = require("lodash")
config = require("./config")
if config().upload_prefix && config().upload_prefix[0..4] == 'http:'
  https = require('http')
else
  https = require('https')
utils = require("./utils")
querystring = require("querystring")
Q = require('q')

api = module.exports

call_api = (method, uri, params, callback, options) ->
  deferred = Q.defer()
  cloudinary = options["upload_prefix"] ? config("upload_prefix") ? "https://api.cloudinary.com"
  cloud_name = options["cloud_name"] ? config("cloud_name") ? throw("Must supply cloud_name")
  api_key = options["api_key"] ? config("api_key") ? throw("Must supply api_key")
  api_secret = options["api_secret"] ? config("api_secret") ? throw("Must supply api_secret")
  api_url = [cloudinary, "v1_1", cloud_name].concat(uri).join("/")
  content_type ='application/x-www-form-urlencoded'
  if options['content_type']=='json'
    query_params = JSON.stringify(params)
    content_type='application/json'
  else
    query_params = querystring.stringify(params)
  if method == "get"
    api_url += "?" + query_params

  request_options = require('url').parse(api_url)
  request_options = _.extend request_options,
    method: method.toUpperCase()
    headers:
      'Content-Type': content_type
      'User-Agent': utils.getUserAgent()
    auth: "#{api_key}:#{api_secret}"
  request_options.agent = options.agent if options.agent?
  request_options.headers['Content-Length'] = Buffer.byteLength(query_params) unless method == "get"
  handle_response = (res) ->
    if _.includes([200, 400, 401, 403, 404, 409, 420, 500], res.statusCode)
      buffer = ""
      error = false
      res.on "data", (d) -> buffer += d
      res.on "end", ->
        return if error
        try
          result = JSON.parse(buffer)
        catch e
          result = {error: {message: "Server return invalid JSON response. Status Code #{res.statusCode}"}}
        if result["error"]
          result["error"]["http_code"] = res.statusCode
        else
          result["rate_limit_allowed"] = parseInt(res.headers["x-featureratelimit-limit"])
          result["rate_limit_reset_at"] = new Date(res.headers["x-featureratelimit-reset"])
          result["rate_limit_remaining"] = parseInt(res.headers["x-featureratelimit-remaining"])

        if (result.error)
          deferred.reject(result)
        else
          deferred.resolve(result)
        callback?(result)
      res.on "error", (e) ->
        error = true
        err_obj = error: {message: e, http_code: res.statusCode}
        deferred.reject(err_obj.error)
        callback?(err_obj)
    else
      err_obj =
        error: {message: "Server returned unexpected status code - #{res.statusCode}", http_code: res.statusCode}
      deferred.reject(err_obj.error)
      callback?(err_obj)

  request = https.request(request_options, handle_response)
  request.on "error", (e) -> callback?(error: e)
  request.setTimeout options["timeout"] ? 60000

  if method != "get"
    request.write(query_params)

  request.end()

  return deferred.promise

transformation_string = (transformation) ->
  if _.isString(transformation)
    transformation
  else
    utils.generate_transformation_string(_.extend({}, transformation))

exports.ping = (callback, options = {}) ->
  call_api("get", ["ping"], {}, callback, options)

exports.usage = (callback, options = {}) ->
  call_api("get", ["usage"], {}, callback, options)

exports.resource_types = (callback, options = {}) ->
  call_api("get", ["resources"], {}, callback, options)

exports.resources = (callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"]
  uri = ["resources", resource_type]
  uri.push type if type?
  options.start_at = options.start_at.toUTCString() if options.start_at? && Object.prototype.toString.call(options.start_at) == '[object Date]'
  call_api("get", uri, api.only(options, "next_cursor", "max_results", "prefix", "tags", "context", "direction", "moderations", "start_at"), callback, options)

exports.resources_by_tag = (tag, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  uri = ["resources", resource_type, "tags", tag]
  call_api("get", uri, api.only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options)

exports.resources_by_context= (key,value, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  uri = ["resources", resource_type, "context"]
  params = api.only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations")
  params.key = key
  params.value = value if value?
  call_api("get", uri,params , callback, options)

exports.resources_by_moderation = (kind, status, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  uri = ["resources", resource_type, "moderations", kind, status]
  call_api("get", uri, api.only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options)

exports.resources_by_ids = (public_ids, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type]
  params = api.only(options, "tags", "context", "moderations")
  params["public_ids[]"] = public_ids
  call_api("get", uri, params, callback, options)

exports.resource = (public_id, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type, public_id]
  call_api("get", uri, api.only(options, "exif", "colors", "faces", "image_metadata", "pages", "phash", "coordinates", "max_results"), callback, options)

exports.restore = (public_ids, callback, options = {})->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type, "restore"]
  call_api("post", uri, {public_ids: public_ids}, callback, options)

exports.update = (public_id, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type, public_id]
  params = utils.updateable_resource_params(options)
  params.moderation_status = options.moderation_status if options.moderation_status?
  call_api("post", uri, params, callback, options)

exports.delete_resources = (public_ids, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type]
  call_api("delete", uri, _.extend({"public_ids[]": public_ids}, api.only(options, "keep_original", "invalidate")), callback, options)

exports.delete_resources_by_prefix = (prefix, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type]
  call_api("delete", uri, _.extend({prefix: prefix}, api.only(options, "keep_original", "next_cursor", "invalidate")), callback, options)

exports.delete_resources_by_tag = (tag, callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  uri = ["resources", resource_type, "tags", tag]
  call_api("delete", uri, api.only(options, "keep_original", "next_cursor", "invalidate"), callback, options)

exports.delete_all_resources = (callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type]
  call_api("delete", uri, _.extend({all: yes}, api.only(options, "keep_original", "next_cursor", "invalidate")), callback, options)

exports.delete_derived_resources = (derived_resource_ids, callback, options = {}) ->
  uri = ["derived_resources"]
  call_api("delete", uri, {"derived_resource_ids[]": derived_resource_ids}, callback, options)

exports.tags = (callback, options = {}) ->
  resource_type = options["resource_type"] ? "image"
  uri = ["tags", resource_type]
  call_api("get", uri, api.only(options, "next_cursor", "max_results", "prefix"), callback, options)

exports.transformations = (callback, options = {}) ->
  call_api("get", ["transformations"], api.only(options, "next_cursor", "max_results"), callback, options)

exports.transformation = (transformation, callback, options = {}) ->
  uri = ["transformations", transformation_string(transformation)]
  call_api("get", uri, api.only(options, "next_cursor", "max_results"), callback, options)

exports.delete_transformation = (transformation, callback, options = {}) ->
  uri = ["transformations", transformation_string(transformation)]
  call_api("delete", uri, {}, callback, options)

# updates - currently only supported update is the "allowed_for_strict" boolean flag
exports.update_transformation = (transformation, updates, callback, options = {}) ->
  uri = ["transformations", transformation_string(transformation)]
  params = api.only(updates, "allowed_for_strict")
  params.unsafe_update = transformation_string(updates.unsafe_update) if updates.unsafe_update?
  call_api("put", uri, params, callback, options)

exports.create_transformation = (name, definition, callback, options = {}) ->
  uri = ["transformations", name]
  call_api("post", uri, {transformation: transformation_string(definition)}, callback, options)


exports.upload_presets = (callback, options = {}) ->
  call_api("get", ["upload_presets"], api.only(options, "next_cursor", "max_results"), callback, options)

exports.upload_preset = (name, callback, options = {}) ->
  uri = ["upload_presets", name]
  call_api("get", uri, {}, callback, options)

exports.delete_upload_preset = (name, callback, options = {}) ->
  uri = ["upload_presets", name]
  call_api("delete", uri, {}, callback, options)

exports.update_upload_preset = (name, callback, options = {}) ->
  uri = ["upload_presets", name]
  params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), api.only(options, "unsigned", "disallow_public_id"))
  call_api("put", uri, params, callback, options)

exports.create_upload_preset = (callback, options = {}) ->
  uri = ["upload_presets"]
  params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), api.only(options, "name", "unsigned", "disallow_public_id"))
  call_api("post", uri, params, callback, options)

exports.root_folders = (callback, options = {}) ->
  uri = ["folders"]
  call_api("get", uri, {}, callback, options)

exports.sub_folders = (path, callback, options = {}) ->
  uri = ["folders", path]
  call_api("get", uri, {}, callback, options)

exports.upload_mappings = (callback, options = {})->
  params = api.only(options, "next_cursor", "max_results")
  call_api("get", "upload_mappings", params, callback, options)

exports.upload_mapping = (name = null, callback, options = {})->
  call_api("get", 'upload_mappings', {folder: name}, callback, options)

exports.delete_upload_mapping = (name, callback, options = {})->
  call_api("delete", 'upload_mappings', {folder: name}, callback, options)

exports.update_upload_mapping = (name, callback, options = {})->
  params = api.only(options, "template")
  params["folder"] = name
  call_api("put", 'upload_mappings', params, callback, options)

exports.create_upload_mapping = (name, callback, options = {})->
  params = api.only(options, "template")
  params["folder"] = name
  call_api("post", 'upload_mappings', params, callback, options)

publishResource = (byKey, value, callback, options={})->
  params = api.only(options, "type", "invalidate", "overwrite")
  params[byKey] = value
  resource_type = options.resource_type ? "image"
  uri = ["resources", resource_type, "publish_resources"]
  options = _.extend {resource_type: resource_type}, options
  call_api("post", uri, params, callback, options)

exports.publish_by_prefix = (prefix, callback, options={})->
  publishResource("prefix", prefix, callback,options)

exports.publish_by_tag = (tag, callback, options={})->
  publishResource("tag", tag, callback,options)

exports.publish_by_ids = (public_ids, callback, options={})->
  publishResource("public_ids", public_ids, callback,options)

exports.list_streaming_profiles = (callback, options = {})->
  call_api("get", "streaming_profiles", {}, callback, options)

exports.get_streaming_profile = (name, callback, options = {})->
  call_api("get", "streaming_profiles/#{name}", {}, callback, options)

exports.delete_streaming_profile = (name, callback, options = {})->
  call_api("delete", "streaming_profiles/#{name}", {}, callback, options)

exports.update_streaming_profile = (name, callback, options = {})->
  params = utils.build_streaming_profiles_param(options)
  call_api("put", "streaming_profiles/#{name}", params, callback, options)

exports.create_streaming_profile = (name, callback, options = {})->
  params = utils.build_streaming_profiles_param(options)
  params["name"] = name
  call_api("post", 'streaming_profiles', params, callback, options)

update_resources_access_mode = (access_mode, by_key, value, callback, options = {})->
  resource_type = options.resource_type ? "image"
  type = options.type ? "upload"
  params = { access_mode: access_mode}
#  by_key = by_key == 'ids' ? 'ids[]' : by_key
  params[by_key] = value
  call_api("post", "resources/#{resource_type}/#{type}/update_access_mode", params, callback, options)

exports.search = (params, callback, options= {})->
  options['content_type']='json'
  call_api("post", "resources/search", params, callback, options)

exports.update_resources_access_mode_by_prefix = (access_mode, prefix, callback, options = {})->
  update_resources_access_mode(access_mode, "prefix", prefix, callback, options)

exports.update_resources_access_mode_by_tag = (access_mode, tag, callback, options = {})->
  update_resources_access_mode(access_mode, "tag", tag, callback, options)

exports.update_resources_access_mode_by_ids = (access_mode, ids, callback, options = {})->
  update_resources_access_mode(access_mode, "public_ids[]", ids, callback, options)



exports.only = (hash, keys...) ->
  result = {}
  for key in keys
    result[key] = hash[key] if hash[key]?
  result
