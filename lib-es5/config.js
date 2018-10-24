"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/***
 * Assign a value to a nested object
 * @function putNestedValue
 * @param params the parent object - this argument will be modified!
 * @param key key in the form nested[innerkey]
 * @param value the value to assign
 * @return the modified params object
 */
var url = require('url');
var extend = require("lodash/extend");
var isObject = require("lodash/isObject");
var isString = require("lodash/isString");
var isUndefined = require("lodash/isUndefined");

var cloudinary_config = void 0;

function isNestedKey(key) {
  return key.match(/\w+\[\w+\]/);
}

function putNestedValue(params, key, value) {
  var chain = key.split(/[\[\]]+/).filter(function (i) {
    return i.length;
  });
  var outer = params;
  var lastKey = chain.pop();
  for (var j = 0; j < chain.length; j++) {
    var innerKey = chain[j];
    var inner = outer[innerKey];
    if (inner == null) {
      inner = {};
      outer[innerKey] = inner;
    }
    outer = inner;
  }
  return outer[lastKey] = value;
}

module.exports = function (new_config, new_value) {
  if (cloudinary_config == null || new_config === true) {
    if (cloudinary_config == null) {
      cloudinary_config = {};
    } else {
      Object.keys(cloudinary_config).forEach(function (key) {
        return delete cloudinary_config[key];
      });
    }

    var cloudinary_url = process.env.CLOUDINARY_URL;
    if (cloudinary_url != null) {

      var uri = url.parse(cloudinary_url, true);
      var parsedConfig = {
        cloud_name: uri.host,
        api_key: uri.auth && uri.auth.split(":")[0],
        api_secret: uri.auth && uri.auth.split(":")[1],
        private_cdn: uri.pathname != null,
        secure_distribution: uri.pathname && uri.pathname.substring(1)
      };
      Object.entries(parsedConfig).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        if (value !== undefined) {
          cloudinary_config[key] = value;
        }
      });
      if (uri.query != null) {
        Object.entries(uri.query).forEach(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              key = _ref4[0],
              value = _ref4[1];

          return putNestedValue(cloudinary_config, key, value);
        });
      }
    }
  }
  if (!isUndefined(new_value)) {
    cloudinary_config[new_config] = new_value;
  } else if (isString(new_config)) {
    return cloudinary_config[new_config];
  } else if (isObject(new_config)) {
    extend(cloudinary_config, new_config);
  }
  return cloudinary_config;
};