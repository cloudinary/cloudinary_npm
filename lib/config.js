/**
 * Assign a value to a nested object
 * @function putNestedValue
 * @param params the parent object - this argument will be modified!
 * @param key key in the form nested[innerkey]
 * @param value the value to assign
 * @return the modified params object
 */
const extend = require("lodash/extend");
const isObject = require("lodash/isObject");
const isString = require("lodash/isString");
const isUndefined = require("lodash/isUndefined");
const isEmpty = require("lodash/isEmpty");
const entries = require('./utils/entries');
const { URL } = require('url');

let cloudinary_config = void 0;

/**
 * Sets a value in an object using a nested key
 * @param {object} params The object to assign the value in.
 * @param {string} key The key of the value. A period is used to denote inner keys.
 * @param {*} value The value to set.
 * @returns {object} The params argument.
 * @example
 *     let o = {foo: {bar: 1}};
 *     putNestedValue(o, 'foo.bar', 2); // {foo: {bar: 2}}
 *     putNestedValue(o, 'foo.inner.key', 'this creates an inner object');
 *     // {{foo: {bar: 2}, inner: {key: 'this creates an inner object'}}}
 */
function putNestedValue(params, key, value) {
  let chain = key.split(/[\[\]]+/).filter(i => i.length);
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
  outer[lastKey] = value;
  return params;
}

function parseCloudinaryConfigFromEnvURL(ENV_STR) {
  let conf = {};

  const uri = new URL(ENV_STR);

  const auth = uri.username && uri.password
    ? `${uri.username}:${uri.password}`
    : (uri.username || null);

  if (uri.protocol === 'cloudinary:') {
    conf = Object.assign({}, conf, {
      cloud_name: uri.hostname,
      api_key: uri.username || (auth && auth.split(":")[0]),
      api_secret: uri.password || (auth && auth.split(":")[1]),
      private_cdn: uri.pathname != null && uri.pathname !== '' && uri.pathname !== '/',
      secure_distribution: uri.pathname && uri.pathname !== '/' ? uri.pathname.substring(1) : undefined
    });
  } else if (uri.protocol === 'account:') {
    conf = Object.assign({}, conf, {
      account_id: uri.hostname,
      provisioning_api_key: uri.username || (auth && auth.split(":")[0]),
      provisioning_api_secret: uri.password || (auth && auth.split(":")[1])
    });
  }

  return conf;
}

function extendCloudinaryConfigFromQuery(ENV_URL, confToExtend = {}) {
  const url = new URL(ENV_URL);
  if (url.search) {
    const query = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    entries(query).forEach(([key, value]) => putNestedValue(confToExtend, key, value));
  }
}

function extendCloudinaryConfig(parsedConfig, confToExtend = {}) {
  entries(parsedConfig).forEach(([key, value]) => {
    if (value !== undefined) {
      confToExtend[key] = value;
    }
  });

  return confToExtend;
}

module.exports = function (new_config, new_value) {
  if ((cloudinary_config == null) || new_config === true) {
    if (cloudinary_config == null) {
      cloudinary_config = {};
    } else {
      Object.keys(cloudinary_config).forEach(key => delete cloudinary_config[key]);
    }

    let CLOUDINARY_ENV_URL = process.env.CLOUDINARY_URL;
    let CLOUDINARY_ENV_ACCOUNT_URL = process.env.CLOUDINARY_ACCOUNT_URL;
    let CLOUDINARY_API_PROXY = process.env.CLOUDINARY_API_PROXY;

    if (CLOUDINARY_ENV_URL && !CLOUDINARY_ENV_URL.toLowerCase().startsWith('cloudinary://')) {
      throw new Error("Invalid CLOUDINARY_URL protocol. URL should begin with 'cloudinary://'");
    }
    if (CLOUDINARY_ENV_ACCOUNT_URL && !CLOUDINARY_ENV_ACCOUNT_URL.toLowerCase().startsWith('account://')) {
      throw new Error("Invalid CLOUDINARY_ACCOUNT_URL protocol. URL should begin with 'account://'");
    }
    if (!isEmpty(CLOUDINARY_API_PROXY)) {
      extendCloudinaryConfig({ api_proxy: CLOUDINARY_API_PROXY }, cloudinary_config);
    }

    [CLOUDINARY_ENV_URL, CLOUDINARY_ENV_ACCOUNT_URL].forEach((ENV_URL) => {
      if (ENV_URL) {
        let parsedConfig = parseCloudinaryConfigFromEnvURL(ENV_URL);
        extendCloudinaryConfig(parsedConfig, cloudinary_config);
        // Provide Query support in ENV url cloudinary://key:secret@test123?foo[bar]=value
        // expect(cloudinary_config.foo.bar).to.eql('value')
        extendCloudinaryConfigFromQuery(ENV_URL, cloudinary_config);
      }
    });
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
