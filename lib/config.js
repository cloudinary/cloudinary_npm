(function() {
  var cloudinary_config, extend, isNestedKey, isObject, isString, isUndefined, putNestedValue;

  extend = require("lodash/extend");

  isObject = require("lodash/isObject");

  isString = require("lodash/isString");

  isUndefined = require("lodash/isUndefined");

  cloudinary_config = void 0;

  isNestedKey = function(key) {
    return key.match(/\w+\[\w+\]/);
  };


  /***
    * Assign a value to a nested object
    * @function putNestedValue
    * @param params the parent object - this argument will be modified!
    * @param key key in the form nested[innerkey]
    * @param value the value to assign
    * @return the modified params object
   */

  putNestedValue = function(params, key, value) {
    var chain, inner, innerKey, j, lastKey, len, outer;
    chain = key.split(/[\[\]]+/).filter((function(_this) {
      return function(i) {
        return i.length;
      };
    })(this));
    outer = params;
    lastKey = chain.pop();
    for (j = 0, len = chain.length; j < len; j++) {
      innerKey = chain[j];
      inner = outer[innerKey];
      if (inner == null) {
        inner = {};
        outer[innerKey] = inner;
      }
      outer = inner;
    }
    return outer[lastKey] = value;
  };

  module.exports = function(new_config, new_value) {
    var cloudinary_url, k, ref, uri, v;
    if ((cloudinary_config == null) || new_config === true) {
      cloudinary_url = process.env.CLOUDINARY_URL;
      if (cloudinary_url != null) {
        uri = require('url').parse(cloudinary_url, true);
        cloudinary_config = {
          cloud_name: uri.host,
          api_key: uri.auth && uri.auth.split(":")[0],
          api_secret: uri.auth && uri.auth.split(":")[1],
          private_cdn: uri.pathname != null,
          secure_distribution: uri.pathname && uri.pathname.substring(1)
        };
        if (uri.query != null) {
          ref = uri.query;
          for (k in ref) {
            v = ref[k];
            if (isNestedKey(k)) {
              putNestedValue(cloudinary_config, k, v);
            } else {
              cloudinary_config[k] = v;
            }
          }
        }
      } else {
        cloudinary_config = {};
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

}).call(this);

//# sourceMappingURL=config.js.map
