const url = require("url");

const ERRORS = {
  FIELD_VERSION_MUST_BE_NUMBER: `expected sprite to contain mandatory field 'version' of type number`,
  FIELD_VERSION_MUST_NOT_BE_NUMBER: `expected sprite not to contain mandatory field 'version' of type number`,
  MUST_CONTAIN_IMAGE_INFOS: `expected sprite to contain mandatory field: 'image_infos'`,
  MUST_NOT_CONTAIN_IMAGE_INFOS: `expected sprite not to contain mandatory field: 'image_infos'`,
  FIELD_VALUE_MUST_BE_STRING: name => `expected sprite to contain mandatory field '${name}' of type string`,
  FIELD_VALUE_MUST_NOT_BE_STRING: name => `expected sprite not to contain mandatory field '${name}' of type string`,
  IMAGE_INFOS_VALUE_MUST_BE_NUMBER: name => `expected 'image_infos' item to contain mandatory field '${name}' of type number`,
  IMAGE_INFOS_VALUE_MUST_NOT_BE_NUMBER: name => `expected 'image_infos' item not to contain mandatory field '${name}' of type number`,
  FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME: (name, protocol, format) => `expected field '${name}' to contain a URL with protocol '${protocol}' and format '${format}'`,
  FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME: (name, protocol, format) => `expected field '${name}' not to contain a URL with protocol '${protocol}' and format '${format}'`
}

function matchesSchema (urlStr, protocol, format) {
  const urlObj = url.parse(urlStr);
  let isValid = urlObj.protocol === `${protocol}:`;
  if (format) {
    isValid = isValid && urlObj.pathname.endsWith(`.${format}`)
  }
  return isValid
}

/**
 * Asserts that a given object is a sprite object.
 *
 * @returns {expect.Assertion}
 */
expect.Assertion.prototype.beASprite = function (format=null) {
  const sprite = this.obj;
  const stringKeys = ["css_url", "image_url", "json_url", "secure_css_url", "secure_image_url", "secure_json_url", "public_id"];
  const imageInfosKeys = ["width", "height", "x", "y"];

  // Check that certain mandatory keys are of the 'string' type
  stringKeys.forEach((key) => {
    this.assert(typeof sprite[key] === "string", function () {
      return ERRORS.FIELD_VALUE_MUST_BE_STRING(key);
    }, function () {
      return ERRORS.FIELD_VALUE_MUST_NOT_BE_STRING(key);
    });
  });
  this.assert(typeof sprite.version === "number", function () {
    return ERRORS.FIELD_VERSION_MUST_BE_NUMBER;
  }, function () {
    return ERRORS.FIELD_VERSION_MUST_NOT_BE_NUMBER;
  });
  this.assert("image_infos" in sprite, function () {
    return ERRORS.MUST_CONTAIN_IMAGE_INFOS;
  }, function () {
    return ERRORS.MUST_NOT_CONTAIN_IMAGE_INFOS;
  });

  // Check that all keys of 'image_infos' field are of the 'number' type
  Object.entries(sprite.image_infos).forEach(([key, imageInfos]) => {
    imageInfosKeys.forEach((imageInfoKey) => {
      this.assert(typeof imageInfos[imageInfoKey] === "number", function () {
        return ERRORS.IMAGE_INFOS_VALUE_MUST_BE_NUMBER(imageInfoKey);
      }, function () {
        return ERRORS.IMAGE_INFOS_VALUE_MUST_NOT_BE_NUMBER(imageInfoKey);
      });
    });
  });

  // Check that 'url' fields match the protocol and file format
  this.assert(matchesSchema(sprite.css_url, "http", "css"), function () {
    return ERRORS.FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME("css_url", "http", "css");
  }, function () {
    return ERRORS.FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME("css_url", "http", "css");
  });
  this.assert(matchesSchema(sprite.image_url, "http", format), function () {
    return ERRORS.FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME("image_url", "http", format);
  }, function () {
    return ERRORS.FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME("image_url", "http", format);
  });
  this.assert(matchesSchema(sprite.json_url, "http", "json"), function () {
    return ERRORS.FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME("json_url", "http", "json");
  }, function () {
    return ERRORS.FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME("json_url", "http", "json");
  });
  this.assert(matchesSchema(sprite.secure_css_url, "https", "css"), function () {
    return ERRORS.FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME("secure_css_url", "https", "css");
  }, function () {
    return ERRORS.FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME("secure_css_url", "https", "css");
  });
  this.assert(matchesSchema(sprite.secure_image_url, "https", format), function () {
    return ERRORS.FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME("secure_image_url", "https", format);
  }, function () {
    return ERRORS.FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME("secure_image_url", "https", format);
  });
  this.assert(matchesSchema(sprite.secure_json_url, "https", "json"), function () {
    return ERRORS.FIELD_URL_MUST_BE_ACCORDING_TO_THE_SCHEME("secure_json_url", "https", "json");
  }, function () {
    return ERRORS.FIELD_URL_MUST_NOT_BE_ACCORDING_TO_THE_SCHEME("secure_json_url", "https", "json");
  });
};
