const cloudinary = require("../../../cloudinary");
const url = require("url");
const isEmpty = require("lodash/isEmpty");
const isEqual = require("lodash/isEqual");

const ERRORS = {
  MUST_CONTAIN_QUERY_PARAMETER: name => `expected query parameters to contain mandatory parameter: ${name}`,
  MUST_NOT_CONTAIN_QUERY_PARAMETER: name => `expected query parameters not to contain parameter: ${name}`,
  PATH_MUST_END_WITH: part => `expected path to end with: ${part}`,
  PATH_MUST_NOT_END_WITH: part => `expected path not to end with: ${part}`,
  FIELD_MUST_EQUAL_VALUE: (key, value, resultValue) => `expected field ${key} to equal ${value} but got ${resultValue} instead`,
  FIELD_MUST_NOT_EQUAL_VALUE: (key, value) => `expected field ${key} not to equal ${value}`
}

/**
 * Asserts that a given string is a signed url.
 *
 * @param {string} [path]   Path that the url should end with
 * @param {Object} [params] Query paraneters that should be present in the url
 *
 * @returns {expect.Assertion}
 */
expect.Assertion.prototype.beASignedDownloadUrl = function (path, params) {
  const apiUrl = this.obj;

  const urlOptions = url.parse(apiUrl, true)
  const queryParams = urlOptions.query;

  const defaultParams = {
    api_key: cloudinary.config().api_key,
    mode: "download"
  };
  const expectedParams = Object.assign(defaultParams, params);

  // Rename PHP-style multi-value params to strip '[]' from their names, e.g. urls[] -> urls
  for (let param in queryParams) {
    if (param.endsWith("[]")) {
      queryParams[param.slice(0, -2)] = queryParams[param];
      delete queryParams[param];
    }
  }

  this.assert("timestamp" in queryParams, function () {
    return ERRORS.MUST_CONTAIN_QUERY_PARAMETER("timestamp");
  }, function () {
    return ERRORS.MUST_NOT_CONTAIN_QUERY_PARAMETER("timestamp");
  });

  this.assert("signature" in queryParams, function () {
    return ERRORS.MUST_CONTAIN_QUERY_PARAMETER("signature");
  }, function () {
    return ERRORS.MUST_NOT_CONTAIN_QUERY_PARAMETER("signature");
  });

  if (!isEmpty(path)) {
    this.assert(urlOptions.pathname.endsWith(path), function () {
      return ERRORS.PATH_MUST_END_WITH(path);
    }, function () {
      return ERRORS.PATH_MUST_NOT_END_WITH(path);
    });
  }

  Object.keys(expectedParams).forEach((key) => {
    this.assert(isEqual(expectedParams[key], queryParams[key]), function () {
      return ERRORS.FIELD_MUST_EQUAL_VALUE(key, expectedParams[key], queryParams[key]);
    }, function() {
      return ERRORS.FIELD_MUST_NOT_EQUAL_VALUE(key, expectedParams[key]);
    });
  });
};
