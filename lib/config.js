/***
 * Assign a value to a nested object
 * @function putNestedValue
 * @param params the parent object - this argument will be modified!
 * @param key key in the form nested[innerkey]
 * @param value the value to assign
 * @return the modified params object
 */
const url = require('url');
const extend = require("lodash/extend");
const isObject = require("lodash/isObject");
const isString = require("lodash/isString");
const isUndefined = require("lodash/isUndefined");
const entries = require('./utils/entries');

let cloudinary_config = void 0;

function isNestedKey(key) {
  return key.match(/\w+\[\w+\]/);
}

function putNestedValue(params, key, value) {
  let chain = key.split(/[\[\]]+/).filter((i) => i.length);
  let outer = params;
  let lastKey = chain.pop();
  for (let j = 0; j < chain.length; j++) {
    let innerKey = chain[j];
    let inner = outer[innerKey];
    if (inner == null) {
      inner = {};
      outer[innerKey] = inner;
    }
    outer = inner;
  }
  return outer[lastKey] = value;
}

module.exports = function(new_config, new_value) {
  if ((cloudinary_config == null) || new_config === true) {
    if (cloudinary_config == null){
      cloudinary_config = {};
    } else {
      Object.keys(cloudinary_config).forEach(key=> delete cloudinary_config[key]);
    }


    let cloudinary_url = process.env.CLOUDINARY_URL;
    if (cloudinary_url != null) {

      let uri = url.parse(cloudinary_url, true);
      let parsedConfig = {
        cloud_name: uri.host,
        api_key: uri.auth && uri.auth.split(":")[0],
        api_secret: uri.auth && uri.auth.split(":")[1],
        private_cdn: uri.pathname != null,
        secure_distribution: uri.pathname && uri.pathname.substring(1)
      };
      entries(parsedConfig).forEach(([key, value])=> {
        if(value !== undefined) {
          cloudinary_config[key] = value;
        }
      });
      if (uri.query != null) {
        entries(uri.query).forEach( ([key, value])=> putNestedValue(cloudinary_config, key, value));
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
