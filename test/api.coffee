expect = require("expect.js")
cloudinary = require("../cloudinary")

fs = require('fs')
describe "api", ->
  return console.warn("**** Please setup environment for api test to run!") if !cloudinary.config().api_secret?

  find_by_attr = (elements, attr, value) ->
    for element in elements
      return element if element[attr] == value
    undefined
    
  before (done) ->
    @timeout 10000
    cnt = 0
    progress = -> 
      cnt += 1
      done() if cnt == 3
    cloudinary.uploader.destroy "api_test", ->
      cloudinary.uploader.destroy "api_test2", ->
        cloudinary.uploader.upload("test/logo.png", progress, public_id: "api_test", tags: "api_test_tag", eager: [width: 100, crop: "scale"])
        cloudinary.uploader.upload("test/logo.png", progress, public_id: "api_test2", tags: "api_test_tag", eager: [width: 100, crop: "scale"]) 
        cloudinary.api.delete_transformation("api_test_transformation", progress)

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
    cloudinary.api.resources((result) ->      
      return done(new Error result.error.message) if result.error?
      expect(result.resources).to.have.length 1
      expect(result.next_cursor).not.to.eql(undefined)
      cloudinary.api.resources((result2) ->      
        return done(new Error result.error.message) if result.error?
        expect(result2.resources).to.have.length 1
        expect(result2.next_cursor).not.to.eql(undefined)
        expect(result.resources[0].public_id).not.to.eql result2.resources[0].public_id
        done()
      , max_results: 1, next_cursor: result.next_cursor)
    , max_results: 1)

  it "should allow listing resources by type", (done) ->
    @timeout 10000
    cloudinary.api.resources (result) ->
      return done(new Error result.error.message) if result.error?
      resource = find_by_attr(result.resources, "public_id", "api_test")
      expect(resource).not.to.eql(undefined)
      expect(resource.type).to.eql("upload")
      done()
    , type: "upload"

  it "should allow listing resources by prefix", (done) ->
    @timeout 10000
    cloudinary.api.resources (result) ->
      return done(new Error result.error.message) if result.error?
      public_ids = (resource.public_id for resource in result.resources)        
      expect(public_ids).to.contain("api_test")   
      expect(public_ids).to.contain("api_test2")
      done()
    , type: "upload", prefix: "api_test"

  it "should allow listing resources by tag", (done) ->
    @timeout 10000
    cloudinary.api.resources_by_tag "api_test_tag", (result) ->
      return done(new Error result.error.message) if result.error?
      resource = find_by_attr(result.resources, "public_id", "api_test")
      expect(resource).not.to.eql(undefined)
      expect(resource.type).to.eql("upload")
      done()

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
    cloudinary.api.create_transformation "api_test_transformatio3", {crop: "scale", width: 102}, () ->
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

  it "should support the usage API call", (done) ->
    @timeout 10000
    cloudinary.api.usage (usage) ->
      expect(usage.last_update).not.to.eql null
      done()


