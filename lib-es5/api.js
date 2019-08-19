'use strict';

// eslint-disable-next-line import/order
var config = require("./config");
var https = /^http:/.test(config().upload_prefix) ? require('http') : require('https');
var querystring = require("querystring");
var Q = require('q');
var url = require('url');
var utils = require("./utils");
var ensureOption = require('./utils/ensureOption').defaults(config());

var extend = utils.extend,
    includes = utils.includes,
    only = utils.only,
    ensurePresenceOf = utils.ensurePresenceOf;


var TRANSFORMATIONS_URI = "transformations";

function call_api(method, uri, params, callback, options) {
  var handle_response = void 0,
      query_params = void 0;
  ensurePresenceOf({ method, uri });
  var deferred = Q.defer();
  var cloudinary = ensureOption(options, "upload_prefix", "https://api.cloudinary.com");
  var cloud_name = ensureOption(options, "cloud_name");
  var api_key = ensureOption(options, "api_key");
  var api_secret = ensureOption(options, "api_secret");

  method = method.toUpperCase();
  var api_url = [cloudinary, "v1_1", cloud_name].concat(uri).join("/");
  var content_type = 'application/x-www-form-urlencoded';
  if (options.content_type === 'json') {
    query_params = JSON.stringify(params);
    content_type = 'application/json';
  } else {
    query_params = querystring.stringify(params);
  }
  if (method === "GET") {
    api_url += "?" + query_params;
  }
  var request_options = url.parse(api_url);
  request_options = extend(request_options, {
    method: method,
    headers: {
      'Content-Type': content_type,
      'User-Agent': utils.getUserAgent()
    },
    auth: api_key + ":" + api_secret
  });
  if (options.agent != null) {
    request_options.agent = options.agent;
  }
  if (method !== "GET") {
    request_options.headers['Content-Length'] = Buffer.byteLength(query_params);
  }
  handle_response = function handle_response(res) {
    if (includes([200, 400, 401, 403, 404, 409, 420, 500], res.statusCode)) {
      var buffer = "";
      var error = false;
      res.on("data", function (d) {
        buffer += d;
        return buffer;
      });
      res.on("end", function () {
        var result = void 0;
        if (error) {
          return;
        }
        try {
          result = JSON.parse(buffer);
        } catch (e) {
          result = {
            error: {
              message: "Server return invalid JSON response. Status Code " + res.statusCode
            }
          };
        }
        if (result.error) {
          result.error.http_code = res.statusCode;
        } else {
          result.rate_limit_allowed = parseInt(res.headers["x-featureratelimit-limit"]);
          result.rate_limit_reset_at = new Date(res.headers["x-featureratelimit-reset"]);
          result.rate_limit_remaining = parseInt(res.headers["x-featureratelimit-remaining"]);
        }
        if (result.error) {
          deferred.reject(result);
        } else {
          deferred.resolve(result);
        }
        if (typeof callback === "function") {
          callback(result);
        }
      });
      res.on("error", function (e) {
        error = true;
        var err_obj = {
          error: {
            message: e,
            http_code: res.statusCode
          }
        };
        deferred.reject(err_obj.error);
        if (typeof callback === "function") {
          callback(err_obj);
        }
      });
    } else {
      var err_obj = {
        error: {
          message: "Server returned unexpected status code - " + res.statusCode,
          http_code: res.statusCode
        }
      };
      deferred.reject(err_obj.error);
      if (typeof callback === "function") {
        callback(err_obj);
      }
    }
  };
  var request = https.request(request_options, handle_response);
  request.on("error", function (e) {
    deferred.reject(e);
    return typeof callback === "function" ? callback({ error: e }) : void 0;
  });
  request.setTimeout(ensureOption(options, "timeout", 60000));
  if (method !== "GET") {
    request.write(query_params);
  }
  request.end();
  return deferred.promise;
}

function deleteResourcesParams(options) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return extend(params, only(options, "keep_original", "invalidate", "next_cursor", "transformations"));
}

exports.ping = function ping(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return call_api("get", ["ping"], {}, callback, options);
};

exports.usage = function usage(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return call_api("get", ["usage"], {}, callback, options);
};

exports.resource_types = function resource_types(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return call_api("get", ["resources"], {}, callback, options);
};

exports.resources = function resources(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var resource_type = void 0,
      type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  type = options.type;
  uri = ["resources", resource_type];
  if (type != null) {
    uri.push(type);
  }
  if (options.start_at != null && Object.prototype.toString.call(options.start_at) === '[object Date]') {
    options.start_at = options.start_at.toUTCString();
  }
  return call_api("get", uri, only(options, "next_cursor", "max_results", "prefix", "tags", "context", "direction", "moderations", "start_at"), callback, options);
};

exports.resources_by_tag = function resources_by_tag(tag, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var resource_type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "tags", tag];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options);
};

exports.resources_by_context = function resources_by_context(key, value, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var params = void 0,
      resource_type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "context"];
  params = only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations");
  params.key = key;
  if (value != null) {
    params.value = value;
  }
  return call_api("get", uri, params, callback, options);
};

exports.resources_by_moderation = function resources_by_moderation(kind, status, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var resource_type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "moderations", kind, status];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options);
};

exports.resources_by_ids = function resources_by_ids(public_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = void 0,
      resource_type = void 0,
      type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type];
  params = only(options, "tags", "context", "moderations");
  params["public_ids[]"] = public_ids;
  return call_api("get", uri, params, callback, options);
};

exports.resource = function resource(public_id, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var resource_type = void 0,
      type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type, public_id];
  return call_api("get", uri, only(options, "exif", "colors", "derived_next_cursor", "faces", "image_metadata", "pages", "phash", "coordinates", "max_results"), callback, options);
};

exports.restore = function restore(public_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var resource_type = void 0,
      type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type, "restore"];
  return call_api("post", uri, {
    public_ids: public_ids
  }, callback, options);
};

exports.update = function update(public_id, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = void 0,
      resource_type = void 0,
      type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type, public_id];
  params = utils.updateable_resource_params(options);
  if (options.moderation_status != null) {
    params.moderation_status = options.moderation_status;
  }
  return call_api("post", uri, params, callback, options);
};

exports.delete_resources = function delete_resources(public_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var resource_type = void 0,
      type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, deleteResourcesParams(options, {
    "public_ids[]": public_ids
  }), callback, options);
};

exports.delete_resources_by_prefix = function delete_resources_by_prefix(prefix, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var resource_type = void 0,
      type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, deleteResourcesParams(options, {
    prefix: prefix
  }), callback, options);
};

exports.delete_resources_by_tag = function delete_resources_by_tag(tag, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var resource_type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "tags", tag];
  return call_api("delete", uri, deleteResourcesParams(options), callback, options);
};

exports.delete_all_resources = function delete_all_resources(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var resource_type = void 0,
      type = void 0,
      uri = void 0;

  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, deleteResourcesParams(options, {
    all: true
  }), callback, options);
};

exports.delete_derived_resources = function delete_derived_resources(derived_resource_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var uri = void 0;
  uri = ["derived_resources"];
  return call_api("delete", uri, {
    "derived_resource_ids[]": derived_resource_ids
  }, callback, options);
};

exports.delete_derived_by_transformation = function delete_derived_by_transformation(public_ids, transformations, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var params = void 0,
      resource_type = void 0,
      type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = "resources/" + resource_type + "/" + type;
  params = extend({
    "public_ids[]": public_ids
  }, only(options, "invalidate"));
  params.keep_original = true;
  params.transformations = utils.build_eager(transformations);
  return call_api("delete", uri, params, callback, options);
};

exports.tags = function tags(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var resource_type = void 0,
      uri = void 0;
  resource_type = options.resource_type || "image";
  uri = ["tags", resource_type];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "prefix"), callback, options);
};

exports.transformations = function transformations(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var params = only(options, "next_cursor", "max_results", "named");
  return call_api("get", TRANSFORMATIONS_URI, params, callback, options);
};

exports.transformation = function transformation(transformationName, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = only(options, "next_cursor", "max_results");
  params.transformation = utils.build_eager(transformationName);
  return call_api("get", TRANSFORMATIONS_URI, params, callback, options);
};

exports.delete_transformation = function delete_transformation(transformationName, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = {};
  params.transformation = utils.build_eager(transformationName);
  return call_api("delete", TRANSFORMATIONS_URI, params, callback, options);
};

exports.update_transformation = function update_transformation(transformationName, updates, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var params = only(updates, "allowed_for_strict");
  params.transformation = utils.build_eager(transformationName);
  if (updates.unsafe_update != null) {
    params.unsafe_update = utils.build_eager(updates.unsafe_update);
  }
  return call_api("put", TRANSFORMATIONS_URI, params, callback, options);
};

exports.create_transformation = function create_transformation(name, definition, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var params = { name };
  params.transformation = utils.build_eager(definition);
  return call_api("post", TRANSFORMATIONS_URI, params, callback, options);
};

exports.upload_presets = function upload_presets(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return call_api("get", ["upload_presets"], only(options, "next_cursor", "max_results"), callback, options);
};

exports.upload_preset = function upload_preset(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var uri = void 0;
  uri = ["upload_presets", name];
  return call_api("get", uri, {}, callback, options);
};

exports.delete_upload_preset = function delete_upload_preset(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var uri = void 0;
  uri = ["upload_presets", name];
  return call_api("delete", uri, {}, callback, options);
};

exports.update_upload_preset = function update_upload_preset(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = void 0,
      uri = void 0;
  uri = ["upload_presets", name];
  params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), only(options, "unsigned", "disallow_public_id"));
  return call_api("put", uri, params, callback, options);
};

exports.create_upload_preset = function create_upload_preset(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var params = void 0,
      uri = void 0;
  uri = ["upload_presets"];
  params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), only(options, "name", "unsigned", "disallow_public_id"));
  return call_api("post", uri, params, callback, options);
};

exports.root_folders = function root_folders(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var uri = void 0;
  uri = ["folders"];
  return call_api("get", uri, {}, callback, options);
};

exports.sub_folders = function sub_folders(path, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var uri = void 0;
  uri = ["folders", path];
  return call_api("get", uri, {}, callback, options);
};

exports.delete_folder = function delete_folder(path, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var uri = void 0;
  uri = ["folders", path];
  return call_api("delete", uri, {}, callback, options);
};

exports.upload_mappings = function upload_mappings(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var params = void 0;
  params = only(options, "next_cursor", "max_results");
  return call_api("get", "upload_mappings", params, callback, options);
};

exports.upload_mapping = function upload_mapping(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (name == null) {
    name = null;
  }
  return call_api("get", 'upload_mappings', {
    folder: name
  }, callback, options);
};

exports.delete_upload_mapping = function delete_upload_mapping(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return call_api("delete", 'upload_mappings', {
    folder: name
  }, callback, options);
};

exports.update_upload_mapping = function update_upload_mapping(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = void 0;
  params = only(options, "template");
  params.folder = name;
  return call_api("put", 'upload_mappings', params, callback, options);
};

exports.create_upload_mapping = function create_upload_mapping(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = void 0;
  params = only(options, "template");
  params.folder = name;
  return call_api("post", 'upload_mappings', params, callback, options);
};

function publishResource(byKey, value, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var params = void 0,
      resource_type = void 0,
      uri = void 0;
  params = only(options, "type", "invalidate", "overwrite");
  params[byKey] = value;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "publish_resources"];
  options = extend({
    resource_type: resource_type
  }, options);
  return call_api("post", uri, params, callback, options);
}

exports.publish_by_prefix = function publish_by_prefix(prefix, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return publishResource("prefix", prefix, callback, options);
};

exports.publish_by_tag = function publish_by_tag(tag, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return publishResource("tag", tag, callback, options);
};

exports.publish_by_ids = function publish_by_ids(public_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return publishResource("public_ids", public_ids, callback, options);
};

exports.list_streaming_profiles = function list_streaming_profiles(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return call_api("get", "streaming_profiles", {}, callback, options);
};

exports.get_streaming_profile = function get_streaming_profile(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return call_api("get", "streaming_profiles/" + name, {}, callback, options);
};

exports.delete_streaming_profile = function delete_streaming_profile(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return call_api("delete", "streaming_profiles/" + name, {}, callback, options);
};

exports.update_streaming_profile = function update_streaming_profile(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = void 0;
  params = utils.build_streaming_profiles_param(options);
  return call_api("put", "streaming_profiles/" + name, params, callback, options);
};

exports.create_streaming_profile = function create_streaming_profile(name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = void 0;
  params = utils.build_streaming_profiles_param(options);
  params.name = name;
  return call_api("post", 'streaming_profiles', params, callback, options);
};

function updateResourcesAccessMode(access_mode, by_key, value, callback) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var params = void 0,
      resource_type = void 0,
      type = void 0;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  params = {
    access_mode: access_mode
  };
  params[by_key] = value;
  return call_api("post", "resources/" + resource_type + "/" + type + "/update_access_mode", params, callback, options);
}

exports.search = function search(params, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  options.content_type = 'json';
  return call_api("post", "resources/search", params, callback, options);
};

exports.update_resources_access_mode_by_prefix = function update_resources_access_mode_by_prefix(access_mode, prefix, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  return updateResourcesAccessMode(access_mode, "prefix", prefix, callback, options);
};

exports.update_resources_access_mode_by_tag = function update_resources_access_mode_by_tag(access_mode, tag, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  return updateResourcesAccessMode(access_mode, "tag", tag, callback, options);
};

exports.update_resources_access_mode_by_ids = function update_resources_access_mode_by_ids(access_mode, ids, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  return updateResourcesAccessMode(access_mode, "public_ids[]", ids, callback, options);
};