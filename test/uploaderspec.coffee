dotenv = require('dotenv')
dotenv.load()
https = require('https')
http = require('http')
expect = require("expect.js")
cloudinary = require("../cloudinary")
fs = require('fs')
Q = require('q')
_ = require("lodash")

describe "uploader", ->
  return console.warn("**** Please setup environment for uploader test to run!") if !cloudinary.config().api_secret?

  LARGE_RAW_FILE  = "test/resources/TheCompleteWorksOfShakespeare.mobi"
  LARGE_VIDEO     = "test/resources/CloudBookStudy-HD.mp4"
  IMAGE_FILE      = "test/resources/logo.png"
  EMPTY_IMAGE     = "test/resources/empty.gif"
  RAW_FILE        = "test/resources/docx.docx"
  ICON_FILE       = "test/resources/favicon.ico"
  TIMEOUT_SHORT   = 5000
  TIMEOUT_MEDIUM  = 20000
  TIMEOUT_LONG    = 120000

  @timeout TIMEOUT_SHORT

  uploaded  = []
  uploadedRaw = []

  ###*
  # Upload an image to be tested on.
  # @callback the callback recieves the public_id of the uploaded image
  ###
  upload_image = (callback)->
    cloudinary.v2.uploader.upload IMAGE_FILE, (error, result) ->
      expect(error).to.be undefined
      uploaded.push(result.public_id)
      callback(result)

  before ->
    uploaded  = []

  beforeEach ->
    cloudinary.config(true)

  after (done)->
    @timeout TIMEOUT_LONG

    operations = []
    unless _.isEmpty(uploaded)
      operations.push cloudinary.v2.api.delete_resources uploaded

    unless _.isEmpty(uploadedRaw)
      operations.push cloudinary.v2.api.delete_resources uploadedRaw, resource_type: "raw"

    Q.allSettled(operations)
    .finally ()->
      done()



  it "should successfully upload file", (done) ->
    upload_image (result) ->
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()

  it "should successfully upload url", (done) ->
    cloudinary.v2.uploader.upload "http://cloudinary.com/images/old_logo.png",  (error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()

  describe "rename", ()->
    @timeout TIMEOUT_LONG
    it "should successfully rename a file", (done) ->
      upload_image (result)->
        public_id = result.public_id
        cloudinary.v2.uploader.rename public_id, public_id+"2", (e1, r1) ->
          return done(new Error e1.message) if e1?
          cloudinary.v2.api.resource public_id+"2", (e2, r2) ->
            expect(e2).to.be undefined
            done()

    it "should not rename to an existing public_id", (done)->
      upload_image (result)->
        first_id = result.public_id
        upload_image (result)->
          second_id = result.public_id
          cloudinary.v2.uploader.rename first_id, second_id, (e3, r3) ->
            expect(e3).not.to.be undefined
            done()

    it "should allow to rename to an existing ID, if overwrite is true", (done)->
      upload_image (result)->
        first_id = result.public_id
        upload_image (result)->
          second_id = result.public_id
          cloudinary.v2.uploader.rename first_id, second_id, overwrite: true, (error, result) ->
            expect(error).to.be undefined
            cloudinary.v2.api.resource second_id, (error, result) ->
              expect(result.format).to.eql "png"
              done()

  describe "destroy", ()->
    it "should delete a resource", (done)->
      upload_image (result)->
        public_id = result.public_id
        cloudinary.v2.uploader.destroy public_id, (error, result) ->
          return done(new Error error.message) if error?
          expect(result.result).to.eql("ok")
          cloudinary.v2.api.resource public_id, (error, result)->
            expect(error).to.be.ok()
            done()

  it "should successfully call explicit api", (done) ->
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
    @timeout TIMEOUT_SHORT
    cloudinary.v2.uploader.upload IMAGE_FILE, eager: [crop: "scale", width: "2.0"], (error, result) ->
      return done(new Error error.message) if error?
      done()


  describe "custom headers", ()->

    it "should support custom headers in object format e.g. {Link: \"1\"}", (done) ->
      cloudinary.v2.uploader.upload IMAGE_FILE, headers: {Link: "1"}, (error, result) ->
        return done(new Error error.message) if error?
        uploaded.push(result.public_id)
        done()

    it "should support custom headers as array of strings e.g. [\"Link: 1\"]", (done) ->
      cloudinary.v2.uploader.upload IMAGE_FILE, headers: ["Link: 1"], (error, result) ->
        return done(new Error error.message) if error?
        uploaded.push(result.public_id)
        done()

  it  "should successfully generate text image", (done) ->
    cloudinary.v2.uploader.text "hello world", (error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      expect(result.width).to.within(50,70)
      expect(result.height).to.within(5,15)
      done()

  it "should successfully upload stream", (done) ->
    stream = cloudinary.v2.uploader.upload_stream (error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()
    file_reader = fs.createReadStream(IMAGE_FILE, {encoding: 'binary'})
    file_reader.on 'data', (chunk)-> stream.write(chunk,'binary')
    file_reader.on 'end', -> stream.end()

  describe "tags", ()->
    @timeout TIMEOUT_MEDIUM
    it "should add tags to existing resources", (done) ->
      upload_image (result1)->
        first_id = result1.public_id
        upload_image (result2)->
          second_id = result2.public_id
          cloudinary.v2.uploader.add_tag "tag1", [first_id, second_id], (et1, rt1) ->
            return done(new Error et1.message) if et1?
            cloudinary.v2.api.resource second_id, (error, r1) ->
              return done(new Error error.message) if error
              expect(r1.tags).to.eql(["tag1"])
              done()

    it "should keep existing tags when adding a new tag", (done)->
      upload_image (result1)->
        public_id = result1.public_id
        cloudinary.v2.uploader.add_tag "tag1", public_id, (error, result)->
          cloudinary.v2.uploader.add_tag "tag2", public_id, (error, result)->
            cloudinary.v2.api.resource public_id, (e1, r1) ->
              expect(r1.tags.sort()).to.eql(["tag1", "tag2"])
              done()

    it "should replace existing tag", (done)->
      cloudinary.v2.uploader.upload IMAGE_FILE, tags: ["tag1", "tag2"], (error, result)->
        return done(new Error error.message) if error?
        public_id = result.public_id
        cloudinary.v2.uploader.replace_tag "tag3Å", public_id, -> # TODO this also tests non ascii characters
          cloudinary.v2.api.resource public_id, (error, result) ->
            expect(result.tags).to.eql(["tag3Å"])
            done()

  it "should support timeouts", (done) ->
    # testing a 1ms timeout, nobody is that fast.
    cloudinary.v2.uploader.upload "http://cloudinary.com/images/old_logo.png", timeout: 1, (error, result) ->
      expect(error.http_code).to.eql(499)
      expect(error.message).to.eql("Request Timeout")
      done()

    
  it "should upload a file and base public id on the filename if use_filename is set to true", (done) ->
    @timeout TIMEOUT_MEDIUM
    cloudinary.v2.uploader.upload IMAGE_FILE, use_filename: yes, (error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      expect(result.public_id).to.match /logo_[a-zA-Z0-9]{6}/
      done()


  it "should upload a file and set the filename as the public_id if use_filename is set to true and unique_filename is set to false", (done) ->
    cloudinary.v2.uploader.upload IMAGE_FILE, use_filename: yes, unique_filename: no, (error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      expect(result.public_id).to.eql "logo"
      done()

  describe "allowed_formats", ->
    it "should allow whitelisted formats", (done) ->
      cloudinary.v2.uploader.upload IMAGE_FILE, allowed_formats: ["png"], (error, result) ->
        return done(new Error error.message) if error?
        uploaded.push(result.public_id)
        expect(result.format).to.eql("png")
        done()

    it "should prevent non whitelisted formats from being uploaded", (done) ->
      cloudinary.v2.uploader.upload IMAGE_FILE, allowed_formats: ["jpg"], (error, result) ->
        expect(error.http_code).to.eql(400)
        done()

    it "should allow non whitelisted formats if type is specified and convert to that type", (done) ->
      cloudinary.v2.uploader.upload IMAGE_FILE, allowed_formats: ["jpg"], format: "jpg", (error, result) ->
        return done(new Error error.message) if error?
        uploaded.push(result.public_id)
        expect(result.format).to.eql("jpg")
        done()

  
  it "should allow sending face coordinates", (done) ->
    coordinates = [[120, 30, 109, 150], [121, 31, 110, 151]]
    different_coordinates = [[122, 32, 111, 152]]
    custom_coordinates = [1,2,3,4]
    cloudinary.v2.uploader.upload IMAGE_FILE, face_coordinates: coordinates, faces: yes, (error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      expect(result.faces).to.eql(coordinates)
      cloudinary.v2.uploader.explicit result.public_id, face_coordinates: different_coordinates, custom_coordinates: custom_coordinates, type: "upload", (error2, result2) ->
        return done(new Error error2.message) if error2?
        cloudinary.v2.api.resource result2.public_id, faces: yes, coordinates: yes, (ierror, info) ->
          return done(new Error ierror.message) if ierror?
          expect(info.faces).to.eql(different_coordinates)
          expect(info.coordinates).to.eql(faces: different_coordinates, custom: [custom_coordinates])
          done()
  
  it "should allow sending context", (done) ->
    @timeout TIMEOUT_LONG
    context = {caption: "some caption", alt: "alternative"}
    cloudinary.v2.uploader.upload IMAGE_FILE, context: context, (error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      cloudinary.v2.api.resource result.public_id, context: true, (error, info) ->
        return done(new Error error.message) if error?
        expect(info.context.custom.caption).to.eql("some caption")
        expect(info.context.custom.alt).to.eql("alternative")
        done()


       
  it "should support requesting manual moderation", (done) ->
    cloudinary.v2.uploader.upload IMAGE_FILE, moderation: "manual", (error, result) ->
      uploaded.push(result.public_id)
      expect(result.moderation[0].status).to.eql("pending")
      expect(result.moderation[0].kind).to.eql("manual")
      done()

    
  it "should support requesting raw conversion", (done) ->
    cloudinary.v2.uploader.upload RAW_FILE, raw_convert: "illegal", resource_type: "raw",  (error, result) ->
      expect(error?).to.be true
      expect(error.message).to.contain "is not a valid"
      done()

    
  it "should support requesting categorization", (done) ->
    cloudinary.v2.uploader.upload IMAGE_FILE, categorization: "illegal", (error, result) ->
      expect(error?).to.be true
      expect(error.message).to.contain "is not a valid"
      done()

    
  it "should support requesting detection", (done) ->
    cloudinary.v2.uploader.upload IMAGE_FILE, detection: "illegal", (error, result) ->
      expect(error).not.to.be undefined
      expect(error.message).to.contain "is not a valid"
      done()

      
  it "should support requesting background_removal", (done) ->
    cloudinary.v2.uploader.upload IMAGE_FILE, background_removal: "illegal", (error, result) ->
      expect(error?).to.be true
      expect(error.message).to.contain "is invalid"
      done()

      
  it "should support requesting auto_tagging", (done) ->
    cloudinary.v2.uploader.upload IMAGE_FILE, auto_tagging: 0.5, (error, result) ->
      expect(error?).to.be true
      expect(error.message).to.contain "Must use"
      done()


  describe "chunk_size:", ->
    @timeout TIMEOUT_LONG
    it "should specify chunk size", (done) ->
      fs.stat LARGE_RAW_FILE, (err, stat) ->
        cloudinary.v2.uploader.upload_large LARGE_RAW_FILE, {chunk_size: 7000000},  (error, result) ->
          uploadedRaw.push(result.public_id)
          expect(result.bytes).to.eql(stat.size)
          done()

    it "should return error if value is less than 5MB", (done)->
      fs.stat LARGE_RAW_FILE, (err, stat) ->
        cloudinary.v2.uploader.upload_large LARGE_RAW_FILE, {chunk_size: 40000},  (error, result) ->
          expect(error.message).to.eql("All parts except last must be larger than 5mb")
          done()


  describe "upload_large", ()->
    @timeout TIMEOUT_LONG
    it "should support uploading a small raw file", (done) ->
      fs.stat RAW_FILE, (err, stat) ->
        cloudinary.v2.uploader.upload_large RAW_FILE,  (error, result) ->
          uploadedRaw.push(result.public_id)
          expect(result.bytes).to.eql(stat.size)
          done()

    it "should support uploading large video files", (done) ->
      fs.stat LARGE_VIDEO, (err, stat) ->
        return done(new Error err.message) if err?
        cloudinary.v2.uploader.upload_large LARGE_VIDEO, (error, result) ->
          return done(new Error error.message) if error?
          expect(result.bytes).to.eql(stat.size)
          cloudinary.v2.uploader.destroy result.public_id
          done()

  it "should support unsigned uploading using presets", (done) ->
    cloudinary.v2.api.create_upload_preset folder: "upload_folder", unsigned: true, (error, preset) ->
      cloudinary.v2.uploader.unsigned_upload IMAGE_FILE, preset.name, (error, result) ->
        uploaded.push(result.public_id)
        expect(result.public_id).to.match /^upload_folder\/[a-z0-9]+$/
        cloudinary.v2.api.delete_upload_preset preset.name, -> # FIXME will this be called if expect fails?
          done()

  it "should reject promise if error code is returned from the server", (done) ->
    cloudinary.v2.uploader.upload(EMPTY_IMAGE)
    .then ->
      expect().fail("server should return an error when uploading an empty file")
    .catch (error)->
      expect(error.message).to.contain "empty"
    .finally ->
      done()

  it "should successfully upload with pipes", (done) ->
    @timeout TIMEOUT_LONG
    upload = cloudinary.v2.uploader.upload_stream (error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()
    file_reader = fs.createReadStream(IMAGE_FILE)
    file_reader.pipe(upload)

  it "should fail with http.Agent (non secure)", (done) ->
    if process.version <= 'v.11.11'
      @timeout TIMEOUT_LONG
      upload = cloudinary.v2.uploader.upload_stream {agent:new http.Agent},(error, result) ->
        expect(error).to.be.ok()
        expect(error.message).to.match(/socket hang up|ECONNRESET/)
        done()

      file_reader = fs.createReadStream(IMAGE_FILE)
      file_reader.pipe(upload)
    else
      # Node > 0.11.11
      @timeout TIMEOUT_LONG
      expect(cloudinary.v2.uploader.upload_stream).withArgs({agent:new http.Agent},(error, result) ->
        done()
      ).to.throwError()
      done()

  it "should successfully override https agent", (done) ->
    upload = cloudinary.v2.uploader.upload_stream {agent:new https.Agent},(error, result) ->
      return done(new Error error.message) if error?
      uploaded.push(result.public_id)
      expect(result.width).to.eql(241)
      expect(result.height).to.eql(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).to.eql(expected_signature)
      done()
    file_reader = fs.createReadStream(IMAGE_FILE)
    file_reader.pipe(upload)
