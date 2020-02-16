// eslint-disable-next-line import/order
const config = require("../config");
const https = /^http:/.test(config().upload_prefix) ? require('http') : require('https');
const querystring = require("querystring");
const Q = require('q');
const url = require('url');
const utils = require("../utils");
const ensureOption = require('../utils/ensureOption').defaults(config());

const { extend, includes, ensurePresenceOf } = utils;

function call_api(method, uri, params, callback, options) {
  let handle_response, query_params;
  ensurePresenceOf({ method, uri });
  const deferred = Q.defer();
  const cloudinary = ensureOption(options, "upload_prefix", "https://api.cloudinary.com");
  const cloud_name = ensureOption(options, "cloud_name");
  const api_key = ensureOption(options, "api_key");
  const api_secret = ensureOption(options, "api_secret");

  method = method.toUpperCase();
  let api_url = [cloudinary, "v1_1", cloud_name].concat(uri).join("/");
  let content_type = 'application/x-www-form-urlencoded';
  if (options.content_type === 'json') {
    query_params = JSON.stringify(params);
    content_type = 'application/json';
  } else {
    query_params = querystring.stringify(params);
  }
  if (method === "GET") {
    api_url += "?" + query_params;
  }
  let request_options = url.parse(api_url);
  request_options = extend(request_options, {
    method: method,
    headers: {
      'Content-Type': content_type,
      'User-Agent': utils.getUserAgent(),
    },
    auth: api_key + ":" + api_secret,
  });
  if (options.agent != null) {
    request_options.agent = options.agent;
  }
  if (method !== "GET") {
    request_options.headers['Content-Length'] = Buffer.byteLength(query_params);
  }
  handle_response = function (res) {
    if (includes([200, 400, 401, 403, 404, 409, 420, 500], res.statusCode)) {
      let buffer = "";
      let error = false;
      res.on("data", function (d) {
        buffer += d;
        return buffer;
      });
      res.on("end", function () {
        let result;
        if (error) {
          return;
        }
        try {
          result = JSON.parse(buffer);
        } catch (e) {
          result = {
            error: {
              message: "Server return invalid JSON response. Status Code " + res.statusCode,
            },
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
        let err_obj = {
          error: {
            message: e,
            http_code: res.statusCode,
          },
        };
        deferred.reject(err_obj.error);
        if (typeof callback === "function") {
          callback(err_obj);
        }
      });
    } else {
      let err_obj = {
        error: {
          message: "Server returned unexpected status code - " + res.statusCode,
          http_code: res.statusCode,
        },
      };
      deferred.reject(err_obj.error);
      if (typeof callback === "function") {
        callback(err_obj);
      }
    }
  };
  const request = https.request(request_options, handle_response);
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

module.exports = call_api;