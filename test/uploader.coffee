expect = require("expect.js")
cloudinary = require("../cloudinary")
fs = require('fs')
describe "uploader", ->
  return console.warn("**** Please setup environment for uploader test to run!") if !cloudinary.config().api_secret?
  beforeEach ->
    cloudinary.config(true)

  
  it "should successfully upload file", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      cloudinary.uploader.destroy result.public_id, (dresult) ->
        return done(new Error dresult.error.message) if dresult.error?
        expect(dresult.result).to.eql("ok")
        done()

  it "should successfully upload url", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "http://cloudinary.com/images/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()

  it "should successfully rename a file", (done) ->
    this.timeout 10000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      cloudinary.uploader.rename result.public_id, result.public_id+"2", (r1) ->
        return done(new Error r1.error.message) if r1.error?
        cloudinary.api.resource result.public_id+"2", (r2) ->
          expect(r2.error).to.be undefined
          cloudinary.uploader.upload "test/favicon.ico", (result2) ->
            cloudinary.uploader.rename result2.public_id, result.public_id+"2", (r3) ->
              expect(r3.error).not.to.be undefined
              cloudinary.uploader.rename result2.public_id, result.public_id+"2", (r4) ->
                cloudinary.api.resource result.public_id+"2", (r5) ->
                  expect(r5.format).to.eql "ico"
                  done()
              , overwrite: true
  
  it "should successfully call explicit api", (done) ->
    this.timeout 5000
    cloudinary.uploader.explicit "cloudinary", (result) ->
      return done(new Error result.error.message) if result.error?
      url = cloudinary.utils.url("cloudinary", type: "twitter_name", crop: "scale", width: 2.0, format: "png", version: result["version"])
      expect(result.eager[0].url).to.eql(url)
      done()
    , type: "twitter_name", eager: [crop: "scale", width: 2.0]

  it "should support eager in upload", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      done()
    , eager: [crop: "scale", width: 2.0]

  it "should support custom headers in upload", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      cloudinary.uploader.upload "test/logo.png", (result) ->
        return done(new Error result.error.message) if result.error?
        done()
      , headers: {Link: "1"}
    , headers: ["Link: 1"]

  it  "should successfully generate text image", (done) ->
    this.timeout 5000
    cloudinary.uploader.text "hello world", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.width).to.within(50,70)
      expect(result.height).to.within(5,15)
      done()

  it "should successfully upload stream", (done) ->
    this.timeout 5000
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

  it "should successfully manipulate tags", (done) ->
    this.timeout 10000
    cloudinary.uploader.upload "test/logo.png", (result1) ->
      cloudinary.uploader.upload "test/logo.png", (result2) ->
        return done(new Error result1.error.message) if result1.error?
        cloudinary.uploader.add_tag "tag1", [result1.public_id, result2.public_id], (rt1) ->
          return done(new Error rt1.error.message) if rt1.error?
          cloudinary.api.resource result2.public_id, (r1) -> 
            expect(r1.tags).to.eql(["tag1"])
          cloudinary.uploader.add_tag "tag2", result1.public_id, ->
            cloudinary.api.resource result1.public_id, (r1) -> 
              expect(r1.tags).to.eql(["tag1", "tag2"])
              cloudinary.uploader.remove_tag "tag1", result1.public_id, ->
                cloudinary.api.resource result1.public_id, (r2) -> 
                  expect(r2.tags).to.eql(["tag2"])
                  cloudinary.uploader.replace_tag "tag3", result1.public_id, ->
                    cloudinary.api.resource result1.public_id, (r3) -> 
                      expect(r3.tags).to.eql(["tag3"])
                      done()
   
