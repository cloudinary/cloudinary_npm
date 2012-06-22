expect = require("expect.js")
cloudinary = require("../cloudinary")

describe "uploader", ->
  beforeEach ->
    cloudinary.config(true)
  
  it "should successfully upload file", (done) ->
    if not cloudinary.config().api_secret
      console.warn "Please setup environment for upload test to run"
      return done()
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()

  it  "should successfully generate text image", (done) ->
    if not cloudinary.config().api_secret
      console.warn "Please setup environment for upload test to run"
      return done()
    cloudinary.uploader.text "hello world", (result) ->
      expect(result.width).to.within(50,70)
      expect(result.height).to.within(5,15)
      done()

