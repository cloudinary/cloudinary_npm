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
    this.timeout 25000
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
    this.timeout 15000
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
   
  it "should support timeouts", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "http://cloudinary.com/images/logo.png", (result) ->
      expect(result.error.http_code).to.eql(499)
      expect(result.error.message).to.eql("Request Timeout")
      done()
    , timeout: 1 # 1ms, nobody is that fast.
    
  it "should upload a file and base public id on the filename if use_filename is set to true", (done) ->
    this.timeout 10000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.public_id).to.match /logo_[a-zA-Z0-9]{6}/
      cloudinary.uploader.destroy result.public_id, (dresult) ->
        return done(new Error dresult.error.message) if dresult.error?
        expect(dresult.result).to.eql("ok")
        done()
    , use_filename: yes

  it "should upload a file and set the filename as the public_id if use_filename is set to true and unique_filename is set to false", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.public_id).to.eql "logo"
      cloudinary.uploader.destroy result.public_id, (dresult) ->
        return done(new Error dresult.error.message) if dresult.error?
        expect(dresult.result).to.eql("ok")
        done()
    , use_filename: yes, unique_filename: no
  
  it "should allow whitelisted formats if allowed_formats", (done) ->
  	cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.format).to.eql("png")
      done()
    , allowed_formats: ["png"]

  it "should prevent non whitelisted formats from being uploaded if allowed_formats is specified", (done) ->
  	cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error.http_code).to.eql(400)
      done()
    , allowed_formats: ["jpg"]
  
  it "should allow non whitelisted formats if type is specified and convert to that type", (done) ->
  	cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.format).to.eql("jpg")
      done()
    , allowed_formats: ["jpg"], format: "jpg"
  
  it "should allow sending face coordinates", (done) ->
    this.timeout 5000
    coordinates = [[120, 30, 109, 150], [121, 31, 110, 151]]
    different_coordinates = [[122, 32, 111, 152]]
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.faces).to.eql(coordinates)
      cloudinary.uploader.explicit result.public_id, (result2) ->
        return done(new Error result2.error.message) if result2.error?
        cloudinary.api.resource result2.public_id, (info) ->
          return done(new Error info.error.message) if info.error?
          expect(info.faces).to.eql(different_coordinates)
          done()
        , faces: yes
      , face_coordinates: different_coordinates, type: "upload"
    , face_coordinates: coordinates, faces: yes
  
  it "should allow sending context", (done) ->
    this.timeout 5000
    context = {caption: "some caption", alt: "alternative"}
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      cloudinary.api.resource result.public_id, (info) ->
        return done(new Error info.error.message) if info.error?
        expect(info.context.custom.caption).to.eql("some caption")
        expect(info.context.custom.alt).to.eql("alternative")
        done()
      , context: true
    , context: context
       
  it "should support requesting manual moderation", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.moderation[0].status).to.eql("pending")
      expect(result.moderation[0].kind).to.eql("manual")
      done()
    , moderation: "manual"
    
  it "should support requesting ocr info", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "Illegal value"
      done()
    , ocr: "illegal"
    
  it "should support requesting raw conversion", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/docx.docx", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "Illegal value"
      done()
    , raw_convert: "illegal", resource_type: "raw"
    
  it "should support requesting categorization", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "Illegal value"
      done()
    , categorization: "illegal"
    
  it "should support requesting detection", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "Illegal value"
      done()
    , detection: "illegal"
  
  it "should support requesting similarity search", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "Illegal value"
      done()
    , similarity_search: "illegal"
    
  it "should support requesting auto_tagging", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "Must use"
      done()
    , auto_tagging: 0.5
  
  it "should support uploading large raw files", (done) ->
    this.timeout 5000
    fs.stat "test/docx.docx", (err, stat) -> 
      cloudinary.uploader.upload_large "test/docx.docx", (response) ->
        expect(response.bytes).to.eql(stat.size)
        done()