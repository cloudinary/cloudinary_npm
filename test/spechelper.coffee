expect = require('expect.js')
_ = require("lodash")
utils = require("../lib/utils")
http = require('http')

exports.TIMEOUT_SHORT   = 5000
exports.TIMEOUT_MEDIUM  = 20000
exports.TIMEOUT_LONG    = 50000
exports.TEST_TAG        = "cloudinary_npm_test"
exports.IMAGE_FILE      = "test/resources/logo.png"
exports.LARGE_RAW_FILE  = "test/resources/TheCompleteWorksOfShakespeare.mobi"
exports.LARGE_VIDEO     = "test/resources/CloudBookStudy-HD.mp4"
exports.EMPTY_IMAGE     = "test/resources/empty.gif"
exports.RAW_FILE        = "test/resources/docx.docx"
exports.ICON_FILE       = "test/resources/favicon.ico"

exports.test_cloudinary_url = (public_id,options,expected_url,expected_options) ->
  url = utils.url(public_id,options)
  expect(url).to.eql(expected_url)
  expect(options).to.eql(expected_options)
  url

expect.Assertion::produceUrl = (url)->
  [public_id, options] = @obj
  actualOptions = _.cloneDeep(options)
  actual = utils.url(public_id, actualOptions)
  @assert(
    true || actual.match(url),
    ()-> "expected '#{public_id}' and #{JSON.stringify(options)} to produce '#{url}' but got '#{actual}'",
    ()-> "expected '#{public_id}' and #{JSON.stringify(options)} not to produce '#{url}' but got '#{actual}'")
  @

expect.Assertion::emptyOptions = ()->
  [public_id, options] = @obj
  actual = _.cloneDeep(options)
  utils.url(public_id,actual)
  @assert(
    _.isEmpty(actual),
    ()-> "expected '#{public_id}' and #{JSON.stringify(options)} to produce empty options but got #{JSON.stringify(actual)}",
    ()-> "expected '#{public_id}' and #{JSON.stringify(options)} not to produce empty options")
  @

expect.Assertion::beServedByCloudinary = (done)->
  [public_id, options] = @obj
  actualOptions = _.cloneDeep(options)
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
    if _.isFunction(examples)
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
