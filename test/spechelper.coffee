expect = require('expect.js')
cloudinary = require("../cloudinary")
utils = require("../lib/utils")
{
  isEmpty 
  isFunction 
  last
} = utils
isFunction = require('lodash/isFunction')
cloneDeep = require('lodash/cloneDeep')
config = require("../lib/config")
http = require('http')
https = require('https')
if config().upload_prefix && config().upload_prefix[0..4] == 'http:'
  api_http = http
else
  api_http = https

querystring = require('querystring')
sinon = require('sinon')
ClientRequest = require('_http_client').ClientRequest
Q = require('q')

exports.TIMEOUT_SHORT   = 5000
exports.TIMEOUT_MEDIUM  = 20000
exports.TIMEOUT_LONG    = 50000
exports.SUFFIX          = process.env.TRAVIS_JOB_ID ? Math.floor(Math.random() * 999999)
exports.SDK_TAG         = "SDK_TEST" # identifies resources created by all SDKs tests
exports.TEST_TAG_PREFIX = "cloudinary_npm_test" # identifies resources created by this SDK's tests
exports.TEST_TAG        = exports.TEST_TAG_PREFIX  + "_" + exports.SUFFIX #identifies resources created in the current test run
exports.UPLOAD_TAGS     = [exports.TEST_TAG, exports.TEST_TAG_PREFIX, exports.SDK_TAG]
exports.IMAGE_FILE      = "test/resources/logo.png"
exports.LARGE_RAW_FILE  = "test/resources/TheCompleteWorksOfShakespeare.mobi"
exports.LARGE_VIDEO     = "test/resources/CloudBookStudy-HD.mp4"
exports.EMPTY_IMAGE     = "test/resources/empty.gif"
exports.RAW_FILE        = "test/resources/docx.docx"
exports.ICON_FILE       = "test/resources/favicon.ico"
exports.IMAGE_URL       = "http://res.cloudinary.com/demo/image/upload/sample"

exports.test_cloudinary_url = (public_id,options,expected_url,expected_options) ->
  url = utils.url(public_id,options)
  expect(url).to.eql(expected_url)
  expect(options).to.eql(expected_options)
  url

expect.Assertion::produceUrl = (url)->
  [public_id, options] = @obj
  actualOptions = cloneDeep(options)
  actual = utils.url(public_id, actualOptions)
  @assert(
    actual.match(url),
    ()-> "expected '#{public_id}' and #{JSON.stringify(options)} to produce '#{url}' but got '#{actual}'",
    ()-> "expected '#{public_id}' and #{JSON.stringify(options)} not to produce '#{url}' but got '#{actual}'")
  @

expect.Assertion::emptyOptions = ()->
  [public_id, options] = @obj
  actual = cloneDeep(options)
  utils.url(public_id,actual)
  @assert(
    isEmpty(actual),
    ()-> "expected '#{public_id}' and #{JSON.stringify(options)} to produce empty options but got #{JSON.stringify(actual)}",
    ()-> "expected '#{public_id}' and #{JSON.stringify(options)} not to produce empty options")
  @

expect.Assertion::beServedByCloudinary = (done)->
  [public_id, options] = @obj
  actualOptions = cloneDeep(options)
  actual = utils.url(public_id, actualOptions)
  if(actual.startsWith("https"))
    callHttp = https
  else
    callHttp = http
  callHttp.get actual, (res)=>
    @assert res.statusCode == 200,
      ()-> "Expected to get #{actual} but server responded with \"#{res.statusCode}: #{res.headers['x-cld-error']}\"",
      ()-> "Expeted not to get #{actual}."
    done()
  @

class sharedExamples
  constructor: (name, examples)->
    @allExamples ?= {}
    if isFunction(examples)
      @allExamples[name] = examples
      examples
    else
      if @allExamples[name]?
        return @allExamples[name]
      else
        return ->
          console.log("Shared example #{name} was not found!")

exports.sharedExamples = exports.sharedContext = sharedExamples

exports.itBehavesLike = (name, args...)->
  context "behaves like #{name}", ->
    sharedExamples(name).apply(this, args)
exports.includeContext = (name, args...)->
  sharedExamples(name).apply(this, args)

###*
  Create a matcher method for upload parameters
  @private
  @function helper.paramMatcher
  @param {string} name the parameter name
  @param value {Any} the parameter value
  @return {(arg)->Boolean} the matcher function
###
exports.uploadParamMatcher = (name, value)->
  (arg)->
    EncodeFieldPart = (name, value) ->
    return_part = 'Content-Disposition: form-data; name="' + name+ '"\r\n\r\n'
    return_part += value
    new RegExp(return_part).test(arg)

###*
  Create a matcher method for api parameters
  @private
  @function helper.apiParamMatcher
  @param {string} name the parameter name
  @param value {Any} the parameter value
  @return {(arg)->Boolean} the matcher function
###
exports.apiParamMatcher = (name, value)->
  params = {}
  params[name] = value
  expected = querystring.stringify(params)
  (arg)->
    new RegExp(expected).test(arg)

###*
  Escape RegExp characters
  @private
  @param {string} s the string to escape
  @return a new escaped string
###
exports.escapeRegexp = (s)->
  s.replace(/[{\[\].*+()}]/g, (c)=>'\\' + c)

###*
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
###
exports.mockTest = ()->
  mocked = {}
  before ()->
    mocked.xhr = sinon.useFakeXMLHttpRequest()
    mocked.write = sinon.spy(ClientRequest.prototype, 'write')
    mocked.request = sinon.spy(api_http, 'request')
  
  after ()->
    mocked.request.restore()
    mocked.write.restore()
    mocked.xhr.restore()
  mocked
  
###*
  @callback mockBlock
  A test block
  @param xhr 
  @param writeSpy 
  @param requestSpy 
  @return {*} a promise or a value
###

###*
  @function mockPromise
  Wraps the test to be mocked using a promise.
  Can be called inside `it` functions
  @param {mockBlock} the test function, accepting (xhr, write, request)
  @return {Promise}
###
exports.mockPromise = (mockBlock)->
  xhr = undefined
  writeSpy = undefined
  requestSpy = undefined
  Q.Promise((resolve, reject, notify)->
    xhr = sinon.useFakeXMLHttpRequest()
    writeSpy = sinon.spy(ClientRequest.prototype, 'write')
    requestSpy = sinon.spy(api_http, 'request')
    mock = {xhr, writeSpy, requestSpy }
    result = mockBlock(xhr, writeSpy, requestSpy)
    if isFunction(result?.then)
      result.then(resolve)
    else
      resolve(result)
  ).finally(()->
    requestSpy.restore()
    writeSpy.restore()
    xhr.restore()
  ).done()

###*
  Upload an image to be tested on.
  @callback the callback receives the public_id of the uploaded image
###
exports.uploadImage = (options)->
  cloudinary.v2.uploader.upload(exports.IMAGE_FILE, options)
