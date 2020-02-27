"use strict";

// eslint-disable-next-line import/order
var config = require("../config");
var utils = require("../utils");
var ensureOption = require('../utils/ensureOption').defaults(config());
var execute_request = require('./execute_request');

var ensurePresenceOf = utils.ensurePresenceOf;


function call_api(method, uri, params, callback, options) {
  ensurePresenceOf({ method, uri });
  var cloudinary = ensureOption(options, "upload_prefix", "https://api.cloudinary.com");
  var cloud_name = ensureOption(options, "cloud_name");
  var api_url = [cloudinary, "v1_1", cloud_name].concat(uri).join("/");
  var auth = {
    key: ensureOption(options, "api_key"),
    secret: ensureOption(options, "api_secret")
  };

  return execute_request(method, params, auth, api_url, callback, options);
}

module.exports = call_api;