var BREAKPOINTS, Cache, EMPTY_IMAGE, FORMAT_1, FileKeyValueStorage, IMAGE_FILE, KeyValueCacheAdapter, LARGE_RAW_FILE, LARGE_VIDEO, PUBLIC_ID, RAW_FILE, TEST_TAG, TRANSFORAMTION_1_RB, TRANSFORMATION_1, UPLOAD_TAGS, c, cache, cloudinary, expect, helper, options, path;

expect = require("expect.js");

helper = require("./spechelper");

cloudinary = require('../cloudinary').v2;

Cache = cloudinary.Cache;

FileKeyValueStorage = require(`../${helper.libPath}/cache/FileKeyValueStorage`);

KeyValueCacheAdapter = require(`../${helper.libPath}/cache/KeyValueCacheAdapter`);

path = require('path');

TEST_TAG = helper.TEST_TAG;

IMAGE_FILE = helper.IMAGE_FILE;

LARGE_RAW_FILE = helper.LARGE_RAW_FILE;

LARGE_VIDEO = helper.LARGE_VIDEO;

EMPTY_IMAGE = helper.EMPTY_IMAGE;

RAW_FILE = helper.RAW_FILE;

UPLOAD_TAGS = helper.UPLOAD_TAGS;

PUBLIC_ID = "dummy";

BREAKPOINTS = [5, 3, 7, 5];

TRANSFORMATION_1 = {
  angle: 45,
  crop: 'scale'
};

FORMAT_1 = 'png';

TRANSFORAMTION_1_RB = [206, 50];

cache = c = options = void 0;

describe("Cache", function() {
  before(function() {
    return Cache.setAdapter(new KeyValueCacheAdapter(new FileKeyValueStorage()));
  });
  it("should be initialized", function() {
    return expect(Cache).to.be.ok();
  });
  it("should set and get a value", function() {
    Cache.set(PUBLIC_ID, {}, BREAKPOINTS);
    return expect(Cache.get(PUBLIC_ID, {})).to.eql(BREAKPOINTS);
  });
  describe("Upload integration", function() {
    this.timeout(helper.TIMEOUT_LONG);
    before(function() {
      return options = {
        tags: UPLOAD_TAGS,
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
            transformation: TRANSFORMATION_1,
            format: FORMAT_1
          },
          {
            create_derived: false
          }
        ]
      };
    });
    this.timeout(helper.TIMEOUT_LONG);
    after(function() {
      var config;
      config = cloudinary.config(true);
      if (!(config.api_key && config.api_secret)) {
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
      }
      if (!cloudinary.config().keep_test_products) {
        return cloudinary.api.delete_resources_by_tag(helper.TEST_TAG);
      }
    });
    return it("should save responsive breakpoints to cache after upload", function() {
      return cloudinary.uploader.upload(IMAGE_FILE, options).then(function(results) {
        var format, public_id, resource_type, type;
        ({public_id, type, resource_type, format} = results);
        return results.responsive_breakpoints.forEach(function(bp) {
          var cachedBp;
          cachedBp = Cache.get(results.public_id, {
            public_id,
            type,
            resource_type,
            raw_transformation: bp.transformation,
            format: path.extname(bp.breakpoints[0].url).slice(1)
          });
          expect(cachedBp).to.eql(bp.breakpoints.map(function(i) {
            return i.width;
          }));
          return bp;
        });
      });
    });
  });
  return it("should create srcset from cache", function() {});
});
