const cloudinary = require("../../../cloudinary");
const isEmpty = require("lodash/isEmpty");
const isEqual = require("lodash/isEqual");
const querystring = require("querystring");
const { URL } = require("url");

const ERRORS = {
  MUST_CONTAIN_QUERY_PARAMETER: name => `expected query parameters to contain mandatory parameter: ${name}`,
  MUST_NOT_CONTAIN_QUERY_PARAMETER: name => `expected query parameters not to contain parameter: ${name}`,
  PATH_MUST_END_WITH: part => `expected path to end with: ${part}`,
  PATH_MUST_NOT_END_WITH: part => `expected path not to end with: ${part}`,
  FIELD_MUST_EQUAL_VALUE: (key, value, resultValue) => `expected field ${key} to equal ${value} but got ${resultValue} instead`,
  FIELD_MUST_NOT_EQUAL_VALUE: (key, value) => `expected field ${key} not to equal ${value}`
}

function normalizePhpStyleArrayQueryParams(queryParams) {
  for (let param in queryParams) {
    if (param.endsWith("[]")) {
      const normalized = param.slice(0, -2);
      if (Object.prototype.hasOwnProperty.call(queryParams, normalized)) {
        const existing = queryParams[normalized];
        const incoming = queryParams[param];
        if (Array.isArray(existing) && Array.isArray(incoming)) {
          queryParams[normalized] = existing.concat(incoming);
        } else if (Array.isArray(existing)) {
          queryParams[normalized] = existing.concat([incoming]);
        } else if (Array.isArray(incoming)) {
          queryParams[normalized] = [existing].concat(incoming);
        } else {
          // Both are scalars; keep deterministic ordering
          queryParams[normalized] = [existing, incoming];
        }
      } else {
        queryParams[normalized] = queryParams[param];
      }
      delete queryParams[param];
    }
  }
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

  // `apiUrl` should be a string, but be defensive in case callers pass URL-like objects.
  // eslint-disable-next-line no-nested-ternary
  const urlString = (typeof apiUrl === "string") ? apiUrl : (apiUrl && apiUrl.href) ? apiUrl.href : String(apiUrl);
  const urlOptions = new URL(urlString);
  const rawQuery = (urlOptions && typeof urlOptions.search === "string") ? urlOptions.search : "";
  const queryParams = querystring.parse(rawQuery.startsWith("?") ? rawQuery.slice(1) : rawQuery);

  const defaultParams = {
    api_key: cloudinary.config().api_key,
    mode: "download"
  };
  const expectedParams = Object.assign(defaultParams, params);

  normalizePhpStyleArrayQueryParams(queryParams);

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
    }, function () {
      return ERRORS.FIELD_MUST_NOT_EQUAL_VALUE(key, expectedParams[key]);
    });
  });
};
