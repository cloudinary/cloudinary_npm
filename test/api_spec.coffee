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
sharedExamples = helper.sharedExamples
itBehavesLike = helper.itBehavesLike
TEST_TAG        = helper.TEST_TAG
IMAGE_FILE      = helper.IMAGE_FILE
IMAGE_URL       = helper.IMAGE_URL
UPLOAD_TAGS     = helper.UPLOAD_TAGS

SUFFIX = helper.SUFFIX
PUBLIC_ID_PREFIX = "npm_api_test"
PUBLIC_ID = PUBLIC_ID_PREFIX + SUFFIX
PUBLIC_ID_1 = PUBLIC_ID + "_1"
PUBLIC_ID_2 = PUBLIC_ID + "_2"
PUBLIC_ID_3 = PUBLIC_ID + "_3"
PUBLIC_ID_4 = PUBLIC_ID + "_4"
PUBLIC_ID_5 = PUBLIC_ID + "_5"
PUBLIC_ID_6 = PUBLIC_ID + "_6"

NAMED_TRANSFORMATION = "npm_api_test_transformation" + SUFFIX
API_TEST_UPLOAD_PRESET1 = "npm_api_test_upload_preset_1_" + SUFFIX
API_TEST_UPLOAD_PRESET2 = "npm_api_test_upload_preset_2_" + SUFFIX
API_TEST_UPLOAD_PRESET3 = "npm_api_test_upload_preset_3_" + SUFFIX
API_TEST_UPLOAD_PRESET4 = "npm_api_test_upload_preset_4_" + SUFFIX

EXPLICIT_TRANSFORMATION_NAME = "c_scale,l_text:Arial_60:#{TEST_TAG},w_100"
EXPLICIT_TRANSFORMATION = {width: 100, crop: "scale", overlay: "text:Arial_60:#{TEST_TAG}"}

sharedExamples "a list with a cursor", (testFunc, args...)->
  xhr = request = requestStub = requestSpy = writeSpy =undefined
  before ->
    xhr = sinon.useFakeXMLHttpRequest()
    writeSpy = sinon.spy(ClientRequest.prototype, 'write')
    requestSpy = sinon.spy(http, 'request')

  after ->
    writeSpy.restore()
    requestSpy.restore()
    xhr.restore()
  specify ":max_results", ()->
    testFunc args..., max_results: 10
    if writeSpy.called
      sinon.assert.calledWith writeSpy, sinon.match(/max_results=10/)
    else
      sinon.assert.calledWith requestSpy, sinon.match(query: sinon.match(/max_results=10/))
  specify ":next_cursor", ()->
    testFunc args..., next_cursor: 23452342
    if writeSpy.called
      sinon.assert.calledWith writeSpy, sinon.match(/next_cursor=23452342/)
    else
      sinon.assert.calledWith requestSpy, sinon.match(query: sinon.match(/next_cursor=23452342/))

sharedExamples "accepts next_cursor", (testFunc, args...)->
  xhr = request = requestStub = requestSpy = writeSpy =undefined
  before ->
    xhr = sinon.useFakeXMLHttpRequest()
    writeSpy = sinon.spy(ClientRequest.prototype, 'write')
    requestSpy = sinon.spy(http, 'request')

  after ->
    writeSpy.restore()
    requestSpy.restore()
    xhr.restore()
  specify ":next_cursor", ()->
    testFunc args..., next_cursor: 23452342
    if writeSpy.called
      sinon.assert.calledWith writeSpy, sinon.match(/next_cursor=23452342/)
    else
      sinon.assert.calledWith requestSpy, sinon.match(query: sinon.match(/next_cursor=23452342/))


getAllTags = (arr) ->
  arr.resources.map((e) -> e.tags).reduce(((a, b) -> a.concat(b)), [])
describe "api", ->
  before "Verify Configuration", ->
    config = cloudinary.config(true)
    if(!(config.api_key && config.api_secret))
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")

  before (done) ->
    @timeout helper.TIMEOUT_LONG

    Q.allSettled [
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID, tags: UPLOAD_TAGS, context: "key=value", eager: [EXPLICIT_TRANSFORMATION])
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_2, tags: UPLOAD_TAGS, context: "key=value", eager: [EXPLICIT_TRANSFORMATION])
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_5, tags: UPLOAD_TAGS, context: "#{contextKey}=test", eager: [EXPLICIT_TRANSFORMATION])
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_6, tags: UPLOAD_TAGS, context: "#{contextKey}=alt-test", eager: [EXPLICIT_TRANSFORMATION])]
    .finally ->
      done()
    true
  after (done)->
    @timeout helper.TIMEOUT_LONG
    if cloudinary.config().keep_test_products
      done()
    else
      config = cloudinary.config()
      if(!(config.api_key && config.api_secret))
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")

      Q.allSettled [
        cloudinary.v2.api.delete_resources_by_tag TEST_TAG
        cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION)
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET1)
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET2)
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET3)
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET4)]
        .finally ->
          done()
        true

  find_by_attr = (elements, attr, value) ->
    for element in elements
      return element if element[attr] == value
    undefined

  ###*
  # Upload an image to be tested on.
  # @callback the callback recieves the public_id of the uploaded image
  ###
  upload_image = (callback)->
    cloudinary.v2.uploader.upload IMAGE_FILE, (error, result) ->
      expect(error).to.be undefined
      expect(result).to.be.an(Object)
      callback(result)
    true

  contextKey = "test-key#{helper.SUFFIX}"

  describe "resources", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.resources
    it "should allow listing resource_types", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resource_types (error, result) ->
        return done(new Error error.message) if error?
        expect(result.resource_types).to.contain("image")
        done()
      true

    it "should allow listing resources", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, tags: UPLOAD_TAGS, (error, result)->
        done(new Error error.message) if error?
        public_id = result.public_id
        cloudinary.v2.api.resources (error, result) ->
          return done(new Error error.message) if error?
          resource = find_by_attr(result.resources, "public_id", public_id)
          expect(resource).not.to.eql(undefined)
          expect(resource.type).to.eql("upload")
          done()
        true
      true

    it "should allow listing resources by type", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, tags: UPLOAD_TAGS, (error, result)->
        return done(new Error error.message) if error?
        public_id = result.public_id
        cloudinary.v2.api.resources type: "upload", (error, result) ->
          return done(new Error error.message) if error?
          resource = find_by_attr(result.resources, "public_id", public_id)
          expect(resource).to.be.an(Object)
          expect(resource.type).to.eql("upload")
          done()
        true
      true

    it "should allow listing resources by prefix", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources type: "upload", prefix: PUBLIC_ID_PREFIX, max_results: 500, (error, result) ->
        return done(new Error error.message) if error?
        public_ids = (resource.public_id for resource in result.resources)
        expect(public_ids).to.contain(PUBLIC_ID)
        expect(public_ids).to.contain(PUBLIC_ID_2)
        done()
      true

    itBehavesLike "a list with a cursor", cloudinary.v2.api.resources_by_tag, TEST_TAG
    it "should allow listing resources by tag", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_tag TEST_TAG, context: true, tags: true, max_results: 500, (error, result) ->
        return done(new Error error.message) if error?
        expect(result.resources.map((e) -> e.public_id)).to.contain(PUBLIC_ID)
                                                        .and.contain(PUBLIC_ID_2)
        expect(getAllTags(result)).to.contain(TEST_TAG)
        expect(result.resources.map((e) -> if e.context? then e.context.custom.key else null)).to.contain("value")
        done()
      true


    it "should allow listing resources by context only", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_context contextKey,null, (error, result) ->
        return done(new Error error.message) if error?
        expect(result.resources).to.have.length(2)
        done()
      true

    it "should allow listing resources by context key and value", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_context contextKey,"test", (error, result) ->
        return done(new Error error.message) if error?
        expect(result.resources).to.have.length(1)
        done()
      true

    it "should allow listing resources by public ids", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_ids [PUBLIC_ID, PUBLIC_ID_2], context: true, tags: true, (error, result) ->
        return done(new Error error.message) if error?
        resource = find_by_attr(result.resources, "public_id", PUBLIC_ID)
        expect(result.resources.map((e) -> e.public_id).sort()).to.eql([PUBLIC_ID,PUBLIC_ID_2])
        expect(getAllTags(result)).to.contain(TEST_TAG)
        expect(result.resources.map((e) -> e.context.custom.key)).to.contain("value")
        done()
      true

    it "should allow listing resources specifying direction", (done) ->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.resources_by_tag TEST_TAG, type: "upload", max_results: 500, direction: "asc", (error, result) =>
        return done(new Error error.message) if error?
        asc = (resource.public_id for resource in result.resources)
        cloudinary.v2.api.resources_by_tag TEST_TAG, type: "upload", max_results: 500, direction: "desc", (error, result) ->
          return done(new Error error.message) if error?
          desc = (resource.public_id for resource in result.resources)
          expect(asc.reverse()).to.eql(desc)
          done()
        true
      true

    it "should allow listing resources by start_at", (done) ->
      xhr = sinon.useFakeXMLHttpRequest()
      writeSpy = sinon.spy(ClientRequest.prototype, 'write')
      requestSpy = sinon.spy(http, 'request')
      start_at = new Date().toString()
      cloudinary.v2.api.resources( type: "upload", start_at: start_at, direction: "asc"
      ).then ->
        if writeSpy.called
          sinon.assert.calledWith writeSpy, sinon.match(/stazdfasrt_at=10/)
        else
          formatted = encodeURIComponent(start_at.slice(0,start_at.search("\\("))) # cut the date string before the '('
        done()
      .fail (error)->
        done(error)
      .finally ->
        writeSpy.restore()
        requestSpy.restore()
        xhr.restore()
      true


    it "should allow get resource metadata", (done) ->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.uploader.upload IMAGE_FILE, tags: UPLOAD_TAGS, eager: [EXPLICIT_TRANSFORMATION], (error, result)->
        done(new Error error.message) if error?
        public_id = result.public_id
        cloudinary.v2.api.resource public_id, (error, resource) ->
          done(new Error error.message) if error?
          expect(resource).not.to.eql(undefined)
          expect(resource.public_id).to.eql(public_id)
          expect(resource.bytes).to.eql(3381)
          expect(resource.derived).to.have.length(1)
          done()
        true
      true

  describe "delete", ()->
    it "should allow deleting derived resource", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, tags: UPLOAD_TAGS, eager: [width: 101, crop: "scale"], (error, r) ->
        return done(new Error error.message) if error?
        public_id = r.public_id
        cloudinary.v2.api.resource public_id, (error, resource) ->
          return done(new Error error.message) if error?
          expect(resource).not.to.eql(undefined)
          expect(resource.bytes).to.eql(3381)
          expect(resource.derived).to.have.length(1)
          derived_resource_id = resource.derived[0].id
          cloudinary.v2.api.delete_derived_resources derived_resource_id, (error, r) ->
            return done(new Error error.message) if error?
            cloudinary.v2.api.resource public_id, (error, resource) ->
              return done(new Error error.message) if error?
              expect(resource).not.to.eql(undefined)
              expect(resource.derived).to.have.length(0)
              done()
            true
          true
        true
      true

    it "should allow deleting resources", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, public_id: PUBLIC_ID_3, tags: UPLOAD_TAGS, (error, r) ->
        return done(new Error error.message) if error?
        cloudinary.v2.api.resource PUBLIC_ID_3, (error, resource) ->
          expect(resource).not.to.eql(undefined)
          cloudinary.v2.api.delete_resources ["apit_test", PUBLIC_ID_2, PUBLIC_ID_3], (error, result) ->
            return done(new Error error.message) if error?
            cloudinary.v2.api.resource PUBLIC_ID_3, (error, result) ->
              expect(error).to.be.an(Object)
              expect(error.http_code).to.eql 404
              done()
            true
          true
        true
      true

    describe "delete_resources_by_prefix", ->
      itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, "prefix_foobar"
      it "should allow deleting resources by prefix", (done) ->
        @timeout helper.TIMEOUT_MEDIUM
        cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test_by_prefix", tags: UPLOAD_TAGS, (error, r) ->
          return done(new Error error.message) if error?
          cloudinary.v2.api.resource "api_test_by_prefix", (error, resource) ->
            expect(resource).not.to.eql(undefined)
            cloudinary.v2.api.delete_resources_by_prefix "api_test_by", () ->
              cloudinary.v2.api.resource "api_test_by_prefix", (error, result) ->
                expect(error).to.be.an(Object)
                expect(error.http_code).to.eql 404
                done()
              true
            true
          true
        true


    describe "delete_resources_by_tag", ->
      deleteTestTag = TEST_TAG + "_delete"
      itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, deleteTestTag
      it "should allow deleting resources by tags", (done) ->
        @timeout helper.TIMEOUT_MEDIUM
        cloudinary.v2.uploader.upload IMAGE_FILE, public_id: PUBLIC_ID_4, tags: UPLOAD_TAGS.concat([deleteTestTag]) , (error, result) ->
          return done(new Error error.message) if error?
          cloudinary.v2.api.resource PUBLIC_ID_4, (error, resource) ->
            expect(resource).to.be.ok()
            cloudinary.v2.api.delete_resources_by_tag deleteTestTag, (error, result) ->
              return done(new Error error.message) if error?
              cloudinary.v2.api.resource PUBLIC_ID_4, (error, result) ->
                expect(error).to.be.an(Object)
                expect(error.http_code).to.eql 404
                done()
              true
            true
          true
        true

  describe "tags", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.tags
    it "should allow listing tags", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags max_results: 50, (error, result) ->
        return done(new Error error.message) if error?
        expect(result.tags).to.contain(TEST_TAG)
        done()
      true

    it "should allow listing tag by prefix ", (done) =>
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags prefix: TEST_TAG[0..-2], max_results: 500, (error, result) =>
        return done(new Error error.message) if error?
        expect(result.tags).to.contain(TEST_TAG)
        done()
      true

    it "should allow listing tag by prefix if not found", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags prefix: "api_test_no_such_tag", (error, result) ->
        return done(new Error error.message) if error?
        expect(result.tags).to.be.empty()
        done()
      true

  describe "transformations", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.transformation, EXPLICIT_TRANSFORMATION_NAME
    itBehavesLike "a list with a cursor", cloudinary.v2.api.transformations

    it "should allow listing transformations", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformations (error, result) ->
        return done(new Error error.message) if error?
        transformation = find_by_attr(result.transformations, "name", EXPLICIT_TRANSFORMATION_NAME)
        expect(transformation).not.to.eql(undefined)
        expect(transformation.used).to.be.ok
        done()
      true

    it "should allow getting transformation metadata", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation EXPLICIT_TRANSFORMATION_NAME, (error, transformation) ->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION])
        done()
      true

    it "should allow getting transformation metadata by info", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation EXPLICIT_TRANSFORMATION, (error, transformation) ->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION])
        done()
      true

    it "should allow updating transformation allowed_for_strict", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.update_transformation EXPLICIT_TRANSFORMATION_NAME, {allowed_for_strict: true}, () ->
        cloudinary.v2.api.transformation EXPLICIT_TRANSFORMATION_NAME, (error, transformation) ->
          expect(transformation).not.to.eql(undefined)
          expect(transformation.allowed_for_strict).to.be.ok
          cloudinary.v2.api.update_transformation EXPLICIT_TRANSFORMATION_NAME, {allowed_for_strict: false}, () ->
            cloudinary.v2.api.transformation EXPLICIT_TRANSFORMATION_NAME, (error, transformation) ->
              expect(transformation).not.to.eql(undefined)
              expect(transformation.allowed_for_strict).not.to.be.ok
              done()
            true
          true
        true
      true

    it "should allow creating named transformation", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_transformation NAMED_TRANSFORMATION, {crop: "scale", width: 102}, () ->
        cloudinary.v2.api.transformation NAMED_TRANSFORMATION, (error, transformation) ->
          expect(transformation).not.to.eql(undefined)
          expect(transformation.allowed_for_strict).to.be.ok
          expect(transformation.info).to.eql([crop: "scale", width: 102])
          expect(transformation.used).not.to.be.ok
          done()
        true
      true

    it "should allow unsafe update of named transformation", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_transformation "api_test_transformation3", {crop: "scale", width: 102}, () ->
        cloudinary.v2.api.update_transformation "api_test_transformation3", {unsafe_update: {crop: "scale", width: 103}}, () ->
          cloudinary.v2.api.transformation "api_test_transformation3", (error, transformation) ->
            expect(transformation).not.to.eql(undefined)
            expect(transformation.info).to.eql([crop: "scale", width: 103])
            expect(transformation.used).not.to.be.ok
            done()
          true
        true
      true

    it "should allow deleting named transformation", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.delete_transformation NAMED_TRANSFORMATION, () ->
        cloudinary.v2.api.transformation NAMED_TRANSFORMATION, (error, transformation) ->
          expect(error.http_code).to.eql 404
          done()
        true
      true

    it "should allow deleting implicit transformation", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation EXPLICIT_TRANSFORMATION_NAME, (error, transformation) ->
        expect(transformation).to.be.an(Object)
        cloudinary.v2.api.delete_transformation EXPLICIT_TRANSFORMATION_NAME, () ->
          cloudinary.v2.api.transformation EXPLICIT_TRANSFORMATION_NAME, (error, transformation) ->
            expect(error.http_code).to.eql 404
            done()
          true
        true
      true

  describe "upload_preset", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.upload_presets
    it "should allow creating and listing upload_presets", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      create_names = [API_TEST_UPLOAD_PRESET3, API_TEST_UPLOAD_PRESET2, API_TEST_UPLOAD_PRESET1]
      delete_names = []
      after_delete = ->
        delete_names.pop()
        done() if delete_names.length == 0
        true
      validate_presets = ->
        cloudinary.v2.api.upload_presets (error, response) ->
          expect(response.presets.slice(0,3).map((p) -> p.name)).to.eql(delete_names)
          delete_names.forEach (name) ->
            cloudinary.v2.api.delete_upload_preset name, after_delete
            true
        true

      after_create = ->
        if create_names.length > 0
          name = create_names.pop()
          delete_names.unshift(name)
          cloudinary.v2.api.create_upload_preset name: name , folder: "folder", after_create
          true
        else
          validate_presets()

      after_create()
      true

    it "should allow getting a single upload_preset", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_upload_preset unsigned: true, folder: "folder", transformation: EXPLICIT_TRANSFORMATION, tags: ["a","b","c"], context: {a: "b", c: "d"}, (error, preset) ->
        name = preset.name
        cloudinary.v2.api.upload_preset name, (error, preset) ->
          expect(preset.name).to.eql(name)
          expect(preset.unsigned).to.eql(true)
          expect(preset.settings.folder).to.eql("folder")
          expect(preset.settings.transformation).to.eql([EXPLICIT_TRANSFORMATION])
          expect(preset.settings.context).to.eql({a: "b", c: "d"})
          expect(preset.settings.tags).to.eql(["a","b","c"])
          cloudinary.v2.api.delete_upload_preset name, ->
            done()
          true
        true
      true

    it "should allow deleting upload_presets", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_upload_preset name: API_TEST_UPLOAD_PRESET4, folder: "folder", (error, preset) ->
        cloudinary.v2.api.upload_preset API_TEST_UPLOAD_PRESET4, ->
          cloudinary.v2.api.delete_upload_preset API_TEST_UPLOAD_PRESET4, ->
            cloudinary.v2.api.upload_preset API_TEST_UPLOAD_PRESET4, (error, result) ->
              expect(error.message).to.contain "Can't find"
              done()
            true
          true
        true
      true

    it "should allow updating upload_presets", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_upload_preset folder: "folder", (error, preset) ->
        name = preset.name
        cloudinary.v2.api.upload_preset name, (error, preset) ->
          cloudinary.v2.api.update_upload_preset name, utils.merge(preset.settings, {colors: true, unsigned: true, disallow_public_id: true}), (error, preset) ->
            cloudinary.v2.api.upload_preset name, (error, preset) ->
              expect(preset.name).to.eql(name)
              expect(preset.unsigned).to.eql(true)
              expect(preset.settings).to.eql(folder: "folder", colors: true, disallow_public_id: true)
              cloudinary.v2.api.delete_upload_preset name, ->
                done()
              true
            true
          true
        true
      true

  it "should support the usage API call", (done) ->
    @timeout helper.TIMEOUT_MEDIUM
    cloudinary.v2.api.usage (error, usage) ->
      expect(usage.last_update).not.to.eql null
      done()
    true

  describe "delete_all_resources", ->
    itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_all_resources
    describe "keep_original: yes", ->
      it "should allow deleting all derived resources", (done) ->
        @timeout helper.TIMEOUT_MEDIUM
        cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test5", eager: {transformation: {width: 101, crop: "scale"}}, tags: UPLOAD_TAGS, (error, upload_result) ->
          cloudinary.v2.api.resource "api_test5", (error, resource) ->
            return done(new Error error.message) if error?
            expect(resource).to.be.an(Object)
            expect(resource.derived).not.to.be.empty()
            # Prepare to loop until no more resources to delete
            delete_all = (next, callback)->
              options = {keep_original: yes}
              options.next_cursor = next if next?
              cloudinary.v2.api.delete_all_resources options, (error, delete_result) ->
                return done(new Error error.message) if error?
                if delete_result.next_cursor?
                  delete_all(delete_result.next_cursor, callback)
                else
                  callback()
            # execute loop
            delete_all undefined, ()->
              cloudinary.v2.api.resource "api_test5", (error, new_resource) ->
                return done(new Error error.message) if error?
                expect(new_resource.derived).to.be.empty()
                done()
              true
          true
        true

  describe "update", ()->
    describe "notification url", ()->
      xhr = request = requestStub = requestSpy = writeSpy =undefined
      before ->
        xhr = sinon.useFakeXMLHttpRequest()
        writeSpy = sinon.spy(ClientRequest.prototype, 'write')
      after ->
        writeSpy.restore()
        xhr.restore()
      it "should support changing moderation status with notification-url", ()->
        cloudinary.v2.api.update "sample", moderation_status: "approved", notification_url: "http://example.com"
        if writeSpy.called
          sinon.assert.calledWith writeSpy, sinon.match(/notification_url=http%3A%2F%2Fexample.com/)
          sinon.assert.calledWith writeSpy, sinon.match(/moderation_status=approved/)

    it "should support setting manual moderation status", (done) ->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.uploader.upload IMAGE_FILE, moderation: "manual", (error, upload_result) ->
        cloudinary.v2.api.update upload_result.public_id, moderation_status: "approved", (error, api_result) ->
          expect(api_result.moderation[0].status).to.eql("approved")
          done()
        true
      true

    it "should support requesting ocr info", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, ocr: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()
        true

    it "should support requesting raw conversion", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, raw_convert: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()
        true

    it "should support requesting categorization", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, categorization: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()
        true

    it "should support requesting detection", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, detection: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()
        true

    it "should support requesting background_removal", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, background_removal: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()
        true

    it "should support requesting similarity_search", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, similarity_search: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()
        true

    it "should support requesting auto_tagging", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, auto_tagging: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Must use"
          done()
        true

  it "should support listing by moderation kind and value", (done) ->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.resources_by_moderation, "manual", "approved"
    @timeout helper.TIMEOUT_MEDIUM
    ids = []
    api_results =[]
    lists = {}
    after_listing = (list) ->
      (error, list_result) ->
        lists[list] = list_result.resources.map((r) -> r.public_id)
        if _.keys(lists).length == 3
          expect(lists.approved).to.contain(ids[0])
          expect(lists.approved).not.to.contain(ids[1])
          expect(lists.approved).not.to.contain(ids[2])
          expect(lists.rejected).to.contain(ids[1])
          expect(lists.rejected).not.to.contain(ids[0])
          expect(lists.rejected).not.to.contain(ids[2])
          expect(lists.pending).to.contain(ids[2])
          expect(lists.pending).not.to.contain(ids[0])
          expect(lists.pending).not.to.contain(ids[1])
          done()

    after_update = (error, api_result) ->
      api_results.push(api_result)
      if api_results.length == 2
        cloudinary.v2.api.resources_by_moderation("manual", "approved", max_results: 1000, moderations: true, after_listing("approved"))
        cloudinary.v2.api.resources_by_moderation("manual", "rejected", max_results: 1000, moderations: true, after_listing("rejected"))
        cloudinary.v2.api.resources_by_moderation("manual", "pending", max_results: 1000, moderations: true, after_listing("pending"))

    after_upload = (error, upload_result) ->
      return done(new Error error.message) if error?
      ids.push(upload_result.public_id)
      if ids.length == 3
        cloudinary.v2.api.update ids[0], moderation_status: "approved", after_update
        cloudinary.v2.api.update ids[1], moderation_status: "rejected", after_update

    cloudinary.v2.uploader.upload(IMAGE_FILE, moderation: "manual", tags: UPLOAD_TAGS, after_upload)
    cloudinary.v2.uploader.upload(IMAGE_FILE, moderation: "manual", tags: UPLOAD_TAGS, after_upload)
    cloudinary.v2.uploader.upload(IMAGE_FILE, moderation: "manual", tags: UPLOAD_TAGS, after_upload)
    true

  # For this test to work, "Auto-create folders" should be enabled in the Upload Settings.
  # Replace `it` with  `it.skip` below if you want to disable it.
  it "should list folders in cloudinary", (done)->
    @timeout helper.TIMEOUT_LONG
    Q.all([
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/item', tags: UPLOAD_TAGS),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder2/item', tags: UPLOAD_TAGS),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder2/item', tags: UPLOAD_TAGS),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/test_subfolder1/item', tags: UPLOAD_TAGS),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/test_subfolder2/item', tags: UPLOAD_TAGS)
    ]).then((results)->
      Q.all([
        cloudinary.v2.api.root_folders(),
        cloudinary.v2.api.sub_folders('test_folder1')
      ])
    ).then((results)->
      root= results[0]
      root_folders = (folder.name for folder in root.folders)
      sub_1 = results[1]
      expect(root_folders).to.contain('test_folder1')
      expect(root_folders).to.contain('test_folder2')
      expect(sub_1.folders[0].path).to.eql('test_folder1/test_subfolder1')
      expect(sub_1.folders[1].path).to.eql('test_folder1/test_subfolder2')
      cloudinary.v2.api.sub_folders('test_folder_not_exists')
    ).then((result)->
      console.log('error test_folder_not_exists should not pass to "then" handler but "catch"')
      expect(true).to.eql(false)
    ).catch((err)->
      expect(err.error.message).to.eql('Can\'t find folder with path test_folder_not_exists')
      done()
    )
    true

  describe '.restore', ->
    @timeout helper.TIMEOUT_MEDIUM
    before (done)->
      cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test_restore", backup: true, tags: UPLOAD_TAGS, (error, result)->
        return done(new Error error.message) if error?
        cloudinary.v2.api.resource "api_test_restore", (error, resource)->
          return done(new Error error.message) if error?
          expect(resource).not.to.be(null)
          expect(resource["bytes"]).to.eql(3381)
          cloudinary.v2.api.delete_resources "api_test_restore", (error, resource)->
            return done(new Error error.message) if error?
            cloudinary.v2.api.resource "api_test_restore", (error, resource)->
              return done(new Error error.message) if error?
              expect(resource).not.to.be(null)
              expect(resource["bytes"]).to.eql(0)
              expect(resource["placeholder"]).to.eql(true)
              done()
            true
          true
        true
      true

    it 'should restore a deleted resource', (done)->
      cloudinary.v2.api.restore "api_test_restore", (error, response)->
        info = response["api_test_restore"]
        expect(info).not.to.be(null)
        expect(info["bytes"]).to.eql(3381)
        cloudinary.v2.api.resource "api_test_restore", (error, resource)->
          expect(resource).not.to.be(null)
          expect(resource["bytes"]).to.eql(3381)
          done()
        true
      true


  describe 'mapping', ->
    mapping = "api_test_upload_mapping#{Math.floor(Math.random() * 100000)}"
    deleteMapping = false
    after (done)->
      if(deleteMapping)
        cloudinary.v2.api.delete_upload_mapping mapping, (error, result)->
          done()
        true
      else
        done()
    itBehavesLike "a list with a cursor", cloudinary.v2.api.upload_mappings
    it 'should create mapping', (done)->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.create_upload_mapping mapping, template: "http://cloudinary.com", tags: UPLOAD_TAGS, (error, result)->
        return done(new Error error.message) if error?
        deleteMapping = true
        cloudinary.v2.api.upload_mapping mapping, (error, result)->
          return done(new Error error.message) if error?
          expect(result['template']).to.eql("http://cloudinary.com")
          cloudinary.v2.api.update_upload_mapping mapping, template: "http://res.cloudinary.com", (error, result)->
            return done(new Error error.message) if error?
            cloudinary.v2.api.upload_mapping mapping, (error, result)->
              return done(new Error error.message) if error?
              expect(result["template"]).to.eql("http://res.cloudinary.com")
              cloudinary.v2.api.upload_mappings (error, result)->
                return done(new Error error.message) if error?
                expect(_.find(result["mappings"], {folder: mapping, template: "http://res.cloudinary.com"})).to.be.ok()
                cloudinary.v2.api.delete_upload_mapping mapping, (error, result)->
                  return done(new Error error.message) if error?
                  deleteMapping = false
                  cloudinary.v2.api.upload_mappings (error, result)->
                    return done(new Error error.message) if error?
                    expect(_.find(result["mappings"], _.matchesProperty('folder', mapping))).not.to.be.ok()
                    done()
                  true
                true
              true
            true
          true
        true
      true

  describe "publish", ->
    @timeout helper.TIMEOUT_LONG
    i = 0

    publishTestId = ""
    publishTestTag = ""
    idsToDelete = []
    beforeEach (done)->
      publishTestTag = TEST_TAG + i++
      cloudinary.v2.uploader.upload IMAGE_FILE, type: "authenticated", tags: UPLOAD_TAGS.concat([publishTestTag]), (error, result)->
        return done(new Error error.message) if error?
        publishTestId = result.public_id
        idsToDelete.push publishTestId
        done()
      true
    after (done)->
      # cleanup any resource that were not published
      cloudinary.v2.api.delete_resources  idsToDelete, type: "authenticated", (error, result)->
        return done(new Error error.message) if error?
        done()
      true
    it "should publish by public id", (done)->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.publish_by_ids [publishTestId], type: "authenticated", (error, result)->
        return done(new Error error.message) if error?
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
        done()
      true
    it "should publish by prefix", (done)->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.publish_by_prefix publishTestId[0..-2], (error, result)->
        return done(new Error error.message) if error?
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
        done()
      true
    it "should publish by tag", (done)->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.publish_by_tag publishTestTag, (error, result)->
        return done(new Error error.message) if error?
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
        done()
      true
    it "should return empty when explicit given type doesn't match resource", (done)->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.publish_by_ids [publishTestId], type: "private", (error, result)->
        return done(new Error error.message) if error?
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(0)
        done()
      true

  describe "access_mode", ->
    i = 0
    @timeout helper.TIMEOUT_LONG
    publicId = ""
    access_mode_tag = ''
    beforeEach (done)->
      access_mode_tag = TEST_TAG + "access_mode" + i++
      cloudinary.v2.uploader.upload IMAGE_FILE, access_mode: "authenticated", tags: UPLOAD_TAGS.concat([access_mode_tag]), (error, result)->
        return done(new Error error.message) if error?
        publicId = result.public_id
        expect(result.access_mode).to.be("authenticated")
        done()
      true
    it "should update access mode by ids", (done)->
      cloudinary.v2.api.update_resources_access_mode_by_ids "public", [publicId], (error, result)->
        return done(new Error error.message) if error?
        expect(result.updated).to.be.an('array')
        expect(result.updated.length).to.be(1)
        resource = result.updated[0]
        expect(resource.public_id).to.be(publicId)
        expect(resource.access_mode).to.be('public')
        done()
      true
    it "should update access mode by prefix", (done)->
      cloudinary.v2.api.update_resources_access_mode_by_prefix "public", publicId[0..-3], (error, result)->
        return done(new Error error.message) if error?
        expect(result.updated).to.be.an('array')
        expect(result.updated.length).to.be(1)
        resource = result.updated[0]
        expect(resource.public_id).to.be(publicId)
        expect(resource.access_mode).to.be('public')
        done()
      true
    it "should update access mode by tag", (done)->
      cloudinary.v2.api.update_resources_access_mode_by_tag "public", access_mode_tag, (error, result)->
        return done(new Error error.message) if error?
        expect(result.updated).to.be.an('array')
        expect(result.updated.length).to.be(1)
        resource = result.updated[0]
        expect(resource.public_id).to.be(publicId)
        expect(resource.access_mode).to.be('public')
        done()
      true
