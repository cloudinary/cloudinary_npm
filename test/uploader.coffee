expect = require("expect.js")
cloudinary = require("../cloudinary")
fs = require('fs')
describe "uploader", ->
  beforeEach ->
    cloudinary.config(true)
  
  it "should successfully upload file", (done) ->
    if not cloudinary.config().api_secret
      console.warn "Please setup environment for upload test to run"
      return done()
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()

  it "should successfully upload url", (done) ->
    if not cloudinary.config().api_secret
      console.warn "Please setup environment for upload test to run"
      return done()
    cloudinary.uploader.upload "http://cloudinary.com/images/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
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
      return done(new Error result.error.message) if result.error?
      expect(result.width).to.within(50,70)
      expect(result.height).to.within(5,15)
      done()

  it "should successfully upload stream", (done) ->
    if not cloudinary.config().api_secret
      console.warn "Please setup environment for upload test to run"
      return done()
    stream = cloudinary.uploader.upload_stream (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()
    file_reader = fs.createReadStream('test/logo.png', {encoding: 'binary'});
    file_reader.on 'data', stream.write
    file_reader.on 'end', stream.end
 
