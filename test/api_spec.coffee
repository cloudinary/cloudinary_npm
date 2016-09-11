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



describe "api", ->
  return console.warn("**** Please setup environment for api test to run!") if !cloudinary.config().api_secret?

  after (done)->
    if cloudinary.config().keep_test_products
      done()
    else
      cloudinary.v2.api.delete_resources_by_tag helper.TEST_TAG, (error, result) ->
        if error?
          done(new Error error.message) 
        else 
          done()

  PUBLIC_ID = "api_test"
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

  before (done) ->
    @timeout 0
    @timestamp_tag = "#{TEST_TAG}_#{cloudinary.utils.timestamp()}"

    cloudinary.v2.api.delete_resources [PUBLIC_ID, "api_test1", "api_test2"], (error, result)->
      Q.all [
        cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID, tags: [TEST_TAG, @timestamp_tag], context: "key=value", eager: [width: 100, crop: "scale"])
        cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: "api_test2", tags: [TEST_TAG, @timestamp_tag], context: "key=value", eager: [width: 100, crop: "scale"])
        cloudinary.v2.api.delete_transformation("api_test_transformation")
        cloudinary.v2.api.delete_upload_preset("api_test_upload_preset1")
        cloudinary.v2.api.delete_upload_preset("api_test_upload_preset2")
        cloudinary.v2.api.delete_upload_preset("api_test_upload_preset3")
        cloudinary.v2.api.delete_upload_preset("api_test_upload_preset4")]
      .finally ->
        done()

  describe "resources", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.resources
    it "should allow listing resource_types", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resource_types (error, result) ->
        return done(new Error error.message) if error?
        expect(result.resource_types).to.contain("image")
        done()

    it "should allow listing resources", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, tags: [TEST_TAG, @timestamp_tag], (error, result)->
        done(new Error error.message) if error?
        public_id = result.public_id
        cloudinary.v2.api.resources (error, result) ->
          return done(new Error error.message) if error?
          resource = find_by_attr(result.resources, "public_id", public_id)
          expect(resource).not.to.eql(undefined)
          expect(resource.type).to.eql("upload")
          done()

    it "should allow listing resources by type", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, tags: [TEST_TAG, @timestamp_tag], (error, result)->
        return done(new Error error.message) if error?
        public_id = result.public_id
        cloudinary.v2.api.resources type: "upload", (error, result) ->
          return done(new Error error.message) if error?
          resource = find_by_attr(result.resources, "public_id", public_id)
          expect(resource).to.be.an(Object)
          expect(resource.type).to.eql("upload")
          done()

    it "should allow listing resources by prefix", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources type: "upload", prefix: PUBLIC_ID, (error, result) ->
        return done(new Error error.message) if error?
        public_ids = (resource.public_id for resource in result.resources)
        expect(public_ids).to.contain(PUBLIC_ID)
        expect(public_ids).to.contain("api_test2")
        done()

    itBehavesLike "a list with a cursor", cloudinary.v2.api.resources_by_tag, TEST_TAG
    it "should allow listing resources by tag", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_tag TEST_TAG, context: true, tags: true, (error, result) ->
        return done(new Error error.message) if error?
        expect(result.resources.map((e) -> e.public_id)).to.contain(PUBLIC_ID)
                                                        .and.contain("api_test2")
        expect(result.resources.map((e) -> e.tags[0])).to.contain(TEST_TAG)
        expect(result.resources.map((e) -> if e.context? then e.context.custom.key else null)).to.contain("value")
        done()


    it "should allow listing resources by public ids", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_ids [PUBLIC_ID, "api_test2"], context: true, tags: true, (error, result) ->
        return done(new Error error.message) if error?
        resource = find_by_attr(result.resources, "public_id", PUBLIC_ID)
        expect(result.resources.map((e) -> e.public_id).sort()).to.eql([PUBLIC_ID,"api_test2"])
        expect(result.resources.map((e) -> e.tags[0])).to.contain(TEST_TAG)
        expect(result.resources.map((e) -> e.context.custom.key)).to.contain("value")
        done()

    it "should allow listing resources specifying direction", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_tag @timestamp_tag, type: "upload", direction: "asc", (error, result) =>
        return done(new Error error.message) if error?
        asc = (resource.public_id for resource in result.resources)
        cloudinary.v2.api.resources_by_tag @timestamp_tag, type: "upload", direction: "desc", (error, result) ->
          return done(new Error error.message) if error?
          desc = (resource.public_id for resource in result.resources)
          expect(asc.reverse()).to.eql(desc)
          done()

    it "should allow listing resources by start_at", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      setTimeout ->
        cloudinary.v2.uploader.upload IMAGE_FILE, (error, response) ->
          done(new Error error.message) if error?
          start_at = new Date(new Date( response.created_at) - 500)
          cloudinary.v2.api.resources type: "upload", start_at: start_at, direction: "asc", (error, resources_response) ->
            done(new Error error.message) if error?
            expect(resources_response.resources).to.have.length(1)
            expect(resources_response.resources[0].public_id).to.eql(response.public_id)
            done()
      ,1000

    it "should allow get resource metadata", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, tags: [TEST_TAG, @timestamp_tag], eager: [width: 100, crop: "scale"], (error, result)->
        done(new Error error.message) if error?
        public_id = result.public_id
        cloudinary.v2.api.resource public_id, (error, resource) ->
          done(new Error error.message) if error?
          expect(resource).not.to.eql(undefined)
          expect(resource.public_id).to.eql(public_id)
          expect(resource.bytes).to.eql(3381)
          expect(resource.derived).to.have.length(1)
          done()

  describe "delete", ()->
    it "should allow deleting derived resource", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, eager: [width: 101, crop: "scale"], (error, r) ->
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

    it "should allow deleting resources", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test3", (error, r) ->
        return done(new Error error.message) if error?
        cloudinary.v2.api.resource "api_test3", (error, resource) ->
          expect(resource).not.to.eql(undefined)
          cloudinary.v2.api.delete_resources ["apit_test", "api_test2", "api_test3"], (error, result) ->
            return done(new Error error.message) if error?
            cloudinary.v2.api.resource "api_test3", (error, result) ->
              expect(error).to.be.an(Object)
              expect(error.http_code).to.eql 404
              done()

    describe "delete_resources_by_prefix", ->
      itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, "prefix_foobar"
      it "should allow deleting resources by prefix", (done) ->
        @timeout helper.TIMEOUT_MEDIUM
        cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test_by_prefix", (error, r) ->
          return done(new Error error.message) if error?
          cloudinary.v2.api.resource "api_test_by_prefix", (error, resource) ->
            expect(resource).not.to.eql(undefined)
            cloudinary.v2.api.delete_resources_by_prefix "api_test_by", () ->
              cloudinary.v2.api.resource "api_test_by_prefix", (error, result) ->
                expect(error).to.be.an(Object)
                expect(error.http_code).to.eql 404
                done()


    describe "delete_resources_by_tag", ->
      itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, "api_test_tag_for_delete"
      it "should allow deleting resources by tags", (done) ->
        @timeout helper.TIMEOUT_MEDIUM
        cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test4", tags: ["api_test_tag_for_delete"] , (error, result) ->
          return done(new Error error.message) if error?
          cloudinary.v2.api.resource "api_test4", (error, resource) ->
            expect(resource).to.be.ok()
            cloudinary.v2.api.delete_resources_by_tag "api_test_tag_for_delete", (error, result) ->
              return done(new Error error.message) if error?
              cloudinary.v2.api.resource "api_test4", (error, result) ->
                expect(error).to.be.an(Object)
                expect(error.http_code).to.eql 404
                done()

  describe "tags", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.tags
    it "should allow listing tags", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags max_results: 50, (error, result) ->
        return done(new Error error.message) if error?
        expect(result.tags).to.contain(TEST_TAG)
        done()

    it "should allow listing tag by prefix ", (done) =>
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags prefix: TEST_TAG.slice(0,6), (error, result) =>
        return done(new Error error.message) if error?
        expect(result.tags).to.contain(TEST_TAG)
        done()

    it "should allow listing tag by prefix if not found", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags prefix: "api_test_no_such_tag", (error, result) ->
        return done(new Error error.message) if error?
        expect(result.tags).to.be.empty()
        done()

  describe "transformations", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.transformation, "c_scale,w_100"
    itBehavesLike "a list with a cursor", cloudinary.v2.api.transformations

    it "should allow listing transformations", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformations (error, result) ->
        return done(new Error error.message) if error?
        transformation = find_by_attr(result.transformations, "name", "c_scale,w_100")
        expect(transformation).not.to.eql(undefined)
        expect(transformation.used).to.be.ok
        done()

    it "should allow getting transformation metadata", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation "c_scale,w_100", (error, transformation) ->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.info).to.eql([crop: "scale", width: 100])
        done()

    it "should allow getting transformation metadata by info", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation {crop: "scale", width: 100}, (error, transformation) ->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.info).to.eql([crop: "scale", width: 100])
        done()

    it "should allow updating transformation allowed_for_strict", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.update_transformation "c_scale,w_100", {allowed_for_strict: true}, () ->
        cloudinary.v2.api.transformation "c_scale,w_100", (error, transformation) ->
          expect(transformation).not.to.eql(undefined)
          expect(transformation.allowed_for_strict).to.be.ok
          cloudinary.v2.api.update_transformation "c_scale,w_100", {allowed_for_strict: false}, () ->
            cloudinary.v2.api.transformation "c_scale,w_100", (error, transformation) ->
              expect(transformation).not.to.eql(undefined)
              expect(transformation.allowed_for_strict).not.to.be.ok
              done()

    it "should allow creating named transformation", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_transformation "api_test_transformation", {crop: "scale", width: 102}, () ->
        cloudinary.v2.api.transformation "api_test_transformation", (error, transformation) ->
          expect(transformation).not.to.eql(undefined)
          expect(transformation.allowed_for_strict).to.be.ok
          expect(transformation.info).to.eql([crop: "scale", width: 102])
          expect(transformation.used).not.to.be.ok
          done()

    it "should allow unsafe update of named transformation", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_transformation "api_test_transformation3", {crop: "scale", width: 102}, () ->
        cloudinary.v2.api.update_transformation "api_test_transformation3", {unsafe_update: {crop: "scale", width: 103}}, () ->
          cloudinary.v2.api.transformation "api_test_transformation3", (error, transformation) ->
            expect(transformation).not.to.eql(undefined)
            expect(transformation.info).to.eql([crop: "scale", width: 103])
            expect(transformation.used).not.to.be.ok
            done()

    it "should allow deleting named transformation", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.delete_transformation "api_test_transformation", () ->
        cloudinary.v2.api.transformation "api_test_transformation", (error, transformation) ->
          expect(error.http_code).to.eql 404
          done()

    it "should allow deleting implicit transformation", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation "c_scale,w_100", (error, transformation) ->
        expect(transformation).to.be.an(Object)
        cloudinary.v2.api.delete_transformation "c_scale,w_100", () ->
          cloudinary.v2.api.transformation "c_scale,w_100", (error, transformation) ->
            expect(error.http_code).to.eql 404
            done()

  describe "upload_preset", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.upload_presets
    it "should allow creating and listing upload_presets", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      create_names = ["api_test_upload_preset3", "api_test_upload_preset2", "api_test_upload_preset1"]
      delete_names = []
      after_delete = ->
        delete_names.pop()
        done() if delete_names.length == 0

      validate_presets = ->
        cloudinary.v2.api.upload_presets (error, response) ->
          expect(response.presets.slice(0,3).map((p) -> p.name)).to.eql(delete_names)
          delete_names.forEach((name) -> cloudinary.v2.api.delete_upload_preset name, after_delete)

      after_create = ->
        if create_names.length > 0
          name = create_names.pop()
          delete_names.unshift(name)
          cloudinary.v2.api.create_upload_preset name: name , folder: "folder", after_create
        else
          validate_presets()

      after_create()

    it "should allow getting a single upload_preset", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_upload_preset unsigned: true, folder: "folder", transformation: {width: 100, crop: "scale"}, tags: ["a","b","c"], context: {a: "b", c: "d"}, (error, preset) ->
        name = preset.name
        cloudinary.v2.api.upload_preset name, (error, preset) ->
          expect(preset.name).to.eql(name)
          expect(preset.unsigned).to.eql(true)
          expect(preset.settings.folder).to.eql("folder")
          expect(preset.settings.transformation).to.eql([{width: 100, crop: "scale"}])
          expect(preset.settings.context).to.eql({a: "b", c: "d"})
          expect(preset.settings.tags).to.eql(["a","b","c"])
          cloudinary.v2.api.delete_upload_preset name, ->
            done()

    it "should allow deleting upload_presets", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_upload_preset name: "api_test_upload_preset4", folder: "folder", (error, preset) ->
        cloudinary.v2.api.upload_preset "api_test_upload_preset4", ->
          cloudinary.v2.api.delete_upload_preset "api_test_upload_preset4", ->
            cloudinary.v2.api.upload_preset "api_test_upload_preset4", (error, result) ->
              expect(error.message).to.contain "Can't find"
              done()

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

  it "should support the usage API call", (done) ->
    @timeout helper.TIMEOUT_MEDIUM
    cloudinary.v2.api.usage (error, usage) ->
      expect(usage.last_update).not.to.eql null
      done()

  describe "delete_all_resources", ->
    itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_all_resources
    describe "keep_original: yes", ->
      it "should allow deleting all derived resources", (done) ->
        @timeout helper.TIMEOUT_MEDIUM
        cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test5", eager: {transformation: {width: 101, crop: "scale"}}, (error, upload_result) ->
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

  describe "update", ()->
    it "should support setting manual moderation status", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload IMAGE_FILE, moderation: "manual", (error, upload_result) ->
        cloudinary.v2.api.update upload_result.public_id, moderation_status: "approved", (error, api_result) ->
          expect(api_result.moderation[0].status).to.eql("approved")
          done()

    it "should support requesting ocr info", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, ocr: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()

    it "should support requesting raw conversion", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, raw_convert: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()

    it "should support requesting categorization", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, categorization: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()

    it "should support requesting detection", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, detection: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()

    it "should support requesting background_removal", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, background_removal: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()

    it "should support requesting similarity_search", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, similarity_search: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Illegal value"
          done()

    it "should support requesting auto_tagging", (done) ->
      @timeout helper.TIMEOUT_MEDIUM
      upload_image (upload_result)->
        cloudinary.v2.api.update upload_result.public_id, auto_tagging: "illegal", (error, api_result) ->
          expect(error.message).to.contain "Must use"
          done()

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

    cloudinary.v2.uploader.upload(IMAGE_FILE, moderation: "manual", after_upload)
    cloudinary.v2.uploader.upload(IMAGE_FILE, moderation: "manual", after_upload)
    cloudinary.v2.uploader.upload(IMAGE_FILE, moderation: "manual", after_upload)

  # For this test to work, "Auto-create folders" should be enabled in the Upload Settings.
  # Replace `it` with  `it.skip` below if you want to disable it.
  it "should list folders in cloudinary", (done)->
    @timeout helper.TIMEOUT_LONG
    Q.all([
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/item' ),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder2/item' ),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder2/item' ),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/test_subfolder1/item' ),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/test_subfolder2/item' )
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

  describe '.restore', ->
    @timeout helper.TIMEOUT_MEDIUM
    before (done)->
      cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test_restore", backup: true, tags: [TEST_TAG], (error, result)->
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

    it 'should restore a deleted resource', (done)->
      cloudinary.v2.api.restore "api_test_restore", (error, response)->
        info = response["api_test_restore"]
        expect(info).not.to.be(null)
        expect(info["bytes"]).to.eql(3381)
        cloudinary.v2.api.resource "api_test_restore", (error, resource)->
          expect(resource).not.to.be(null)
          expect(resource["bytes"]).to.eql(3381)
          done()


  describe 'mapping', ->
    mapping = "api_test_upload_mapping#{Math.floor(Math.random() * 100000)}"
    deleteMapping = false
    after (done)->
      if(deleteMapping)
        cloudinary.v2.api.delete_upload_mapping mapping, (error, result)->
          done()
      else
        done()
    itBehavesLike "a list with a cursor", cloudinary.v2.api.upload_mappings
    it 'should create mapping', (done)->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.create_upload_mapping mapping, template: "http://cloudinary.com", tags: [TEST_TAG], (error, result)->
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

  describe "publish", ->
    suffix = ->
      i = 0
      loop
        yield ++i
      return

    publishTestId = ""
    publishTestTag = ""
    beforeEach (done)->
      publishTestTag = TEST_TAG + suffix()
      cloudinary.v2.uploader.upload IMAGE_FILE, public_id: "api_test_publish", type: "authenticated", tags: [TEST_TAG, publishTestTag], (error, result)->
        return done(new Error error.message) if error?
        publishTestId = result.public_id
        done()
    afterEach (done)->
      cloudinary.v2.uploader.destroy publishTestId, (error, result)->
      return done(new Error error.message) if error?
      done()
    it "should change an authenticated resource to a public resource", (done)->
      cloudinary.v2.api.publish_by_ids [publishTestId], (error, result)->
        return done(new Error error.message) if error?
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
        done()
    it "should change an authenticated resource to a public resource", (done)->
      cloudinary.v2.api.publish_by_prefix publishTestId[0..-2], (error, result)->
        return done(new Error error.message) if error?
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
        done()
    it "should change an authenticated resource to a public resource", (done)->
      cloudinary.v2.api.publish_by_tag publishTestTag, (error, result)->
        return done(new Error error.message) if error?
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
        done()

