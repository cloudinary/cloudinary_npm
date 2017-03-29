require('dotenv').load()
http = require('http')
https = require('https')
expect = require("expect.js")
cloudinary = require("../cloudinary")
utils = cloudinary.v2.utils
api = cloudinary.v2.api
uploader = cloudinary.v2.uploader
zlib = require('zlib')
sinon = require("sinon")
ClientRequest = require('_http_client').ClientRequest

exec = require('child_process').exec
execSync = require('child_process').execSync
_ = require("lodash")
Q = require('q')
fs = require('fs')
os = require('os')

helper = require("./spechelper")
TEST_TAG = helper.TEST_TAG
IMAGE_URL = helper.IMAGE_URL

sharedExamples = helper.sharedExamples
includeContext = helper.includeContext

ARCHIVE_TAG = TEST_TAG + "_archive"

publicId1 = ARCHIVE_TAG + "_1"
publicId2 = ARCHIVE_TAG + "_2"
publicIdRaw = ARCHIVE_TAG + "_3"

sharedExamples 'archive', ->

  before "Verify Configuration", ->
    config = cloudinary.config(true)
    if(!(config.api_key && config.api_secret))
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")

  before ->
    @timeout helper.TIMEOUT_LONG

    Q.all [
      uploader.upload(
        IMAGE_URL,
        public_id: publicId1
        tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG])
        transformation:
          effect: "blackwhite"
      )
      uploader.upload(
        IMAGE_URL,
        public_id: publicId2
        tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG])
        transformation: {
          effect: "blackwhite"
        }
      )
      uploader.upload(
        IMAGE_URL,
        public_id: publicIdRaw
        resource_type: "raw"
        tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG])
      )]
  after ->
    cloudinary.v2.api.delete_resources_by_tag(ARCHIVE_TAG) unless cloudinary.config().keep_test_products

describe "utils", ->
  before "Verify Configuration", ->
    config = cloudinary.config(true)
    if(!(config.api_key && config.api_secret))
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")

  includeContext.call @, 'archive'

  describe '.generate_zip_download_url', ->
    @timeout helper.TIMEOUT_LONG
    archive_result = undefined
    before ->
      archive_result = utils.download_zip_url
        target_public_id: 'gem_archive_test'
        public_ids: [publicId2, publicId1]
        target_tags: ARCHIVE_TAG
    describe 'public_ids', ->
      it 'should generate a valid url', ->
        expect(archive_result).not.to.be.empty()
      it 'should include two files', (done)->
        filename = "#{os.tmpdir()}/deleteme-#{Math.floor(Math.random() * 100000)}.zip"
        https.get archive_result, (res)->
          file = fs.createWriteStream(filename)
          if(res.statusCode == 200)
            res.pipe(file)
          else
            done(new Error "#{res.statusCode}: #{res.headers['x-cld-error']}")
          res.on 'end', ->
            file.on 'close', ->
              list = execSync("unzip -l #{filename}")
              list = list.toString().split('\n').slice(3, -3)
              list = (_.last(i.split(/[ ]+/)) for i in list) # keep only filenames
              expect(list.length).to.eql(2)
              expect(list).to.contain(publicId1 + ".jpg")
              expect(list).to.contain(publicId2 + ".jpg")
              done()

describe "uploader", ->
  before "Verify Configuration", ->
    config = cloudinary.config(true)
    if(!(config.api_key && config.api_secret))
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")

  includeContext.call @, 'archive'
  describe '.create_archive', ->
    @timeout helper.TIMEOUT_LONG
    archive_result = undefined

    before ->
      @timeout helper.TIMEOUT_LONG
      uploader.create_archive(
        target_public_id: 'gem_archive_test'
        public_ids: [publicId2, publicId1]
        target_tags: [TEST_TAG, ARCHIVE_TAG]
        mode: 'create'
        skip_transformation_name: true
      ,
        (error, result)->
          new Error error.message if error?
          archive_result = result
      )
    it 'should return a Hash', ->
      expect(archive_result).to.be.an(Object)
    expected_keys = [
      "resource_type"
      "type"
      "public_id"
      "version"
      "url"
      "secure_url"
      "created_at"
      "tags"
      "signature"
      "bytes"
      "etag"
      "resource_count"
      "file_count"
    ]
    it "should include keys: #{expected_keys.join(', ')}", ->
      expect(archive_result).to.have.keys(expected_keys)
  describe '.create_zip', ->
    @timeout helper.TIMEOUT_LONG
    spy1 = undefined
    spy2 = undefined
    xhr = undefined
    before ->
      spy1 = sinon.spy cloudinary.uploader, "create_archive"
      spy2 = sinon.spy ClientRequest.prototype, 'write'
      xhr = sinon.useFakeXMLHttpRequest()
    after ->
      spy1.restore()
      spy2.restore()
      xhr.restore()
    it 'should call create_archive with "zip" format and ignore missing resources', ->
      uploader.create_zip({tags: TEST_TAG, public_ids: [publicIdRaw, "non-existing-resource"], resource_type: "raw", allow_missing: true})
      expect(spy1.calledWith(null, {tags: TEST_TAG, public_ids: [publicIdRaw, "non-existing-resource"], resource_type: "raw", allow_missing: true}, "zip")).to.be.ok()
      sinon.assert.calledWith(spy2, sinon.match((arg)-> arg.toString().match(/name="allow_missing"\s*1/)))