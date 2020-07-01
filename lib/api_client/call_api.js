// eslint-disable-next-line import/order
const config = require("../config");
const utils = require("../utils");
const ensureOption = require('../utils/ensureOption').defaults(config());
const execute_request = require('./execute_request');

const { ensurePresenceOf } = utils;

function call_api(method, uri, params, callback, options) {
  ensurePresenceOf({ method, uri });
  const api_url = utils.base_api_url(uri, options);
  const auth = {
    key: ensureOption(options, "api_key"),
    secret: ensureOption(options, "api_secret")
  };

  return execute_request(method, params, auth, api_url, callback, options);
}

module.exports = call_api;
