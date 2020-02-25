const expect = require('expect.js');
const isFunction = require('lodash/isFunction');
const cloneDeep = require('lodash/cloneDeep');
const querystring = require('querystring');
const sinon = require('sinon');
const ClientRequest = require('_http_client').ClientRequest;
const Q = require('q');
const http = require('http');
const https = require('https');

const cloudinary = require("../cloudinary");

const { utils, config, Cache } = cloudinary;
const { isEmpty, includes } = utils;

const libPath = Number(process.versions.node.split('.')[0]) < 8 ? 'lib-es5' : 'lib';
const FileKeyValueStorage = require(`../${libPath}/cache/FileKeyValueStorage`);
const KeyValueCacheAdapter = require(`../${libPath}/cache/KeyValueCacheAdapter`);
exports.libPath = libPath;

const api_http = String(config().upload_prefix).startsWith('http:') ? http : https;

exports.TIMEOUT_SHORT = 5000;
exports.TIMEOUT_MEDIUM = 20000;
exports.TIMEOUT_LONG = 50000;
exports.TIMEOUT_LARGE = 70000;
exports.SUFFIX = process.env.TRAVIS_JOB_ID || Math.floor(Math.random() * 999999);
exports.SDK_TAG = "SDK_TEST"; // identifies resources created by all SDKs tests
exports.TEST_TAG_PREFIX = "cloudinary_npm_test"; // identifies resources created by this SDK's tests
exports.TEST_TAG = exports.TEST_TAG_PREFIX + "_" + exports.SUFFIX; // identifies resources created in the current test run with a unique tag
exports.TEST_ID = exports.TEST_TAG; // identifies resources created in the current test run with a unique id
exports.UPLOAD_TAGS = [exports.TEST_TAG, exports.TEST_TAG_PREFIX, exports.SDK_TAG];
exports.IMAGE_FILE = "test/resources/logo.png";
exports.LARGE_RAW_FILE = "test/resources/TheCompleteWorksOfShakespeare.mobi";
exports.LARGE_VIDEO = "test/resources/CloudBookStudy-HD.mp4";
exports.EMPTY_IMAGE = "test/resources/empty.gif";
exports.RAW_FILE = "test/resources/docx.docx";
exports.ICON_FILE = "test/resources/favicon.ico";
exports.IMAGE_URL = "http://res.cloudinary.com/demo/image/upload/sample";

exports.test_cloudinary_url = function (public_id, options, expected_url, expected_options) {
  var url;
  url = utils.url(public_id, options);
  expect(url).to.eql(expected_url);
  expect(options).to.eql(expected_options);
  return url;
};

expect.Assertion.prototype.produceUrl = function (url) {
  var actual, actualOptions, options, public_id;
  [public_id, options] = this.obj;
  actualOptions = cloneDeep(options);
  actual = utils.url(public_id, actualOptions);
  this.assert(actual.match(url), function () {
    return `expected '${public_id}' and ${JSON.stringify(options)} to produce '${url}' but got '${actual}'`;
  }, function () {
    return `expected '${public_id}' and ${JSON.stringify(options)} not to produce '${url}' but got '${actual}'`;
  });
  return this;
};

expect.Assertion.prototype.emptyOptions = function () {
  var actual, options, public_id;
  [public_id, options] = this.obj;
  actual = cloneDeep(options);
  utils.url(public_id, actual);
  this.assert(isEmpty(actual), function () {
    return `expected '${public_id}' and ${JSON.stringify(options)} to produce empty options but got ${JSON.stringify(actual)}`;
  }, function () {
    return `expected '${public_id}' and ${JSON.stringify(options)} not to produce empty options`;
  });
  return this;
};

expect.Assertion.prototype.beServedByCloudinary = function (done) {
  var actual, actualOptions, callHttp, options, public_id;
  [public_id, options] = this.obj;
  actualOptions = cloneDeep(options);
  actual = utils.url(public_id, actualOptions);
  if (actual.startsWith("https")) {
    callHttp = https;
  } else {
    callHttp = http;
  }
  callHttp.get(actual, (res) => {
    this.assert(res.statusCode === 200, function () {
      return `Expected to get ${actual} but server responded with "${res.statusCode}: ${res.headers['x-cld-error']}"`;
    }, function () {
      return `Expeted not to get ${actual}.`;
    });
    return done();
  });
  return this;
};

/**
 * Asserts that a given object is a metadata field.
 * Optionally tests the values in the metadata field for equality
 *
 * @returns {expect.Assertion}
 */
expect.Assertion.prototype.beAMetadataField = function () {
  let metadataField, expectedValues;
  if (Array.isArray(this.obj)) {
    [metadataField, expectedValues] = this.obj;
  } else {
    metadataField = this.obj;
  }
  // Check that all mandatory keys exist
  const mandatoryKeys = ['type', 'external_id', 'label', 'mandatory', 'default_value', 'validation'];
  mandatoryKeys.forEach((key) => {
    this.assert(key in metadataField, function () {
      return `expected metadata field to contain mandatory field: ${key}`;
    }, function () {
      return `expected metadata field not to contain a ${key} field`;
    });
  });

  // If type is enum or set test it
  if (includes(['enum', 'set'], metadataField.type)) {
    this.assert('datasource' in metadataField, function () {
      return `expected metadata field of type ${metadataField.type} to contain a datasource field`;
    }, function () {
      return `expected metadata field of type ${metadataField.type} not to contain a datasource field`;
    });
  }

  // Make sure type is acceptable
  const acceptableTypes = ['string', 'integer', 'date', 'enum', 'set'];
  this.assert(includes(acceptableTypes, metadataField.type), function () {
    return `expected metadata field type to be one of ${acceptableTypes.join(', ')}. Unknown field type ${metadataField.type} received`;
  }, function () {
    return `expected metadata field not to be of a certain type`;
  });

  // Verify object values
  if (expectedValues) {
    Object.entries(expectedValues).forEach(([key, value]) => {
      this.assert(metadataField[key] === value, function () {
        return `expected metadata field's ${key} to equal ${value} but got ${metadataField[key]} instead`;
      }, function () {
        return `expected metadata field's ${key} not to equal ${value}`;
      });
    });
  }

  return this;
};

const allExamples = {};

function sharedExamples(name, examples) {
  switch (true) {
    case isFunction(examples):
      allExamples[name] = examples;
      return examples;
    case allExamples.hasOwnProperty(name):
      return allExamples[name];
    default:
      return function () {
        console.log(`Shared example ${name} was not found!`);
      };
  }
}

exports.sharedContext = sharedExamples;
exports.sharedExamples = exports.sharedContext;

exports.itBehavesLike = function (name, ...args) {
  return context(`behaves like ${name}`, function () {
    return sharedExamples(name).apply(this, args);
  });
};

exports.includeContext = function (name, ...args) {
  return sharedExamples(name).apply(this, args);
};

/**
Create a matcher method for upload parameters
@private
@function helper.paramMatcher
@param {string} name the parameter name
@param {*} value the parameter value
@return {function} the matcher function with the signature (arg)->Boolean
*/
exports.uploadParamMatcher = function (name, value) {
  return function (arg) {
    var return_part;
    return_part = 'Content-Disposition: form-data; name="' + name + '"\r\n\r\n';
    return_part += String(value);
    return arg.indexOf(return_part) + 1;
  };
};

/**
  Create a matcher method for api parameters
  @private
  @function helper.apiParamMatcher
  @param {string} name the parameter name
  @param {*} value the parameter value
  @return {function} the matcher function as (arg)->Boolean
*/
exports.apiParamMatcher = function (name, value) {
  var expected, params;
  params = {};
  params[name] = value;
  expected = querystring.stringify(params);
  return function (arg) {
    return new RegExp(expected).test(arg);
  };
};

/**
  Escape RegExp characters
  @private
  @param {string} s the string to escape
  @return a new escaped string
*/
exports.escapeRegexp = function (s) {
  return s.replace(/[{\[\].*+()}]/g, c => '\\' + c);
};

/**
@function mockTest
@nodoc
Provides a wrapper for mocked tests. Must be called in a `describe` context.
@example
<pre>
const mockTest = require('./spechelper').mockTest
describe("some topic", function() {
  mocked = mockTest()
  it("should do something" function() {
    options.access_control = [acl];
    cloudinary.v2.api.update("id", options);
    sinon.assert.calledWith(mocked.writeSpy, sinon.match(function(arg) {
      return helper.apiParamMatcher('access_control', "[" + acl_string + "]")(arg);
  })
);
</pre>
@return {object} the mocked objects: `xhr`, `write`, `request`
*/
exports.mockTest = function () {
  var mocked;
  mocked = {};
  before(function () {
    mocked.xhr = sinon.useFakeXMLHttpRequest();
    mocked.write = sinon.spy(ClientRequest.prototype, 'write');
    mocked.request = sinon.spy(api_http, 'request');
  });
  after(function () {
    mocked.request.restore();
    mocked.write.restore();
    mocked.xhr.restore();
  });
  return mocked;
};

/**
@callback mockBlock
A test block
@param xhr
@param writeSpy
@param requestSpy
@return {*} a promise or a value
*/
/**
@function mockPromise
Wraps the test to be mocked using a promise.
Can be called inside `it` functions
@param {mockBlock} the test function, accepting (xhr, write, request)
@return {Promise}
*/
exports.mockPromise = function (mockBlock) {
  var requestSpy, writeSpy, xhr;
  xhr = void 0;
  writeSpy = void 0;
  requestSpy = void 0;
  return Q.Promise(function (resolve, reject, notify) {
    var result;
    xhr = sinon.useFakeXMLHttpRequest();
    writeSpy = sinon.spy(ClientRequest.prototype, 'write');
    requestSpy = sinon.spy(api_http, 'request');
    result = mockBlock(xhr, writeSpy, requestSpy);
    if (result != null && isFunction(result.then)) {
      return result.then(resolve);
    }
    return resolve(result);
  }).finally(function () {
    requestSpy.restore();
    writeSpy.restore();
    xhr.restore();
  }).done();
};

exports.setupCache = function () {
  if (!Cache.getAdapter()) {
    Cache.setAdapter(new KeyValueCacheAdapter(new FileKeyValueStorage()));
  }
};

/**
  Upload an image to be tested on.
  @callback the callback receives the public_id of the uploaded image
*/
exports.uploadImage = function (options) {
  return cloudinary.v2.uploader.upload(exports.IMAGE_FILE, options);
};
