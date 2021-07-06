const url = require("url");

const ERRORS = {
  FIELD_VERSION_MUST_BE_NUMBER: `expected sprite to contain mandatory field 'version' of type string`,
  FIELD_VERSION_MUST_NOT_BE_NUMBER: `expected sprite not to contain mandatory field 'version' of type string`,
  FIELD_VALUE_MUST_BE_STRING: name => `expected sprite to contain mandatory field '${name}' of type string`,
  FIELD_VALUE_MUST_NOT_BE_STRING: name => `expected sprite not to contain mandatory field '${name}' of type string`,
  FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME: (name, protocol, formats) => `expected field '${name}' to contain a URL with protocol '${protocol}' and one of formats: ${formats}`,
  FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME: (name, protocol, formats) => `expected field '${name}' not to contain a URL with protocol '${protocol}' and one of formats: ${formats}`
}

function matchesSchema (urlStr, protocol, formats) {
  const urlObj = url.parse(urlStr);
  return urlObj.protocol === `${protocol}:` && formats.some(format => urlObj.pathname.endsWith(format));
}

/**
 * Asserts that a given object is a multi object.
 *
 * @returns {expect.Assertion}
 */
expect.Assertion.prototype.beAMulti = function () {
  const multi = this.obj;

  const stringKeys = ["url", "secure_url", "public_id"];
  const supportedFormats = ["gif", "png", "webp", "webm", "mp4", "pdf"];

  // Check that certain mandatory keys are of the 'string' type
  stringKeys.forEach((key) => {
    this.assert(typeof multi[key] === "string", function () {
      return ERRORS.FIELD_VALUE_MUST_BE_STRING(key);
    }, function () {
      return ERRORS.FIELD_VALUE_MUST_NOT_BE_STRING(key);
    });
  });

  this.assert(typeof multi.version === "number", function () {
    return ERRORS.FIELD_VERSION_MUST_BE_NUMBER;
  }, function () {
    return ERRORS.FIELD_VERSION_MUST_NOT_BE_NUMBER;
  });

  // Check that 'url' fields match the protocol and file format
  this.assert(matchesSchema(multi.url, "http", supportedFormats), function () {
    return ERRORS.FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME("url", "http", supportedFormats);
  }, function () {
    return ERRORS.FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME("url", "http", supportedFormats);
  });
  this.assert(matchesSchema(multi.secure_url, "https", supportedFormats), function () {
    return ERRORS.FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME("secure_url", "https", supportedFormats);
  }, function () {
    return ERRORS.FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME("secure_url", "https", supportedFormats);
  });
}
