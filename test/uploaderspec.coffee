dotenv = require('dotenv')
dotenv.load()
https = require('https')
http = require('http')
expect = require("expect.js")
cloudinary = require("../cloudinary")
fs = require('fs')
describe "uploader", ->
  return console.warn("**** Please setup environment for uploader test to run!") if !cloudinary.config().api_secret?
  beforeEach ->
    cloudinary.config(true)

  
  it "should successfully upload file", (done) ->
    this.timeout 5000
    cloudinary.v2.uploader.upload "test/logo.png", (error, result) ->
      return done(new Error error.message) if error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      cloudinary.v2.uploader.destroy result.public_id, (derror, dresult) ->
        return done(new Error derror.message) if derror?
        expect(dresult.result).to.eql("ok")
        done()

  it "should successfully upload url", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "http://cloudinary.com/images/old_logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()

  it "should successfully rename a file", (done) ->
    this.timeout 25000
    cloudinary.v2.uploader.upload "test/logo.png", (error, result) ->
      return done(new Error error.message) if error?
      cloudinary.v2.uploader.rename result.public_id, result.public_id+"2", (e1, r1) ->
        return done(new Error e1.message) if e1?
        cloudinary.v2.api.resource result.public_id+"2", (e2, r2) ->
          expect(e2).to.be undefined
          cloudinary.v2.uploader.upload "test/favicon.ico", (error2, result2) ->
            cloudinary.v2.uploader.rename result2.public_id, result.public_id+"2", (e3, r3) ->
              expect(e3).not.to.be undefined
              cloudinary.v2.uploader.rename result2.public_id, result.public_id+"2", overwrite: true, (e4, r4) ->
                cloudinary.v2.api.resource result.public_id+"2", (e5, r5) ->
                  expect(r5.format).to.eql "ico"
                  done()
  
  it "should successfully call explicit api", (done) ->
    this.timeout 5000
    current = this
    cloudinary.v2.uploader.explicit "cloudinary", type: "twitter_name", eager: [crop: "scale", width: "2.0"], (error, result) ->
      unless error?
        url = cloudinary.utils.url "cloudinary",
          type: "twitter_name",
          crop: "scale",
          width: "2.0",
          format: "png",
          version: result["version"]
        expect(result.eager[0].url).to.eql(url)
        done()
      else
        if error.code is 420
          console.warn error.message
          console.warn "Try running '#{current.test.title}' again in 10 minutes"
          current.test.pending = true
          done()
        else
          done(new Error error.message)

  it "should support eager in upload", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      return done(new Error result.error.message) if result.error?
      done()
    , eager: [crop: "scale", width: "2.0"]

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
    cloudinary.v2.uploader.text "hello world", (error, result) ->
      return done(new Error error.message) if error?
      expect(result.width).to.within(50,70)
      expect(result.height).to.within(5,15)
      done()

  it "should successfully upload stream", (done) ->
    this.timeout 5000
    stream = cloudinary.v2.uploader.upload_stream (error, result) ->
      return done(new Error error.message) if error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()
    file_reader = fs.createReadStream('test/logo.png', {encoding: 'binary'})
    file_reader.on 'data', (chunk)-> stream.write(chunk,'binary')
    file_reader.on 'end', -> stream.end()

  it "should successfully manipulate tags", (done) ->
    this.timeout 15000
    cloudinary.v2.uploader.upload "test/logo.png", (error1, result1) ->
      cloudinary.v2.uploader.upload "test/logo.png", (error2, result2) ->
        return done(new Error error1.message) if error1?
        return done(new Error error2.message) if error2?
        cloudinary.v2.uploader.add_tag "tag1", [result1.public_id, result2.public_id], (et1, rt1) ->
          return done(new Error et1.message) if et1?
          cloudinary.api.resource result2.public_id, (r1) -> 
            expect(r1.tags).to.eql(["tag1"])
            cloudinary.uploader.add_tag "tag2", result1.public_id, ->
              cloudinary.v2.api.resource result1.public_id, (e1, r1) -> 
                expect(r1.tags).to.eql(["tag1", "tag2"])
                cloudinary.v2.uploader.remove_tag "tag1", result1.public_id, ->
                  cloudinary.api.resource result1.public_id, (r2) -> 
                    expect(r2.tags).to.eql(["tag2"])
                    cloudinary.v2.uploader.replace_tag "tag3Å", result1.public_id, ->
                      cloudinary.api.resource result1.public_id, (r3) -> 
                        expect(r3.tags).to.eql(["tag3Å"])
                        done()
   
  it "should support timeouts", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "http://cloudinary.com/images/old_logo.png", (result) ->
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
    custom_coordinates = [1,2,3,4]
    cloudinary.v2.uploader.upload "test/logo.png", face_coordinates: coordinates, faces: yes, (error, result) ->
      return done(new Error error.message) if error?
      expect(result.faces).to.eql(coordinates)
      cloudinary.v2.uploader.explicit result.public_id, face_coordinates: different_coordinates, custom_coordinates: custom_coordinates, type: "upload", (error2, result2) ->
        return done(new Error error2.message) if error2?
        cloudinary.v2.api.resource result2.public_id, faces: yes, coordinates: yes, (ierror, info) ->
          return done(new Error ierror.message) if ierror?
          expect(info.faces).to.eql(different_coordinates)
          expect(info.coordinates).to.eql(faces: different_coordinates, custom: [custom_coordinates])
          done()
  
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
    
  it "should support requesting raw conversion", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/docx.docx", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "is not a valid"
      done()
    , raw_convert: "illegal", resource_type: "raw"
    
  it "should support requesting categorization", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "is not a valid"
      done()
    , categorization: "illegal"
    
  it "should support requesting detection", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "is not a valid"
      done()
    , detection: "illegal"
      
  it "should support requesting background_removal", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload "test/logo.png", (result) ->
      expect(result.error?).to.be true
      expect(result.error.message).to.contain "is invalid"
      done()
    , background_removal: "illegal"
      
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
  
  it "should support unsigned uploading using presets", (done) ->
    this.timeout 5000
    cloudinary.v2.api.create_upload_preset folder: "upload_folder", unsigned: true, (error, preset) ->
      cloudinary.v2.uploader.unsigned_upload "test/logo.png", preset.name, (error, result) ->
        expect(result.public_id).to.match /^upload_folder\/[a-z0-9]+$/
        cloudinary.api.delete_upload_preset(preset.name, -> done())

  it "should reject promise if error code is returned from the server", (done) ->
    this.timeout 5000
    cloudinary.uploader.upload("test/empty.gif")
    .then ->
      expect().fail("server should return an error when uploading an empty file")
    .catch (error)->
      expect(error.message).to.contain "empty"
    .finally ->
      done()

  it "should successfully upload with pipes", (done) ->
    this.timeout 2000
    upload = cloudinary.v2.uploader.upload_stream (error, result) ->
      return done(new Error error.message) if error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()
    file_reader = fs.createReadStream('test/logo.png')
    file_reader.pipe(upload)

  it "should fail with http.Agent (non secure)", (done) ->
    this.timeout 2000
    upload = cloudinary.v2.uploader.upload_stream {agent:new http.Agent},(error, result) ->
      expect(error.message).to.match(/socket hang up|ECONNRESET/)
      done()

    file_reader = fs.createReadStream('test/logo.png')
    file_reader.pipe(upload)

  it "should successfully override https agent", (done) ->
    this.timeout 2000
    upload = cloudinary.v2.uploader.upload_stream {agent:new https.Agent},(error, result) ->
      return done(new Error error.message) if error?
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()
    file_reader = fs.createReadStream('test/logo.png')
    file_reader.pipe(upload)
