require('dotenv').load()

expect = require("expect.js")
cloudinary = require("../cloudinary")
utils = require("../lib/utils")
sinon = require('sinon')
ClientRequest = require('_http_client').ClientRequest
http = require('http')
_ = require("lodash")
Q = require('q')
fs = require('fs')

helper = require("./spechelper")
api = cloudinary.v2.api

describe 'Cloudinary::Api', ->
  PREDEFINED_PROFILES = ["4k", "full_hd", "hd", "sd", "full_hd_wifi", "full_hd_lean", "hd_lean"]


  prefix = helper.TEST_TAG
  test_id_1 = "#{prefix}_1"
  test_id_2 = "#{prefix}_2"
  test_id_3 = "#{prefix}_3"

  before "Verify configuration", ->
    config = cloudinary.config(true)
    if(!(config.api_key && config.api_secret))
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")
    api = cloudinary.v2.api

  after (done)->
    config = cloudinary.config(true)
    if cloudinary.config().keep_test_products
      done()
    else
      if(!(config.api_key && config.api_secret))
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")
      Q.allSettled [
        cloudinary.v2.api.delete_streaming_profile(test_id_1)
        cloudinary.v2.api.delete_streaming_profile(test_id_1 + 'a')
        cloudinary.v2.api.delete_streaming_profile(test_id_3)]
      .finally ->
        done()
      true

  describe 'create_streaming_profile', ->
    it 'should create a streaming profile with representations', (done)->
      api.create_streaming_profile test_id_1, {representations:
          [{transformation: {crop: 'scale', width: '1200', height: '1200', bit_rate: '5m'}}]}, (error, result)->
        expect(error).to.be undefined
        expect(result).not.to.be(undefined)
        done()
      true
    it 'should create a streaming profile with an array of transformation', (done)->
      api.create_streaming_profile test_id_1 + 'a', {representations:
          [{transformation: [{crop: 'scale', width: '1200', height: '1200', bit_rate: '5m'}]}]}, (error, result)->
        expect(error).to.be undefined
        expect(result).not.to.be(undefined)
        done()
      true

  describe 'list_streaming_profile', ->
    it 'should list streaming profile', (done)->
      api.list_streaming_profiles (error, result)->
        expect(error).to.be undefined
        expect(result).to.have.key('data')
        for profile in PREDEFINED_PROFILES
          expect(result['data'].some((p)-> p.name == profile)).to.be.ok()
        done()
      true

  describe 'delete_streaming_profile', ->
    it 'should delete a streaming profile', (done)->
      @timeout 5000
      api.create_streaming_profile test_id_2, {
        representations:
          [{transformation: {crop: 'scale', width: '1200', height: '1200', bit_rate: '5m'}}]
      }, (error, result)->
        expect(error).to.be undefined
        expect(result).not.to.be(undefined)
        api.delete_streaming_profile test_id_2, (error, result)->
          expect(error).to.be undefined
          expect(result).to.have.key('message')
          expect(result['message']).to.eql('deleted')
          api.list_streaming_profiles (error, result)->
            expect(result['data'].map((p) -> p['name'])).not.to.contain(test_id_2)
            done()
          true
        true
      true

  describe 'get_streaming_profile', ->
    it 'should get a specific streaming profile', (done)->
      api.get_streaming_profile PREDEFINED_PROFILES[1], (error, result)->
        expect(error).to.be undefined
        expect(_.keys(result['data'])).to.contain('name')
        expect(_.keys(result['data'])).to.contain('display_name')
        expect(_.keys(result['data'])).to.contain('representations')
        done()
      true

  describe 'update_streaming_profile', ->
    it 'should create a streaming profile with representations', (done)->
      @timeout helper.TIMEOUT_LONG
      api.create_streaming_profile test_id_3, {representations:
          [{transformation: {crop: 'scale', width: '1200', height: '1200', bit_rate: '5m'}}]}, (error, result)->
        expect(error).to.be undefined
        expect(result).not.to.be(undefined)
        api.update_streaming_profile test_id_3, {representations:
            [{transformation: {crop: 'scale', width: '1000', height: '1000', bit_rate: '4m'}}]}, (error, result)->
          expect(error).to.be undefined
          expect(result).not.to.be(undefined)
          api.get_streaming_profile test_id_3, (error, result)->
            expect(error).to.be undefined
            result = result['data']
            expect(result['representations'].length).to.eql(1)
            # Notice transformation is always returned as an array; numeric values represented as numbers, not strings
            expect(result['representations'][0]).to.eql({transformation: [crop: 'scale', width: 1000, height: 1000, bit_rate: '4m']})
            done()
          true
        true
      true
