require('dotenv').load(silent: true)
helper = require("./spechelper")

expect = require("expect.js")
cloudinary = require("../cloudinary")
utils = cloudinary.utils
{
  matchesProperty,
  merge
} = utils
matchesProperty = require('lodash/matchesProperty')
find = require('lodash/find')
keys = require('lodash/keys')
sinon = require('sinon')
ClientRequest = require('_http_client').ClientRequest
http = require('http')
Q = require('q')
fs = require('fs')
mockTest = helper.mockTest

sharedExamples = helper.sharedExamples
itBehavesLike = helper.itBehavesLike
TEST_TAG        = helper.TEST_TAG
IMAGE_FILE      = helper.IMAGE_FILE
IMAGE_URL       = helper.IMAGE_URL
UPLOAD_TAGS     = helper.UPLOAD_TAGS
uploadImage    = helper.uploadImage

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
EXPLICIT_TRANSFORMATION_NAME2 = "c_scale,l_text:Arial_60:#{TEST_TAG},w_200"
EXPLICIT_TRANSFORMATION = {width: 100, crop: "scale", overlay: "text:Arial_60:#{TEST_TAG}"}
EXPLICIT_TRANSFORMATION2 = {width: 200, crop: "scale", overlay: "text:Arial_60:#{TEST_TAG}"}

sharedExamples "a list with a cursor", (testFunc, args...)->

  specify ":max_results", ()->
    helper.mockPromise (xhr, writeSpy, requestSpy)->
      testFunc args..., max_results: 10
      if writeSpy.called
        sinon.assert.calledWith writeSpy, sinon.match(/max_results=10/)
      else
        sinon.assert.calledWith requestSpy, sinon.match(query: sinon.match(/max_results=10/))


  specify ":next_cursor", ()->
    helper.mockPromise (xhr, writeSpy, requestSpy)->
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

  before ()->
    @timeout helper.TIMEOUT_LONG

    Q.allSettled [
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID, tags: UPLOAD_TAGS, context: "key=value", eager: [EXPLICIT_TRANSFORMATION])
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_2, tags: UPLOAD_TAGS, context: "key=value", eager: [EXPLICIT_TRANSFORMATION])
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_5, tags: UPLOAD_TAGS, context: "#{contextKey}=test", eager: [EXPLICIT_TRANSFORMATION])
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_6, tags: UPLOAD_TAGS, context: "#{contextKey}=alt-test", eager: [EXPLICIT_TRANSFORMATION])]
    .finally ->

  after ()->
    @timeout helper.TIMEOUT_LONG
    if cloudinary.config().keep_test_products
      Promise.resolve()
    else
      config = cloudinary.config()
      if(!(config.api_key && config.api_secret))
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")

      Q.allSettled [
        cloudinary.v2.api.delete_resources_by_tag(TEST_TAG)
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET1)
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET2)
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET3)
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET4)]
      .finally ->

  find_by_attr = (elements, attr, value) ->
    for element in elements
      return element if element[attr] == value
    undefined

  contextKey = "test-key#{helper.SUFFIX}"

  describe "resources", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.resources
    it "should allow listing resource_types", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resource_types()
      .then (result)->
        expect(result.resource_types).to.contain("image")

    it "should allow listing resources", () ->
      @timeout helper.TIMEOUT_MEDIUM
      publicId = ''
      cloudinary.v2.uploader.upload(IMAGE_FILE, tags: UPLOAD_TAGS)
      .then (result)->
        publicId = result.public_id
        cloudinary.v2.api.resources()
      .then (result)->
        resource = find_by_attr(result.resources, "public_id", publicId)
        expect(resource).not.to.eql(undefined)
        expect(resource.type).to.eql("upload")

    it "should allow listing resources by type", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload(IMAGE_FILE, tags: UPLOAD_TAGS)
      .then (result)->
        public_id = result.public_id
        cloudinary.v2.api.resources(type: "upload")
        .then (result)-> [public_id, result]
      .then ([public_id, result])->
        resource = find_by_attr(result.resources, "public_id", public_id)
        expect(resource).to.be.an(Object)
        expect(resource.type).to.eql("upload")

    it "should allow listing resources by prefix", () ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources(type: "upload", prefix: PUBLIC_ID_PREFIX, max_results: 500)
      .then (result) ->
        public_ids = (resource.public_id for resource in result.resources)
        expect(public_ids).to.contain(PUBLIC_ID)
        expect(public_ids).to.contain(PUBLIC_ID_2)

    itBehavesLike "a list with a cursor", cloudinary.v2.api.resources_by_tag, TEST_TAG
    it "should allow listing resources by tag", () ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_tag(TEST_TAG, context: true, tags: true, max_results: 500)
      .then (result)->
        expect(result.resources.map((e)-> e.public_id)).to.contain(PUBLIC_ID)
                                                        .and.contain(PUBLIC_ID_2)
        expect(getAllTags(result)).to.contain(TEST_TAG)
        expect(result.resources.map((e)-> if e.context? then e.context.custom.key else null)).to.contain("value")


    it "should allow listing resources by context only", () ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_context( contextKey,null)
      .then (result) ->
        expect(result.resources).to.have.length(2)

    it "should allow listing resources by context key and value", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_context(contextKey,"test")
      .then (result)->
        expect(result.resources).to.have.length(1)

    it "should allow listing resources by public ids", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.resources_by_ids([PUBLIC_ID, PUBLIC_ID_2], context: true, tags: true)
      .then (result)->
        resource = find_by_attr(result.resources, "public_id", PUBLIC_ID)
        expect(result.resources.map((e) -> e.public_id).sort()).to.eql([PUBLIC_ID,PUBLIC_ID_2])
        expect(getAllTags(result)).to.contain(TEST_TAG)
        expect(result.resources.map((e) -> e.context.custom.key)).to.contain("value")

    it "should allow listing resources specifying direction", ()->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.resources_by_tag(TEST_TAG, type: "upload", max_results: 500, direction: "asc")
      .then (result)=>
        asc = (resource.public_id for resource in result.resources)
        cloudinary.v2.api.resources_by_tag(TEST_TAG, type: "upload", max_results: 500, direction: "desc")
        .then (result)-> [asc, result]
      .then ([asc, result])->
        desc = (resource.public_id for resource in result.resources)
        expect(asc.reverse()).to.eql(desc)

    it "should allow listing resources by start_at", () ->
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
      .finally ->
        writeSpy.restore()
        requestSpy.restore()
        xhr.restore()


    it "should allow get resource metadata", ()->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.uploader.upload(IMAGE_FILE, tags: UPLOAD_TAGS, eager: [EXPLICIT_TRANSFORMATION])
      .then (result)->
        cloudinary.v2.api.resource(result.public_id)
        .then (resource)-> [result.public_id, resource]
      .then ([public_id, resource])->
        expect(resource).not.to.eql(undefined)
        expect(resource.public_id).to.eql(public_id)
        expect(resource.bytes).to.eql(3381)
        expect(resource.derived).to.have.length(1)

  describe "delete", ()->
    it "should allow deleting derived resource", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload(IMAGE_FILE, tags: UPLOAD_TAGS, eager: [width: 101, crop: "scale"])
      .then (r)->
        cloudinary.v2.api.resource(r.public_id)
        .then (resource)-> [r.public_id, resource]
      .then ([public_id, resource])->
        expect(resource).not.to.eql(undefined)
        expect(resource.bytes).to.eql(3381)
        expect(resource.derived).to.have.length(1)
        derived_resource_id = resource.derived[0].id
        cloudinary.v2.api.delete_derived_resources(derived_resource_id)
        .then ()-> public_id
      .then (public_id)->
        cloudinary.v2.api.resource(public_id)
      .then (resource)->
        expect(resource).not.to.eql(undefined)
        expect(resource.derived).to.have.length(0)

    it "should allow deleting derived resources by transformations", ()->
      @timeout helper.TIMEOUT_LONG
      Q.all([
        cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_1, tags: UPLOAD_TAGS, eager: [EXPLICIT_TRANSFORMATION]),
        cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_2, tags: UPLOAD_TAGS, eager: [EXPLICIT_TRANSFORMATION2]),
        cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_3, tags: UPLOAD_TAGS, eager: [EXPLICIT_TRANSFORMATION, EXPLICIT_TRANSFORMATION2])
      ]).then (results)->
        cloudinary.v2.api.delete_derived_by_transformation([PUBLIC_ID_1, PUBLIC_ID_3], [EXPLICIT_TRANSFORMATION, EXPLICIT_TRANSFORMATION2])
      .then (result)->
        cloudinary.v2.api.resource(PUBLIC_ID_1)
      .then (result)->
        expect(result.derived.length).to.eql(0)
        cloudinary.v2.api.resource(PUBLIC_ID_2)
      .then (result)->
        expect(find(result.derived, (d) -> d.transformation is EXPLICIT_TRANSFORMATION_NAME2)).to.not.be.empty()
        cloudinary.v2.api.resource(PUBLIC_ID_3)
      .then (result)->
        expect(result.derived.length).to.eql(0)

    it "should allow deleting resources", () ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_3, tags: UPLOAD_TAGS)
      .then (r)->
        cloudinary.v2.api.resource(PUBLIC_ID_3)
      .then (resource)->
        expect(resource).not.to.eql(undefined)
        cloudinary.v2.api.delete_resources(["apit_test", PUBLIC_ID_2, PUBLIC_ID_3])
      .then (result)->
        cloudinary.v2.api.resource(PUBLIC_ID_3)
      .then ()-> expect().fail()
      .catch ({error})->
        expect(error).to.be.an(Object)
        expect(error.http_code).to.eql 404

    describe "delete_resources_by_prefix", ->
      itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, "prefix_foobar"
      it "should allow deleting resources by prefix", () ->
        @timeout helper.TIMEOUT_MEDIUM
        cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: "api_test_by_prefix", tags: UPLOAD_TAGS)
        .then (r)->
          cloudinary.v2.api.resource("api_test_by_prefix")
        .then (resource)->
          expect(resource).not.to.eql(undefined)
          cloudinary.v2.api.delete_resources_by_prefix("api_test_by")
        .then () ->
          cloudinary.v2.api.resource("api_test_by_prefix")
        .then ()-> expect().fail()
        .catch ({error})->
          expect(error).to.be.an(Object)
          expect(error.http_code).to.eql 404


    describe "delete_resources_by_tag", ->
      deleteTestTag = TEST_TAG + "_delete"
      itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, deleteTestTag
      it "should allow deleting resources by tags", () ->
        @timeout helper.TIMEOUT_MEDIUM
        cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: PUBLIC_ID_4, tags: UPLOAD_TAGS.concat([deleteTestTag]) )
        .then (result)->
          cloudinary.v2.api.resource(PUBLIC_ID_4)
        .then (resource)->
          expect(resource).to.be.ok()
          cloudinary.v2.api.delete_resources_by_tag(deleteTestTag)
        .then (result)->
          cloudinary.v2.api.resource(PUBLIC_ID_4)
        .then ()-> expect().fail()
        .catch ({error})->
          expect(error).to.be.an(Object)
          expect(error.http_code).to.eql 404

  describe "tags", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.tags
    it "should allow listing tags", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags(max_results: 500)
      .then (result)->
        expect(result.tags).not.to.be.empty()

    it "should allow listing tag by prefix ", () =>
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags(prefix: TEST_TAG[0..-2], max_results: 500)
      .then (result)=>
        expect(result.tags).to.contain(TEST_TAG)

    it "should allow listing tag by prefix if not found", () ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.tags(prefix: "api_test_no_such_tag")
      .then (result)->
        expect(result.tags).to.be.empty()

  describe "transformations", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.transformation, EXPLICIT_TRANSFORMATION_NAME
    itBehavesLike "a list with a cursor", cloudinary.v2.api.transformations

    transformationName = "api_test_transformation3" + SUFFIX
    after ->
      Q.allSettled [
        cloudinary.v2.api.delete_transformation(transformationName)
        cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION)]
      .finally ->

    it "should allow listing transformations", () ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformations()
      .then (result)->
        expect(result).to.have.key("transformations")
        expect(result.transformations).not.to.be.empty()
        expect(result.transformations[0]).to.have.key('used')

    it "should allow getting transformation metadata", () ->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME)
      .then (transformation)->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION])

    it "should allow getting transformation metadata by info", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION)
      .then (transformation)->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION])

    it "should allow updating transformation allowed_for_strict", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.update_transformation(EXPLICIT_TRANSFORMATION_NAME, {allowed_for_strict: true})
      .then ()->
        cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME)
      .then (transformation)->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.allowed_for_strict).to.be.ok()
        cloudinary.v2.api.update_transformation(EXPLICIT_TRANSFORMATION_NAME, {allowed_for_strict: false})
      .then ()->
        cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME)
      .then (transformation)->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.allowed_for_strict).not.to.be.ok()

    it "should allow creating named transformation", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_transformation(NAMED_TRANSFORMATION, {crop: "scale", width: 102})
      .then () ->
        cloudinary.v2.api.transformation(NAMED_TRANSFORMATION)
      .then (transformation)->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.allowed_for_strict).to.be.ok()
        expect(transformation.info).to.eql([crop: "scale", width: 102])
        expect(transformation.used).not.to.be.ok()

    it "should allow listing of named transformations", ()->
      helper.mockPromise (xhr, write, request)->
        cloudinary.v2.api.transformations(named: true)
        sinon.assert.calledWith(request, sinon.match(
          query: sinon.match('named=true')
        ,
          "named=true"
        ))
    it "should allow unsafe update of named transformation", ()->
      @timeout helper.TIMEOUT_MEDIUM

      cloudinary.v2.api.create_transformation(transformationName, {crop: "scale", width: 102})
      .then (result) ->
        cloudinary.v2.api.update_transformation(transformationName, {unsafe_update: {crop: "scale", width: 103}})
      .then (result) ->
        cloudinary.v2.api.transformation(transformationName)
      .then (transformation)->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.info).to.eql([crop: "scale", width: 103])
        expect(transformation.used).not.to.be.ok()

    it "should allow deleting named transformation", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION)
      .then () ->
        cloudinary.v2.api.transformation(NAMED_TRANSFORMATION)
      .then ()->
        expect().fail()
      .catch ({error})->
        expect(error.http_code).to.eql 404

    it "should allow deleting implicit transformation", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME)
      .then (transformation)->
        expect(transformation).to.be.an(Object)
        cloudinary.v2.api.delete_transformation(EXPLICIT_TRANSFORMATION_NAME)
      .then () ->
        cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME)
      .then (transformation)->
        expect().fail()
      .catch ({error})->
        expect(error.http_code).to.eql 404

  describe "upload_preset", ()->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.upload_presets
    it "should allow creating and listing upload_presets", ()->
      @timeout helper.TIMEOUT_MEDIUM
      presetNames = [API_TEST_UPLOAD_PRESET3, API_TEST_UPLOAD_PRESET2, API_TEST_UPLOAD_PRESET1]
      Promise.all presetNames.map (name)->
        cloudinary.v2.api.create_upload_preset(name: name , folder: "folder")
      .then ()->
        cloudinary.v2.api.upload_presets()
      .then ({presets})->
        presetList = presets.map (p)-> p.name
        presetNames
          .forEach (p) -> expect(presetList).to.contain(p)
      .then ()->
        Promise.all presetNames.map (name)->
          cloudinary.v2.api.delete_upload_preset(name)

    it "should allow getting a single upload_preset", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_upload_preset(unsigned: true, folder: "folder", transformation: EXPLICIT_TRANSFORMATION, tags: ["a","b","c"], context: {a: "b", c: "d"})
      .then (newPreset)->
        cloudinary.v2.api.upload_preset(newPreset.name)
        .then (preset)-> [newPreset.name, preset]
      .then ([name, preset])->
        expect(preset.name).to.eql(name)
        expect(preset.unsigned).to.eql(true)
        expect(preset.settings.folder).to.eql("folder")
        expect(preset.settings.transformation).to.eql([EXPLICIT_TRANSFORMATION])
        expect(preset.settings.context).to.eql({a: "b", c: "d"})
        expect(preset.settings.tags).to.eql(["a","b","c"])
        cloudinary.v2.api.delete_upload_preset(name)

    it "should allow deleting upload_presets", ()->
      @timeout helper.TIMEOUT_MEDIUM
      cloudinary.v2.api.create_upload_preset(name: API_TEST_UPLOAD_PRESET4, folder: "folder")
      .then ()->
        cloudinary.v2.api.upload_preset(API_TEST_UPLOAD_PRESET4)
      .then ()->
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET4)
      .then ()->
        cloudinary.v2.api.upload_preset(API_TEST_UPLOAD_PRESET4)
      .then ()->
        expect().fail()
      .catch ({error})->
        expect(error.message).to.contain "Can't find"

    it "should allow updating upload_presets", ()->
      @timeout helper.TIMEOUT_MEDIUM
      name = ''
      cloudinary.v2.api.create_upload_preset(folder: "folder")
      .then (preset)->
        name = preset.name
        cloudinary.v2.api.upload_preset(name)
      .then (preset)->
        cloudinary.v2.api.update_upload_preset(name, merge(preset.settings, {colors: true, unsigned: true, disallow_public_id: true}))
      .then ()->
        cloudinary.v2.api.upload_preset(name)
      .then (preset)->
        expect(preset.name).to.eql(name)
        expect(preset.unsigned).to.eql(true)
        expect(preset.settings).to.eql(folder: "folder", colors: true, disallow_public_id: true)
        cloudinary.v2.api.delete_upload_preset(name)

  it "should support the usage API call", ()->
    @timeout helper.TIMEOUT_MEDIUM
    cloudinary.v2.api.usage()
    .then (usage)->
      expect(usage.last_update).not.to.eql null

  describe "delete_all_resources", ->
    itBehavesLike "accepts next_cursor", cloudinary.v2.api.delete_all_resources
    describe "keep_original: yes", ->
      it "should allow deleting all derived resources", () ->
        helper.mockPromise (xhr, write, request)->
          options = {keep_original: yes}
          cloudinary.v2.api.delete_all_resources(options)
          sinon.assert.calledWith(request, sinon.match((arg)->
            new RegExp("/resources/image/upload$").test(arg.pathname)
          ,
            "/resources/image/upload"
          ))
          sinon.assert.calledWith(request, sinon.match((arg)->
            "DELETE" == arg.method
          ,
            "DELETE"
          ))
          sinon.assert.calledWith(write, sinon.match(
            helper.apiParamMatcher('keep_original', 'true')
          ,
            "keep_original=true"
          ))
          sinon.assert.calledWith(write, sinon.match(
            helper.apiParamMatcher('all', 'true')
          ,
            "all=true"
          ))

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

    it "should support setting manual moderation status", ()->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.uploader.upload(IMAGE_FILE, moderation: "manual")
      .then (upload_result)->
        cloudinary.v2.api.update(upload_result.public_id, moderation_status: "approved")
      .then (api_result)->
        expect(api_result.moderation[0].status).to.eql("approved")

    it "should support requesting ocr info", ()->
      @timeout helper.TIMEOUT_MEDIUM
      uploadImage()
      .then (upload_result)->
        cloudinary.v2.api.update(upload_result.public_id, ocr: "illegal")
      .then ()-> expect().fail()
      .catch ({error})->
        expect(error.message).to.contain "Illegal value"

    it "should support requesting raw conversion", ()->
      @timeout helper.TIMEOUT_MEDIUM
      uploadImage()
      .then (upload_result)->
        cloudinary.v2.api.update(upload_result.public_id, raw_convert: "illegal")
      .then ()-> expect().fail()
      .catch ({error})->
        expect(error.message).to.contain "Illegal value"

    it "should support requesting categorization", ()->
      @timeout helper.TIMEOUT_MEDIUM
      uploadImage()
      .then (upload_result)->
        cloudinary.v2.api.update(upload_result.public_id, categorization: "illegal")
      .then ()-> expect().fail()
      .catch ({error})->
        expect(error.message).to.contain "Illegal value"

    it "should support requesting detection", ()->
      @timeout helper.TIMEOUT_MEDIUM
      uploadImage()
      .then (upload_result)->
        cloudinary.v2.api.update(upload_result.public_id, detection: "illegal")
      .then ()-> expect().fail()
      .catch ({error})->
        expect(error.message).to.contain "Illegal value"

    it "should support requesting background_removal", ()->
      @timeout helper.TIMEOUT_MEDIUM
      uploadImage()
      .then (upload_result)->
        cloudinary.v2.api.update(upload_result.public_id, background_removal: "illegal")
      .then ()-> expect().fail()
      .catch ({error})->
          expect(error.message).to.contain "Illegal value"

    describe "access_control", ()->
      acl = {
        access_type: 'anonymous',
        start: new Date(Date.UTC(2019,1,22, 16, 20, 57)),
        end: '2019-03-22 00:00 +0200'
      }
      acl_string =
        '{"access_type":"anonymous","start":"2019-02-22T16:20:57.000Z","end":"2019-03-22 00:00 +0200"}'
      options = {
        public_id: helper.TEST_TAG,
        tags: [helper.UPLOAD_TAGS..., 'access_control_test']
      }

      it "should allow the user to define ACL in the update parameters2", ()->
        helper.mockPromise((xhr, writeSpy, requestSpy)->
          options.access_control = [acl]
          cloudinary.v2.api.update("id", options)
          sinon.assert.calledWith(writeSpy, sinon.match((arg)->
            helper.apiParamMatcher('access_control', "[#{acl_string}]")(arg)
          ))
        )

  it "should support listing by moderation kind and value", () ->
    itBehavesLike "a list with a cursor", cloudinary.v2.api.resources_by_moderation, "manual", "approved"
    
    
    helper.mockPromise (xhr, write, request)->
      [
        "approved"
        "pending"
        "rejected"
      ].forEach (stat)->
        status= stat
        status2 = status
        request.resetHistory()
        
        cloudinary.v2.api.resources_by_moderation("manual", status2, moderations: true)
        sinon.assert.calledWith request, sinon.match( (arg)->
          new RegExp("/resources/image/moderations/manual/#{status2}$").test(arg?.pathname)
        , "/resources/image/moderations/manual/#{status}")
        sinon.assert.calledWith request, sinon.match( (arg)->
          "moderations=true" == arg?.query
        , "moderations=true")

  # For this test to work, "Auto-create folders" should be enabled in the Upload Settings.
  # Replace `it` with  `it.skip` below if you want to disable it.
  it "should list folders in cloudinary", ()->
    @timeout helper.TIMEOUT_LONG
    Q.all([
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/item', tags: UPLOAD_TAGS),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder2/item', tags: UPLOAD_TAGS),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder2/item', tags: UPLOAD_TAGS),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/test_subfolder1/item', tags: UPLOAD_TAGS),
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: 'test_folder1/test_subfolder2/item', tags: UPLOAD_TAGS)
    ]).then (results)->
      Q.all([
        cloudinary.v2.api.root_folders(),
        cloudinary.v2.api.sub_folders('test_folder1')
      ])
    .then (results)->
      root= results[0]
      root_folders = (folder.name for folder in root.folders)
      sub_1 = results[1]
      expect(root_folders).to.contain('test_folder1')
      expect(root_folders).to.contain('test_folder2')
      expect(sub_1.folders[0].path).to.eql('test_folder1/test_subfolder1')
      expect(sub_1.folders[1].path).to.eql('test_folder1/test_subfolder2')
      cloudinary.v2.api.sub_folders('test_folder_not_exists')
    .then (result)->
      console.log('error test_folder_not_exists should not pass to "then" handler but "catch"')
      expect().fail('error test_folder_not_exists should not pass to "then" handler but "catch"')
    .catch ({error})->
      expect(error.message).to.eql('Can\'t find folder with path test_folder_not_exists')


  describe '.restore', ->
    @timeout helper.TIMEOUT_MEDIUM
    before ()->
      cloudinary.v2.uploader.upload(IMAGE_FILE, public_id: "api_test_restore", backup: true, tags: UPLOAD_TAGS)
      .then (result)-> cloudinary.v2.api.resource("api_test_restore")
      .then (resource)->
        expect(resource).not.to.be(null)
        expect(resource["bytes"]).to.eql(3381)
        cloudinary.v2.api.delete_resources("api_test_restore")
      .then (resource)-> cloudinary.v2.api.resource("api_test_restore")
      .then (resource)->
        expect(resource).not.to.be(null)
        expect(resource["bytes"]).to.eql(0)
        expect(resource["placeholder"]).to.eql(true)

    it 'should restore a deleted resource', ()->
      cloudinary.v2.api.restore("api_test_restore")
      .then (response)->
        info = response["api_test_restore"]
        expect(info).not.to.be(null)
        expect(info["bytes"]).to.eql(3381)
        cloudinary.v2.api.resource("api_test_restore")
      .then (resource)->
        expect(resource).not.to.be(null)
        expect(resource["bytes"]).to.eql(3381)


  describe 'mapping', ->
    mapping = "api_test_upload_mapping#{Math.floor(Math.random() * 100000)}"
    deleteMapping = false
    after ()->
      if(deleteMapping)
        cloudinary.v2.api.delete_upload_mapping(mapping)
      else
        Promise.resolve()

    itBehavesLike "a list with a cursor", cloudinary.v2.api.upload_mappings
    it 'should create mapping', ()->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.create_upload_mapping(mapping, template: "http://cloudinary.com", tags: UPLOAD_TAGS)
      .then (result)->
        deleteMapping = cloudinary.v2.api.upload_mapping(mapping)
      .then (result)->
        expect(result['template']).to.eql("http://cloudinary.com")
        cloudinary.v2.api.update_upload_mapping(mapping, template: "http://res.cloudinary.com")
      .then (result)->
        cloudinary.v2.api.upload_mapping(mapping)
      .then (result)->
        expect(result["template"]).to.eql("http://res.cloudinary.com")
        cloudinary.v2.api.upload_mappings()
      .then (result)->
        expect(find(result["mappings"], {folder: mapping, template: "http://res.cloudinary.com"})).to.be.ok()
        cloudinary.v2.api.delete_upload_mapping(mapping)
      .then (result)->
        deleteMapping = false
        cloudinary.v2.api.upload_mappings()
      .then (result)->
        expect(find(result["mappings"], matchesProperty('folder', mapping))).not.to.be.ok()

  describe "publish", ->
    @timeout helper.TIMEOUT_LONG
    i = 0

    publishTestId = ""
    publishTestTag = ""
    idsToDelete = []
    beforeEach ()->
      publishTestTag = TEST_TAG + i++
      cloudinary.v2.uploader.upload(IMAGE_FILE, type: "authenticated", tags: UPLOAD_TAGS.concat([publishTestTag]))
      .then (result)->
        publishTestId = result.public_id
        idsToDelete.push(publishTestId)
    after ()->
      # cleanup any resource that were not published
      cloudinary.v2.api.delete_resources(idsToDelete, type: "authenticated")
    it "should publish by public id", ()->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.publish_by_ids([publishTestId], type: "authenticated")
      .then (result)->
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
    it "should publish by prefix", ()->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.publish_by_prefix(publishTestId[0..-2])
      .then (result)->
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
    it "should publish by tag", ()->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.publish_by_tag(publishTestTag)
      .then (result)->
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(1)
        expect(published[0].public_id).to.eql(publishTestId)
        expect(published[0].url).to.match(/\/upload\//)
    it "should return empty when explicit given type doesn't match resource", ()->
      @timeout helper.TIMEOUT_LONG
      cloudinary.v2.api.publish_by_ids([publishTestId], type: "private")
      .then (result)->
        published = result.published
        expect(published).not.to.be(null)
        expect(published.length).to.be(0)

  describe "access_mode", ->
    i = 0
    @timeout helper.TIMEOUT_LONG
    publicId = ""
    access_mode_tag = ''
    beforeEach ()->
      access_mode_tag = TEST_TAG + "access_mode" + i++
      cloudinary.v2.uploader.upload(IMAGE_FILE, access_mode: "authenticated", tags: UPLOAD_TAGS.concat([access_mode_tag]))
      .then (result)->
        publicId = result.public_id
        expect(result.access_mode).to.be("authenticated")
    it "should update access mode by ids", ()->
      cloudinary.v2.api.update_resources_access_mode_by_ids("public", [publicId])
      .then (result)->
        expect(result.updated).to.be.an('array')
        expect(result.updated.length).to.be(1)
        resource = result.updated[0]
        expect(resource.public_id).to.be(publicId)
        expect(resource.access_mode).to.be('public')
    it "should update access mode by prefix", ()->
      cloudinary.v2.api.update_resources_access_mode_by_prefix("public", publicId[0..-3])
      .then (result)->
        expect(result.updated).to.be.an('array')
        expect(result.updated.length).to.be(1)
        resource = result.updated[0]
        expect(resource.public_id).to.be(publicId)
        expect(resource.access_mode).to.be('public')
    it "should update access mode by tag", ()->
      cloudinary.v2.api.update_resources_access_mode_by_tag("public", access_mode_tag)
      .then (result)->
        expect(result.updated).to.be.an('array')
        expect(result.updated.length).to.be(1)
        resource = result.updated[0]
        expect(resource.public_id).to.be(publicId)
        expect(resource.access_mode).to.be('public')
