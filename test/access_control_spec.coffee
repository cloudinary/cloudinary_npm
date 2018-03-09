require('dotenv').load(silent: true)

expect = require("expect.js")
cloudinary = require("../cloudinary")
utils = require("../lib/utils")
sinon = require('sinon')
ClientRequest = require('_http_client').ClientRequest
http = require('http')
helper = require('./spechelper')
escapeRegexp = helper.escapeRegexp

isString = require('lodash/isString')

xhr = request = requestStub = requestSpy = writeSpy = options = undefined
describe "Access Control", ()->
  before "Verify Configuration", ->
  config = cloudinary.config(true)
  if(!(config.api_key && config.api_secret))
    expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")

  @timeout helper.TIMEOUT_LONG
  after ->
    config = cloudinary.config(true)
    if(!(config.api_key && config.api_secret))
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")
    cloudinary.v2.api.delete_resources_by_tag(helper.TEST_TAG) unless cloudinary.config().keep_test_products

  beforeEach ->
    options = {
      public_id: helper.TEST_TAG,
      tags: [helper.UPLOAD_TAGS..., 'access_control_test']
    }

  acl = {
      access_type: 'anonymous',
      start: new Date(Date.UTC(2019,1,22, 16, 20, 57)),
      end: '2019-03-22 00:00 +0200'
  }
  acl_2 = {
      access_type: 'anonymous',
      start: '2019-02-22 16:20:57Z',
      end: '2019-03-22 00:00 +0200'
  }
  acl_string = 
    '{"access_type":"anonymous","start":"2019-02-22 16:20:57 +0200","end":"2019-03-22 00:00 +0200"}'
  
  describe "build_upload_params", ()->
    it "should accept a Hash value", ()->
      params = cloudinary.utils.build_upload_params( access_control: acl)
      expect(params).to.have.key('access_control')
      expect(isString(params.access_control)).to.be.ok()
      expect(params.access_control).to.match(/^\[.+\]$/)

    it "should accept an array of Hash values", ()->
      params = cloudinary.utils.build_upload_params access_control: [acl, acl_2]
      expect(params).to.have.key('access_control')
      expect(isString(params.access_control)).to.be.ok()
      expect(params.access_control).to.match(/^\[.+\]$/)
      j = JSON.parse(params.access_control)
      expect(j.length).to.be(2)
      expect(j[0]["access_type"]).to.equal(acl.access_type)
      expect(Date.parse(j[0]["start"])).to.equal(Date.parse(acl.start))
      expect(Date.parse(j[0]["end"])).to.equal(Date.parse(acl.end))
    it "should accept a JSON string", ()->
      params = cloudinary.utils.build_upload_params access_control: acl_string
      expect(params).to.have.key('access_control')
      expect(isString(params.access_control)).to.be.ok()
      expect(params.access_control).to.equal("[#{acl_string}]")
