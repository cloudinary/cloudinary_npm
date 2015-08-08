_ = require("lodash")
expect = require('expect.js')
cloudinary = require('../cloudinary')

originalCloudinaryUrl = null

describe 'config', ->

  beforeEach ->
    cloudinary.config(true) # Reset
    originalCloudinaryUrl = process.env.CLOUDINARY_URL

  afterEach ->
    if _.isUndefined(originalCloudinaryUrl)
      delete process.env.CLOUDINARY_URL
    else
      process.env.CLOUDINARY_URL = originalCloudinaryUrl

  it "should set config field when key and value passed", ->
    cloudinary.config("cloud_name", "test")
    expect(cloudinary.config('cloud_name')).to.eql("test")

  it "should set config field when object passed", ->
    cloudinary.config(cloud_name: "test")
    expect(cloudinary.config('cloud_name')).to.eql("test")

  it "should parse CLOUDINARY_URL env variable if no values passed", ->
    process.env.CLOUDINARY_URL = "cloudinary://abcdefgh:012345678@test";
    cloudinary.config(true)
    expect(cloudinary.config('cloud_name')).to.eql("test")

  it "should parse url-like single string with as CLOUDINARY_URL", ->
    cloudinary.config("cloudinary://abcdefgh:012345678@test")
    expect(cloudinary.config('cloud_name')).to.eql("test")

