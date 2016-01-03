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

exec = require('child_process').exec
execSync = require('child_process').execSync
_ = require("lodash")
Q = require('q')
fs = require('fs')
os = require('os')

helper = require("./spechelper")
TEST_TAG        = helper.TEST_TAG
sharedExamples = helper.sharedExamples
itBehavesLike = helper.itBehavesLike
includeContext = helper.includeContext
test_cloudinary_url = helper.test_cloudinary_url

# Defined globals
cloud_name = ''
root_path = ''


ARCHIVE_TAG = "archive_test_tag_#{Math.floor(Math.random()*10000)}"

sharedExamples 'archive', ->
  before (done)=>
    console.log("before")
    @timeout helper.TIMEOUT_LONG
    Q.all [
      uploader.upload(
        "http://res.cloudinary.com/demo/image/upload/sample.jpg",
        public_id:  'tag_samplebw'
        tags:  [TEST_TAG, ARCHIVE_TAG]
        transformation:
          effect:  "blackwhite"
      )
      uploader.upload(
        "http://res.cloudinary.com/demo/image/upload/sample.jpg",
        public_id:  'tag_sample'
        tags:  [TEST_TAG, ARCHIVE_TAG]
        transformation:  {
          effect:  "blackwhite"
        }
      )]
    .finally ->
      console.log("finally")
      done()

describe "Utils", ->
  includeContext.call @,  'archive'

  describe '.generate_zip_download_url', ->
    @timeout helper.TIMEOUT_LONG
    archive_result =
      utils.download_zip_url
          target_public_id:  'gem_archive_test'
          public_ids:  ["tag_sample", "tag_samplebw"]
          tags:  ARCHIVE_TAG
    console.log(archive_result)
    describe 'public_ids', ->
      it 'should generate a valid url', ->
        expect(archive_result).not.to.be.empty()
      it 'should include two files', (done)->
        filename = "#{os.tmpdir()}/deleteme-#{Math.floor(Math.random()*100000)}.zip"
        https.get archive_result, (res)->
          file = fs.createWriteStream(filename)
          console.log("zip file is #{filename}")
          if(res.statusCode == 200)
            console.log("Writing to file")
            res.pipe(file)
          else
            console.log(res.headers['status'] + ' ' + res.headers['x-cld-error'])
            done(new Error res.statusCode)
          res.on 'end', ->
            console.log("zip - end")
            file.on 'close', ->
              list = execSync("unzip -l #{filename}")
              console.dir(list.toString())
              list = list.toString().split('\n').slice(3, -3)
              list = (_.last(i.split(/[ ]+/)) for i in list) # keep only filenames
              console.log(list)
              expect(list.length).to.eql(2)
              expect(list).to.contain("tag_sample.jpg")
              expect(list).to.contain("tag_samplebw.jpg")
              done()

describe "Uploader", ->

  includeContext.call @, 'archive'
  describe '.create_archive', ->
    @timeout helper.TIMEOUT_LONG
    archive_result = undefined

    before (done)->
      @timeout helper.TIMEOUT_LONG
      uploader.create_archive(
            target_public_id:  'gem_archive_test'
            public_ids:  ["tag_sample", "tag_samplebw"]
            tags:  ARCHIVE_TAG
            mode: 'create'
          ,
          (error, result)->
            return done(new Error error.message) if error?
            archive_result = result
            done()
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
    spy = undefined
    before ->
      spy = sinon.spy cloudinary.uploader, "create_archive"
    after ->
      spy.reset()
    it 'should call create_archive with "zip" format', ->
      uploader.create_zip({ tags:  TEST_TAG })
      console.dir(spy.lastCall)
      expect(spy.calledWith(null, { tags:  TEST_TAG }, "zip")).to.be.ok()
