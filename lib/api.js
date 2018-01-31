(function() {
  var Q, _, api, call_api, config, delete_resources_params, https, publishResource, querystring, transformation_string, update_resources_access_mode, utils,
    slice = [].slice;

  _ = require("lodash");

  config = require("./config");

  if (config().upload_prefix && config().upload_prefix.slice(0, 5) === 'http:') {
    https = require('http');
  } else {
    https = require('https');
  }

  utils = require("./utils");

  querystring = require("querystring");

  Q = require('q');

  api = module.exports;

  call_api = function(method, uri, params, callback, options) {
    var api_key, api_secret, api_url, cloud_name, cloudinary, content_type, deferred, handle_response, query_params, ref, ref1, ref2, ref3, ref4, ref5, request, request_options;
    deferred = Q.defer();
    cloudinary = (ref = (ref1 = options["upload_prefix"]) != null ? ref1 : config("upload_prefix")) != null ? ref : "https://api.cloudinary.com";
    cloud_name = (function() {
      var ref3;
      if ((ref2 = (ref3 = options["cloud_name"]) != null ? ref3 : config("cloud_name")) != null) {
        return ref2;
      } else {
        throw "Must supply cloud_name";
      }
    })();
    api_key = (function() {
      var ref4;
      if ((ref3 = (ref4 = options["api_key"]) != null ? ref4 : config("api_key")) != null) {
        return ref3;
      } else {
        throw "Must supply api_key";
      }
    })();
    api_secret = (function() {
      var ref5;
      if ((ref4 = (ref5 = options["api_secret"]) != null ? ref5 : config("api_secret")) != null) {
        return ref4;
      } else {
        throw "Must supply api_secret";
      }
    })();
    api_url = [cloudinary, "v1_1", cloud_name].concat(uri).join("/");
    content_type = 'application/x-www-form-urlencoded';
    if (options['content_type'] === 'json') {
      query_params = JSON.stringify(params);
      content_type = 'application/json';
    } else {
      query_params = querystring.stringify(params);
    }
    if (method === "get") {
      api_url += "?" + query_params;
    }
    request_options = require('url').parse(api_url);
    request_options = _.extend(request_options, {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': content_type,
        'User-Agent': utils.getUserAgent()
      },
      auth: api_key + ":" + api_secret
    });
    if (options.agent != null) {
      request_options.agent = options.agent;
    }
    if (method !== "get") {
      request_options.headers['Content-Length'] = Buffer.byteLength(query_params);
    }
    handle_response = function(res) {
      var buffer, err_obj, error;
      if (_.includes([200, 400, 401, 403, 404, 409, 420, 500], res.statusCode)) {
        buffer = "";
        error = false;
        res.on("data", function(d) {
          return buffer += d;
        });
        res.on("end", function() {
          var e, result;
          if (error) {
            return;
          }
          try {
            result = JSON.parse(buffer);
          } catch (error1) {
            e = error1;
            result = {
              error: {
                message: "Server return invalid JSON response. Status Code " + res.statusCode
              }
            };
          }
          if (result["error"]) {
            result["error"]["http_code"] = res.statusCode;
          } else {
            result["rate_limit_allowed"] = parseInt(res.headers["x-featureratelimit-limit"]);
            result["rate_limit_reset_at"] = new Date(res.headers["x-featureratelimit-reset"]);
            result["rate_limit_remaining"] = parseInt(res.headers["x-featureratelimit-remaining"]);
          }
          if (result.error) {
            deferred.reject(result);
          } else {
            deferred.resolve(result);
          }
          return typeof callback === "function" ? callback(result) : void 0;
        });
        return res.on("error", function(e) {
          var err_obj;
          error = true;
          err_obj = {
            error: {
              message: e,
              http_code: res.statusCode
            }
          };
          deferred.reject(err_obj.error);
          return typeof callback === "function" ? callback(err_obj) : void 0;
        });
      } else {
        err_obj = {
          error: {
            message: "Server returned unexpected status code - " + res.statusCode,
            http_code: res.statusCode
          }
        };
        deferred.reject(err_obj.error);
        return typeof callback === "function" ? callback(err_obj) : void 0;
      }
    };
    request = https.request(request_options, handle_response);
    request.on("error", function(e) {
      return typeof callback === "function" ? callback({
        error: e
      }) : void 0;
    });
    request.setTimeout((ref5 = options["timeout"]) != null ? ref5 : 60000);
    if (method !== "get") {
      request.write(query_params);
    }
    request.end();
    return deferred.promise;
  };

  transformation_string = function(transformation) {
    if (_.isString(transformation)) {
      return transformation;
    } else {
      return utils.generate_transformation_string(_.extend({}, transformation));
    }
  };

  delete_resources_params = function(options, params) {
    if (params == null) {
      params = {};
    }
    return _.extend(params, api.only(options, "keep_original", "invalidate", "next_cursor", "transformations"));
  };

  exports.ping = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", ["ping"], {}, callback, options);
  };

  exports.usage = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", ["usage"], {}, callback, options);
  };

  exports.resource_types = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", ["resources"], {}, callback, options);
  };

  exports.resources = function(callback, options) {
    var ref, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    type = options["type"];
    uri = ["resources", resource_type];
    if (type != null) {
      uri.push(type);
    }
    if ((options.start_at != null) && Object.prototype.toString.call(options.start_at) === '[object Date]') {
      options.start_at = options.start_at.toUTCString();
    }
    return call_api("get", uri, api.only(options, "next_cursor", "max_results", "prefix", "tags", "context", "direction", "moderations", "start_at"), callback, options);
  };

  exports.resources_by_tag = function(tag, callback, options) {
    var ref, resource_type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    uri = ["resources", resource_type, "tags", tag];
    return call_api("get", uri, api.only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options);
  };

  exports.resources_by_context = function(key, value, callback, options) {
    var params, ref, resource_type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    uri = ["resources", resource_type, "context"];
    params = api.only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations");
    params.key = key;
    if (value != null) {
      params.value = value;
    }
    return call_api("get", uri, params, callback, options);
  };

  exports.resources_by_moderation = function(kind, status, callback, options) {
    var ref, resource_type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    uri = ["resources", resource_type, "moderations", kind, status];
    return call_api("get", uri, api.only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options);
  };

  exports.resources_by_ids = function(public_ids, callback, options) {
    var params, ref, ref1, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    type = (ref1 = options["type"]) != null ? ref1 : "upload";
    uri = ["resources", resource_type, type];
    params = api.only(options, "tags", "context", "moderations");
    params["public_ids[]"] = public_ids;
    return call_api("get", uri, params, callback, options);
  };

  exports.resource = function(public_id, callback, options) {
    var ref, ref1, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    type = (ref1 = options["type"]) != null ? ref1 : "upload";
    uri = ["resources", resource_type, type, public_id];
    return call_api("get", uri, api.only(options, "exif", "colors", "faces", "image_metadata", "pages", "phash", "coordinates", "max_results"), callback, options);
  };

  exports.restore = function(public_ids, callback, options) {
    var ref, ref1, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    type = (ref1 = options["type"]) != null ? ref1 : "upload";
    uri = ["resources", resource_type, type, "restore"];
    return call_api("post", uri, {
      public_ids: public_ids
    }, callback, options);
  };

  exports.update = function(public_id, callback, options) {
    var params, ref, ref1, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    type = (ref1 = options["type"]) != null ? ref1 : "upload";
    uri = ["resources", resource_type, type, public_id];
    params = utils.updateable_resource_params(options);
    if (options.moderation_status != null) {
      params.moderation_status = options.moderation_status;
    }
    return call_api("post", uri, params, callback, options);
  };

  exports.delete_resources = function(public_ids, callback, options) {
    var ref, ref1, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    type = (ref1 = options["type"]) != null ? ref1 : "upload";
    uri = ["resources", resource_type, type];
    return call_api("delete", uri, delete_resources_params(options, {
      "public_ids[]": public_ids
    }), callback, options);
  };

  exports.delete_resources_by_prefix = function(prefix, callback, options) {
    var ref, ref1, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    type = (ref1 = options["type"]) != null ? ref1 : "upload";
    uri = ["resources", resource_type, type];
    return call_api("delete", uri, delete_resources_params(options, {
      prefix: prefix
    }), callback, options);
  };

  exports.delete_resources_by_tag = function(tag, callback, options) {
    var ref, resource_type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    uri = ["resources", resource_type, "tags", tag];
    return call_api("delete", uri, delete_resources_params(options), callback, options);
  };

  exports.delete_all_resources = function(callback, options) {
    var ref, ref1, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    type = (ref1 = options["type"]) != null ? ref1 : "upload";
    uri = ["resources", resource_type, type];
    return call_api("delete", uri, delete_resources_params(options, {
      all: true
    }), callback, options);
  };

  exports.delete_derived_resources = function(derived_resource_ids, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["derived_resources"];
    return call_api("delete", uri, {
      "derived_resource_ids[]": derived_resource_ids
    }, callback, options);
  };

  exports.delete_derived_by_transformation = function(public_ids, transformations, callback, options) {
    var params, resource_type, type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = options["resource_type"] || "image";
    type = options["type"] || "upload";
    uri = "resources/" + resource_type + "/" + type;
    params = _.extend({
      "public_ids[]": public_ids
    }, api.only(options, "invalidate"));
    params["keep_original"] = true;
    params["transformations"] = utils.build_eager(transformations);
    return call_api("delete", uri, params, callback, options);
  };

  exports.tags = function(callback, options) {
    var ref, resource_type, uri;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options["resource_type"]) != null ? ref : "image";
    uri = ["tags", resource_type];
    return call_api("get", uri, api.only(options, "next_cursor", "max_results", "prefix"), callback, options);
  };

  exports.transformations = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", ["transformations"], api.only(options, "next_cursor", "max_results"), callback, options);
  };

  exports.transformation = function(transformation, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["transformations", transformation_string(transformation)];
    return call_api("get", uri, api.only(options, "next_cursor", "max_results"), callback, options);
  };

  exports.delete_transformation = function(transformation, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["transformations", transformation_string(transformation)];
    return call_api("delete", uri, {}, callback, options);
  };

  exports.update_transformation = function(transformation, updates, callback, options) {
    var params, uri;
    if (options == null) {
      options = {};
    }
    uri = ["transformations", transformation_string(transformation)];
    params = api.only(updates, "allowed_for_strict");
    if (updates.unsafe_update != null) {
      params.unsafe_update = transformation_string(updates.unsafe_update);
    }
    return call_api("put", uri, params, callback, options);
  };

  exports.create_transformation = function(name, definition, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["transformations", name];
    return call_api("post", uri, {
      transformation: transformation_string(definition)
    }, callback, options);
  };

  exports.upload_presets = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", ["upload_presets"], api.only(options, "next_cursor", "max_results"), callback, options);
  };

  exports.upload_preset = function(name, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["upload_presets", name];
    return call_api("get", uri, {}, callback, options);
  };

  exports.delete_upload_preset = function(name, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["upload_presets", name];
    return call_api("delete", uri, {}, callback, options);
  };

  exports.update_upload_preset = function(name, callback, options) {
    var params, uri;
    if (options == null) {
      options = {};
    }
    uri = ["upload_presets", name];
    params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), api.only(options, "unsigned", "disallow_public_id"));
    return call_api("put", uri, params, callback, options);
  };

  exports.create_upload_preset = function(callback, options) {
    var params, uri;
    if (options == null) {
      options = {};
    }
    uri = ["upload_presets"];
    params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), api.only(options, "name", "unsigned", "disallow_public_id"));
    return call_api("post", uri, params, callback, options);
  };

  exports.root_folders = function(callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["folders"];
    return call_api("get", uri, {}, callback, options);
  };

  exports.sub_folders = function(path, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["folders", path];
    return call_api("get", uri, {}, callback, options);
  };

  exports.upload_mappings = function(callback, options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = api.only(options, "next_cursor", "max_results");
    return call_api("get", "upload_mappings", params, callback, options);
  };

  exports.upload_mapping = function(name, callback, options) {
    if (name == null) {
      name = null;
    }
    if (options == null) {
      options = {};
    }
    return call_api("get", 'upload_mappings', {
      folder: name
    }, callback, options);
  };

  exports.delete_upload_mapping = function(name, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("delete", 'upload_mappings', {
      folder: name
    }, callback, options);
  };

  exports.update_upload_mapping = function(name, callback, options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = api.only(options, "template");
    params["folder"] = name;
    return call_api("put", 'upload_mappings', params, callback, options);
  };

  exports.create_upload_mapping = function(name, callback, options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = api.only(options, "template");
    params["folder"] = name;
    return call_api("post", 'upload_mappings', params, callback, options);
  };

  publishResource = function(byKey, value, callback, options) {
    var params, ref, resource_type, uri;
    if (options == null) {
      options = {};
    }
    params = api.only(options, "type", "invalidate", "overwrite");
    params[byKey] = value;
    resource_type = (ref = options.resource_type) != null ? ref : "image";
    uri = ["resources", resource_type, "publish_resources"];
    options = _.extend({
      resource_type: resource_type
    }, options);
    return call_api("post", uri, params, callback, options);
  };

  exports.publish_by_prefix = function(prefix, callback, options) {
    if (options == null) {
      options = {};
    }
    return publishResource("prefix", prefix, callback, options);
  };

  exports.publish_by_tag = function(tag, callback, options) {
    if (options == null) {
      options = {};
    }
    return publishResource("tag", tag, callback, options);
  };

  exports.publish_by_ids = function(public_ids, callback, options) {
    if (options == null) {
      options = {};
    }
    return publishResource("public_ids", public_ids, callback, options);
  };

  exports.list_streaming_profiles = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", "streaming_profiles", {}, callback, options);
  };

  exports.get_streaming_profile = function(name, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", "streaming_profiles/" + name, {}, callback, options);
  };

  exports.delete_streaming_profile = function(name, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("delete", "streaming_profiles/" + name, {}, callback, options);
  };

  exports.update_streaming_profile = function(name, callback, options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = utils.build_streaming_profiles_param(options);
    return call_api("put", "streaming_profiles/" + name, params, callback, options);
  };

  exports.create_streaming_profile = function(name, callback, options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = utils.build_streaming_profiles_param(options);
    params["name"] = name;
    return call_api("post", 'streaming_profiles', params, callback, options);
  };

  update_resources_access_mode = function(access_mode, by_key, value, callback, options) {
    var params, ref, ref1, resource_type, type;
    if (options == null) {
      options = {};
    }
    resource_type = (ref = options.resource_type) != null ? ref : "image";
    type = (ref1 = options.type) != null ? ref1 : "upload";
    params = {
      access_mode: access_mode
    };
    params[by_key] = value;
    return call_api("post", "resources/" + resource_type + "/" + type + "/update_access_mode", params, callback, options);
  };

  exports.search = function(params, callback, options) {
    if (options == null) {
      options = {};
    }
    options['content_type'] = 'json';
    return call_api("post", "resources/search", params, callback, options);
  };

  exports.update_resources_access_mode_by_prefix = function(access_mode, prefix, callback, options) {
    if (options == null) {
      options = {};
    }
    return update_resources_access_mode(access_mode, "prefix", prefix, callback, options);
  };

  exports.update_resources_access_mode_by_tag = function(access_mode, tag, callback, options) {
    if (options == null) {
      options = {};
    }
    return update_resources_access_mode(access_mode, "tag", tag, callback, options);
  };

  exports.update_resources_access_mode_by_ids = function(access_mode, ids, callback, options) {
    if (options == null) {
      options = {};
    }
    return update_resources_access_mode(access_mode, "public_ids[]", ids, callback, options);
  };

  exports.only = function() {
    var hash, i, key, keys, len, result;
    hash = arguments[0], keys = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = {};
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      if (hash[key] != null) {
        result[key] = hash[key];
      }
    }
    return result;
  };

}).call(this);

//# sourceMappingURL=api.js.map
