dotenv = require('dotenv')
dotenv.load()

expect = require("expect.js")
cloudinary = require("../cloudinary")
utils = require("../lib/utils")
_ = require("lodash")
Q = require('q')
fs = require('fs')
describe "api", ->
  return console.warn("**** Please setup environment for api test to run!") if !cloudinary.config().api_secret?

  find_by_attr = (elements, attr, value) ->
    for element in elements
      return element if element[attr] == value
    undefined
    
  before (done) ->
    @timeout 0
    @timestamp_tag = "api_test_tag_" + cloudinary.utils.timestamp()

    cloudinary.v2.api.delete_resources ["api_test", "api_test1", "api_test2"], =>
      Q.all [
        cloudinary.v2.uploader.upload("test/logo.png", public_id: "api_test", tags: ["api_test_tag", @timestamp_tag], context: "key=value", eager: [width: 100, crop: "scale"])
        cloudinary.v2.uploader.upload("test/logo.png", public_id: "api_test2", tags: ["api_test_tag", @timestamp_tag], context: "key=value", eager: [width: 100, crop: "scale"])
        cloudinary.v2.api.delete_transformation("api_test_transformation")
        cloudinary.v2.api.delete_upload_preset("api_test_upload_preset1")
        cloudinary.v2.api.delete_upload_preset("api_test_upload_preset2")
        cloudinary.v2.api.delete_upload_preset("api_test_upload_preset3")
        cloudinary.v2.api.delete_upload_preset("api_test_upload_preset4")]
      .finally ->
        done()

  it "should allow listing resource_types", (done) ->
    @timeout 10000
    cloudinary.api.resource_types (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.resource_types).to.contain("image")
      done()

  it "should allow listing resources", (done) ->
    @timeout 10000
    cloudinary.api.resources (result) ->
      return done(new Error result.error.message) if result.error?
      resource = find_by_attr(result.resources, "public_id", "api_test")
      expect(resource).not.to.eql(undefined)
      expect(resource.type).to.eql("upload")
      done()

  it "should allow listing resources with cursor", (done) ->
    @timeout 10000
    cloudinary.v2.api.resources max_results: 1, (error, result) ->      
      return done(new Error error.message) if error?
      expect(result.resources).to.have.length 1
      expect(result.next_cursor).not.to.eql(undefined)
      cloudinary.v2.api.resources max_results: 1, next_cursor: result.next_cursor, (error2, result2) ->      
        return done(new Error error2.message) if error2?
        expect(result2.resources).to.have.length 1
        expect(result2.next_cursor).not.to.eql(undefined)
        expect(result.resources[0].public_id).not.to.eql result2.resources[0].public_id
        done()

  it "should allow listing resources by type", (done) ->
    @timeout 10000
    cloudinary.v2.api.resources type: "upload", (error, result) ->
      return done(new Error error.message) if error?
      resource = find_by_attr(result.resources, "public_id", "api_test")
      expect(resource).not.to.eql(undefined)
      expect(resource.type).to.eql("upload")
      done()

  it "should allow listing resources by prefix", (done) ->
    @timeout 10000
    cloudinary.v2.api.resources type: "upload", prefix: "api_test", (error, result) ->
      return done(new Error error.message) if error?
      public_ids = (resource.public_id for resource in result.resources)        
      expect(public_ids).to.contain("api_test")   
      expect(public_ids).to.contain("api_test2")
      done()

  it "should allow listing resources by tag", (done) ->
    @timeout 10000
    cloudinary.api.resources_by_tag "api_test_tag", (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.resources.map((e) -> e.public_id).sort()).to.eql(["api_test","api_test2"])
      expect(result.resources.map((e) -> e.tags[0])).to.contain("api_test_tag")
      expect(result.resources.map((e) -> if e.context? then e.context.custom.key else null)).to.contain("value")
      done()
    , context: true, tags: true
  
  it "should allow listing resources by public ids", (done) ->
    @timeout 10000
    cloudinary.api.resources_by_ids ["api_test", "api_test2"], (result) ->
      return done(new Error result.error.message) if result.error?
      resource = find_by_attr(result.resources, "public_id", "api_test")
      expect(result.resources.map((e) -> e.public_id).sort()).to.eql(["api_test","api_test2"])
      expect(result.resources.map((e) -> e.tags[0])).to.contain("api_test_tag")
      expect(result.resources.map((e) -> e.context.custom.key)).to.contain("value")
      done()
    , context: true, tags: true
  
  it "should allow listing resources specifying direction", (done) ->
    @timeout 10000
    cloudinary.api.resources_by_tag @timestamp_tag, (result) =>
      return done(new Error result.error.message) if result.error?
      asc = (resource.public_id for resource in result.resources)
      cloudinary.api.resources_by_tag @timestamp_tag, (result) ->
        return done(new Error result.error.message) if result.error?
        desc = (resource.public_id for resource in result.resources)
        expect(asc.reverse()).to.eql(desc)
        done()
      , type: "upload", direction: "desc"
    , type: "upload", direction: "asc"
  
  it "should allow listing resources by start_at", (done) ->
    @timeout 10000
    start_at = null
    setTimeout ->
      start_at = new Date()
      setTimeout ->
        cloudinary.uploader.upload "test/logo.png", (response) ->
          cloudinary.api.resources (resources_response) ->
            expect(resources_response.resources).to.have.length(1)
            expect(resources_response.resources[0].public_id).to.eql(response.public_id)
            done()
          ,type: "upload", start_at: start_at, direction: "asc"
      ,2000
    ,2000
  
  it "should allow get resource metadata", (done) ->
    @timeout 10000
    cloudinary.api.resource "api_test", (resource) ->
      expect(resource).not.to.eql(undefined)
      expect(resource.public_id).to.eql("api_test")
      expect(resource.bytes).to.eql(3381)
      expect(resource.derived).to.have.length(1)
      done()
  
  it "should allow deleting derived resource", (done) ->
    @timeout 10000
    cloudinary.uploader.upload("test/logo.png", (r) ->
      return done(new Error r.error.message) if r.error?
      cloudinary.api.resource "api_test3", (resource) ->
        return done(new Error resource.error.message) if resource.error?
        expect(resource).not.to.eql(undefined)
        expect(resource.bytes).to.eql(3381)
        expect(resource.derived).to.have.length(1)
        derived_resource_id = resource.derived[0].id
        cloudinary.api.delete_derived_resources derived_resource_id, (r) ->
          return done(new Error r.error.message) if r.error?
          cloudinary.api.resource "api_test3", (resource) ->
            return done(new Error resource.error.message) if resource.error?
            expect(resource).not.to.eql(undefined)
            expect(resource.derived).to.have.length(0)
            done()
    , public_id: "api_test3", eager: [width: 101, crop: "scale"])

  it "should allow deleting resources", (done) ->
    @timeout 10000
    cloudinary.uploader.upload("test/logo.png", (r) ->
      return done(new Error r.error.message) if r.error?
      cloudinary.api.resource "api_test3", (resource) ->
        expect(resource).not.to.eql(undefined)
        cloudinary.api.delete_resources ["apit_test", "api_test2", "api_test3"], () ->
          cloudinary.api.resource "api_test3", (result) ->
            expect(result.error).not.to.be undefined
            expect(result.error.http_code).to.eql 404
            done()
    , public_id: "api_test3")

  it "should allow deleting resources by prefix", (done) ->
    @timeout 10000
    cloudinary.uploader.upload("test/logo.png", (r) ->
      return done(new Error r.error.message) if r.error?
      cloudinary.api.resource "api_test_by_prefix", (resource) ->
        expect(resource).not.to.eql(undefined)
        cloudinary.api.delete_resources_by_prefix "api_test_by", () ->
          cloudinary.api.resource "api_test_by_prefix", (result) ->
            expect(result.error).not.to.be undefined
            expect(result.error.http_code).to.eql 404
            done()
    , public_id: "api_test_by_prefix")

  it "should allow deleting resources by tags", (done) ->
    @timeout 10000
    cloudinary.uploader.upload("test/logo.png", (r) ->
      return done(new Error r.error.message) if r.error?
      cloudinary.api.resource "api_test4", (resource) ->
        expect(resource).not.to.eql(undefined)
        cloudinary.api.delete_resources_by_tag "api_test_tag_for_delete", (rr) ->
          return done(new Error rr.error.message) if rr.error?
          cloudinary.api.resource "api_test4", (result) ->
            expect(result.error).not.to.be undefined
            expect(result.error.http_code).to.eql 404
            done()
    , public_id: "api_test4", tags: ["api_test_tag_for_delete"])

  it "should allow listing tags", (done) ->
    @timeout 10000
    cloudinary.api.tags (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.tags).to.contain("api_test_tag")
      done()

  it "should allow listing tag by prefix ", (done) ->
    @timeout 10000
    cloudinary.api.tags (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.tags).to.contain("api_test_tag")
      done()
    , prefix: "api_test"

  it "should allow listing tag by prefix if not found", (done) ->
    @timeout 10000
    cloudinary.api.tags (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.tags).to.have.length 0
      done()
    , prefix: "api_test_no_such_tag"
  
  it "should allow listing transformations", (done) ->
    @timeout 10000
    cloudinary.api.transformations (result) ->
      return done(new Error result.error.message) if result.error?
      transformation = find_by_attr(result.transformations, "name", "c_scale,w_100")
      expect(transformation).not.to.eql(undefined)
      expect(transformation.used).to.be.ok
      done()

  it "should allow getting transformation metadata", (done) ->
    @timeout 10000
    cloudinary.api.transformation "c_scale,w_100", (transformation) ->
      expect(transformation).not.to.eql(undefined)
      expect(transformation.info).to.eql([crop: "scale", width: 100])
      done()

  it "should allow getting transformation metadata by info", (done) ->
    @timeout 10000
    cloudinary.api.transformation {crop: "scale", width: 100}, (transformation) ->
      expect(transformation).not.to.eql(undefined)
      expect(transformation.info).to.eql([crop: "scale", width: 100])
      done()
  
  it "should allow updating transformation allowed_for_strict", (done) ->
    @timeout 10000
    cloudinary.api.update_transformation "c_scale,w_100", {allowed_for_strict: true}, () ->
      cloudinary.api.transformation "c_scale,w_100", (transformation) ->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.allowed_for_strict).to.be.ok
        cloudinary.api.update_transformation "c_scale,w_100", {allowed_for_strict: false}, () ->
          cloudinary.api.transformation "c_scale,w_100", (transformation) ->
            expect(transformation).not.to.eql(undefined)
            expect(transformation.allowed_for_strict).not.to.be.ok
            done()

  it "should allow creating named transformation", (done) ->
    @timeout 10000
    cloudinary.api.create_transformation "api_test_transformation", {crop: "scale", width: 102}, () ->
      cloudinary.api.transformation "api_test_transformation", (transformation) ->
        expect(transformation).not.to.eql(undefined)
        expect(transformation.allowed_for_strict).to.be.ok
        expect(transformation.info).to.eql([crop: "scale", width: 102])
        expect(transformation.used).not.to.be.ok
        done()

  it "should allow unsafe update of named transformation", (done) ->
    @timeout 10000
    cloudinary.api.create_transformation "api_test_transformation3", {crop: "scale", width: 102}, () ->
      cloudinary.api.update_transformation "api_test_transformation3", {unsafe_update: {crop: "scale", width: 103}}, () ->
        cloudinary.api.transformation "api_test_transformation3", (transformation) ->
          expect(transformation).not.to.eql(undefined)
          expect(transformation.info).to.eql([crop: "scale", width: 103])
          expect(transformation.used).not.to.be.ok
          done()

  it "should allow deleting named transformation", (done) ->
    @timeout 10000
    cloudinary.api.delete_transformation "api_test_transformation", () ->
      cloudinary.api.transformation "api_test_transformation", (transformation) ->
        expect(transformation.error.http_code).to.eql 404
        done()

  it "should allow deleting implicit transformation", (done) ->
    @timeout 10000
    cloudinary.api.transformation "c_scale,w_100", (transformation) ->
      expect(transformation).not.to.eql(undefined)
      cloudinary.api.delete_transformation "c_scale,w_100", () ->
        cloudinary.api.transformation "c_scale,w_100", (transformation) ->
          expect(transformation.error.http_code).to.eql 404
          done()
  
  it "should allow creating and listing upload_presets", (done) ->
    @timeout 10000
    create_names = ["api_test_upload_preset3", "api_test_upload_preset2", "api_test_upload_preset1"]
    delete_names = []
    after_delete = ->
      delete_names.pop()
      done() if delete_names.length == 0
      
    validate_presets = ->
      cloudinary.api.upload_presets (response) ->
        expect(response.presets.slice(0,3).map((p) -> p.name)).to.eql(delete_names)
        delete_names.forEach((name) -> cloudinary.api.delete_upload_preset name, after_delete)
        
    after_create = ->
      if create_names.length > 0
        name = create_names.pop()
        delete_names.unshift(name)
        cloudinary.api.create_upload_preset after_create, name: name , folder: "folder"
      else
        validate_presets()
    
    after_create()
        
  it "should allow getting a single upload_preset", (done) ->
    @timeout 10000
    cloudinary.api.create_upload_preset (preset) ->
      name = preset.name
      cloudinary.api.upload_preset name, (preset) ->
        expect(preset.name).to.eql(name)
        expect(preset.unsigned).to.eql(true)
        expect(preset.settings.folder).to.eql("folder")
        expect(preset.settings.transformation).to.eql([{width: 100, crop: "scale"}])
        expect(preset.settings.context).to.eql({a: "b", c: "d"})
        expect(preset.settings.tags).to.eql(["a","b","c"])
        cloudinary.api.delete_upload_preset(name, -> done())
    , unsigned: true, folder: "folder", transformation: {width: 100, crop: "scale"}, tags: ["a","b","c"], context: {a: "b", c: "d"}    

  it "should allow deleting upload_presets", (done) ->
    @timeout 10000
    cloudinary.api.create_upload_preset (preset) ->
      cloudinary.api.upload_preset "api_test_upload_preset4", ->
        cloudinary.api.delete_upload_preset "api_test_upload_preset4", ->
          cloudinary.api.upload_preset "api_test_upload_preset4", (result) ->
            expect(result.error.message).to.contain "Can't find"
            done()
    , name: "api_test_upload_preset4", folder: "folder"
  
  it "should allow updating upload_presets", (done) ->
    @timeout 10000
    cloudinary.api.create_upload_preset (preset) ->
      name = preset.name
      cloudinary.api.upload_preset name, (preset) ->
        cloudinary.api.update_upload_preset name, (preset) ->
          cloudinary.api.upload_preset name, (preset) ->
            expect(preset.name).to.eql(name)
            expect(preset.unsigned).to.eql(true)
            expect(preset.settings).to.eql(folder: "folder", colors: true, disallow_public_id: true)
            cloudinary.api.delete_upload_preset(name, -> done())
        , utils.merge(preset.settings, {colors: true, unsigned: true, disallow_public_id: true})
    , folder: "folder"
          
  it "should support the usage API call", (done) ->
    @timeout 10000
    cloudinary.api.usage (usage) ->
      expect(usage.last_update).not.to.eql null
      done()

  it "should allow deleting all resources", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.resource "api_test5", (resource) ->
        expect(resource).to.not.eql(null)
        expect(resource.derived.length).to.eql(1)
        cloudinary.api.delete_all_resources (delete_result) ->
          cloudinary.api.resource "api_test5", (resource) ->
            expect(resource.derived.length).to.eql(0)
            done()
        , {keep_original: yes}
    , {public_id: "api_test5", eager: {transformation: {width: 101, crop: "scale"}}}
    
  it "should support setting manual moderation status", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.update upload_result.public_id, (api_result) ->
        expect(api_result.moderation[0].status).to.eql("approved")
        done()
      , moderation_status: "approved"
    , moderation: "manual"
    
  it "should support requesting ocr info", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.update upload_result.public_id, (api_result) ->
        expect(api_result.error.message).to.contain "Illegal value"
        done()
      , ocr: "illegal"
  
  it "should support requesting raw conversion", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.update upload_result.public_id, (api_result) ->
        expect(api_result.error.message).to.contain "Illegal value"
        done()
      , raw_convert: "illegal"
  
  it "should support requesting categorization", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.update upload_result.public_id, (api_result) ->
        expect(api_result.error.message).to.contain "Illegal value"
        done()
      , categorization: "illegal"
  
  it "should support requesting detection", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.update upload_result.public_id, (api_result) ->
        expect(api_result.error.message).to.contain "Illegal value"
        done()
      , detection: "illegal"
  
  it "should support requesting background_removal", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.update upload_result.public_id, (api_result) ->
        expect(api_result.error.message).to.contain "Illegal value"
        done()
      , background_removal: "illegal"
  
  it "should support requesting similarity_search", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.update upload_result.public_id, (api_result) ->
        expect(api_result.error.message).to.contain "Illegal value"
        done()
      , similarity_search: "illegal"
  
  it "should support requesting auto_tagging", (done) ->
    @timeout 10000
    cloudinary.uploader.upload "test/logo.png", (upload_result) ->
      cloudinary.api.update upload_result.public_id, (api_result) ->
        expect(api_result.error.message).to.contain "Must use"
        done()
      , auto_tagging: "illegal"
  
  it "should support listing by moderation kind and value", (done) ->
    @timeout 10000
    ids = []
    api_results =[]
    lists = {}
    after_listing = (list) ->
      (list_result) ->
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

    after_update = (api_result) ->
      api_results.push(api_result)
      if api_results.length == 2
        cloudinary.api.resources_by_moderation("manual", "approved", after_listing("approved"), max_results: 1000, moderations: true)
        cloudinary.api.resources_by_moderation("manual", "rejected", after_listing("rejected"), max_results: 1000, moderations: true)
        cloudinary.api.resources_by_moderation("manual", "pending", after_listing("pending"), max_results: 1000, moderations: true)

    after_upload = (upload_result) -> 
      ids.push(upload_result.public_id)
      if ids.length == 3
        cloudinary.api.update ids[0], after_update, moderation_status: "approved"
        cloudinary.api.update ids[1], after_update, moderation_status: "rejected"
        
    cloudinary.uploader.upload("test/logo.png", after_upload, moderation: "manual")
    cloudinary.uploader.upload("test/logo.png", after_upload, moderation: "manual")
    cloudinary.uploader.upload("test/logo.png", after_upload, moderation: "manual")

  # For this test to work, "Auto-create folders" should be enabled in the Upload Settings.
  # Remove '.skip' below if you want to test it.
  it.skip "should list folders in cloudinary", (done)->
    @timeout 20000
    Q.all([
      cloudinary.v2.uploader.upload("test/logo.png", public_id: 'test_folder1/item' ),
      cloudinary.v2.uploader.upload("test/logo.png", public_id: 'test_folder2/item' ),
      cloudinary.v2.uploader.upload("test/logo.png", public_id: 'test_folder2/item' ),
      cloudinary.v2.uploader.upload("test/logo.png", public_id: 'test_folder1/test_subfolder1/item' ),
      cloudinary.v2.uploader.upload("test/logo.png", public_id: 'test_folder1/test_subfolder2/item' )
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
    

