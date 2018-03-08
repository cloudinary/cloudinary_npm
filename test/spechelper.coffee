expect = require('expect.js')
utils = require("../lib/utils")
{
  isEmpty 
  isFunction 
  last
} = utils
isFunction = require('lodash/isFunction')
cloneDeep = require('lodash/cloneDeep')
http = require('http')
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
  http.get actual, (res)=>
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
  provides a wrapper for mocked tests
  @return {object} the mocked objects
###
exports.mockTest = ()->
  mock = {}
  before ()->
    mock.xhr = sinon.useFakeXMLHttpRequest()
    mock.writeSpy = sinon.spy(ClientRequest.prototype, 'write')
    mock.requestSpy = sinon.spy(http, 'request')
  
  after ()->
    mock.requestSpy.restore()
    mock.writeSpy.restore()
    mock.xhr.restore()

  mock
  
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
  Wraps the test to be mocked using a promise
  @param {mockBlock} the test function
###
exports.mockPromise = (mockBlock)->
  xhr = undefined
  writeSpy = undefined
  requestSpy = undefined
  Q.Promise((resolve, reject, notify)->
    xhr = sinon.useFakeXMLHttpRequest()
    writeSpy = sinon.spy(ClientRequest.prototype, 'write')
    requestSpy = sinon.spy(http, 'request')
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
  )