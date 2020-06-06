const expect = require('expect.js');
const isFunction = require('lodash/isFunction');
const querystring = require('querystring');
const sinon = require('sinon');
const ClientRequest = require('_http_client').ClientRequest;
const Q = require('q');
const http = require('http');
const https = require('https');
// Load all our custom assertions
require('./testUtils/testBootstrap');

const cloudinary = require("../cloudinary");

const { utils, config, Cache } = cloudinary;

const libPath = Number(process.versions.node.split('.')[0]) < 8 ? 'lib-es5' : 'lib';
const FileKeyValueStorage = require(`../${libPath}/cache/FileKeyValueStorage`);
const KeyValueCacheAdapter = require(`../${libPath}/cache/KeyValueCacheAdapter`);
exports.libPath = libPath;

const api_http = String(config().upload_prefix).startsWith('http:') ? http : https;

exports.IMAGE_FILE = "test/.resources/logo.png";
exports.LARGE_RAW_FILE = "test/.resources/TheCompleteWorksOfShakespeare.mobi";
exports.LARGE_VIDEO = "test/.resources/CloudBookStudy-HD.mp4";
exports.EMPTY_IMAGE = "test/.resources/empty.gif";
exports.RAW_FILE = "test/.resources/docx.docx";
exports.ICON_FILE = "test/.resources/favicon.ico";
exports.VIDEO_URL = "http://res.cloudinary.com/demo/video/upload/dog.mp4";
exports.IMAGE_URL = "http://res.cloudinary.com/demo/image/upload/sample";

const { TEST_TAG } = require('./testUtils/testConstants').TAGS;

exports.SAMPLE_VIDEO_SOURCES = [
  {
    type: 'mp4',
    codecs: 'hev1',
    transformations: { video_codec: 'h265' },
  },
  {
    type: 'webm',
    codecs: 'vp9',
    transformations: { video_codec: 'vp9' },
  },
  {
    type: 'mp4',
    transformations: { video_codec: 'auto' },
  },
  {
    type: 'webm',
    transformations: { video_codec: 'auto' },
  },
];

exports.test_cloudinary_url = function(public_id, options, expected_url, expected_options) {
  var url;
  url = utils.url(public_id, options);
  expect(url).to.eql(expected_url);
  expect(options).to.eql(expected_options);
  return url;
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
 Create a matcher method for api JSON parameters
 @private
 @function helper.apiJsonParamMatcher
 @param {string} name the parameter name
 @param {*} value the parameter value
 @return {function} the matcher function as (arg)->Boolean
 */
exports.apiJsonParamMatcher = function (name, value) {
  return function (arg) {
    var expected, jsonArg;
    jsonArg = JSON.parse(arg);
    expected = JSON.stringify(value);
    return jsonArg[name] && JSON.stringify(jsonArg[name]) === expected;
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
 * Upload an image to be tested on.
 *
 * @param {object} options Optional options to use when uploading the test image
 * @returns {object} A response object returned from the upload API
 */
exports.uploadImage = function (options = {}) {
  // Ensure that options at the very least contains the TEST_TAG
  options.tags = options.tags || [];
  if (!options.tags.includes(TEST_TAG)) options.tags.push(TEST_TAG);

  return cloudinary.v2.uploader.upload(exports.IMAGE_FILE, options);
};

/**
 * Convert a timestamp to the date part of an ISO8601 string
 *
 * @param {string} timestamp The timestamp to convert
 * @returns {string} The date part of a ISO8601 date time
 */
exports.toISO8601DateOnly = function (timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};
