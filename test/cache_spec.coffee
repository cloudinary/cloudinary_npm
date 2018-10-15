expect = require("expect.js")
Cache = require('../lib/cache')
cloudinary = require('../cloudinary').v2;
FileKeyValueStorage = require('../lib/cache/FileKeyValueStorage')
KeyValueCacheAdapter = require('../lib/cache/KeyValueCacheAdapter')
path = require('path');

helper = require("./spechelper")
TEST_TAG        = helper.TEST_TAG
IMAGE_FILE      = helper.IMAGE_FILE
LARGE_RAW_FILE  = helper.LARGE_RAW_FILE
LARGE_VIDEO     = helper.LARGE_VIDEO
EMPTY_IMAGE     = helper.EMPTY_IMAGE
RAW_FILE        = helper.RAW_FILE
UPLOAD_TAGS     = helper.UPLOAD_TAGS

PUBLIC_ID = "dummy"
BREAKPOINTS = [5,3,7,5]
TRANSFORMATION_1 = {angle: 45, crop: 'scale'}
FORMAT_1 = 'png'
TRANSFORAMTION_1_RB = [206, 50]

cache = c = options = undefined
describe "Cache", ->
  before ->
    Cache.setAdapter(new KeyValueCacheAdapter( new FileKeyValueStorage()))
  it "should be initialized", ->
    expect(Cache).to.be.ok()

  it "should set and get a value", ->
    Cache.set(PUBLIC_ID, {}, BREAKPOINTS)
    expect(Cache.get(PUBLIC_ID, {})).to.eql(BREAKPOINTS)

  describe "Upload integration", ->
    @timeout helper.TIMEOUT_LONG
    before ->
      options =
        tags: UPLOAD_TAGS
        responsive_breakpoints: [
          {
            create_derived: false,
            transformation: {
              angle: 90
            },
            format: 'gif'
          },
          {
            create_derived: false,
            transformation: TRANSFORMATION_1
            format: FORMAT_1
          },
          {
            create_derived: false,
          }
        ]
    @timeout helper.TIMEOUT_LONG
    after ->
      config = cloudinary.config(true)
      if(!(config.api_key && config.api_secret))
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")
      cloudinary.api.delete_resources_by_tag(helper.TEST_TAG) unless cloudinary.config().keep_test_products

    it "should save responsive breakpoints to cache after upload", ->

      cloudinary.uploader.upload(IMAGE_FILE, options).then (results) ->
        {public_id, type, resource_type, format} = results
        results.responsive_breakpoints.forEach (bp)->
          cachedBp = Cache.get(results.public_id, {public_id, type, resource_type, raw_transformation: bp.transformation, format: path.extname(bp.breakpoints[0].url).slice(1)})
          expect(cachedBp).to.eql(bp.breakpoints.map((i)-> i.width))
          bp

  it "should create srcset from cache", ->
