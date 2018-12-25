var options;

const expect = require("expect.js");
const helper = require("./spechelper");
const cloudinary = require('../cloudinary').v2;
const Cache = cloudinary.Cache;
const FileKeyValueStorage = require(`../${helper.libPath}/cache/FileKeyValueStorage`);
const KeyValueCacheAdapter = require(`../${helper.libPath}/cache/KeyValueCacheAdapter`);
const path = require('path');
const TEST_TAG = helper.TEST_TAG;
const IMAGE_FILE = helper.IMAGE_FILE;
const LARGE_RAW_FILE = helper.LARGE_RAW_FILE;
const LARGE_VIDEO = helper.LARGE_VIDEO;
const EMPTY_IMAGE = helper.EMPTY_IMAGE;
const RAW_FILE = helper.RAW_FILE;
const UPLOAD_TAGS = helper.UPLOAD_TAGS;
const PUBLIC_ID = "dummy";
const BREAKPOINTS = [5, 3, 7, 5];

const TRANSFORMATION_1 = {
  angle: 45,
  crop: 'scale'
};

const FORMAT_1 = 'png';
const TRANSFORAMTION_1_RB = [206, 50];
var cache;

describe("Cache", function () {
  before(function () {
    return Cache.setAdapter(new KeyValueCacheAdapter(new FileKeyValueStorage()));
  });
  it("should be initialized", function () {
    return expect(Cache).to.be.ok();
  });
  it("should set and get a value", function () {
    Cache.set(PUBLIC_ID, {}, BREAKPOINTS);
    return expect(Cache.get(PUBLIC_ID, {})).to.eql(BREAKPOINTS);
  });
  describe("Upload integration", function () {
    this.timeout(helper.TIMEOUT_LONG);
    before(function () {
      options = {
        tags: UPLOAD_TAGS,
        responsive_breakpoints: [
          {
            create_derived: false,
            transformation: {angle: 90},
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
    after(function () {
      let config = cloudinary.config(true);
      if (!(config.api_key && config.api_secret)) {
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
      }
      if (!cloudinary.config().keep_test_products) {
        return cloudinary.api.delete_resources_by_tag(helper.TEST_TAG);
      }
    });
    it("should save responsive breakpoints to cache after upload", function () {
      return cloudinary.uploader.upload(IMAGE_FILE, options)
        .then(function (results) {
          let public_id = results.public_id;
          let type = results.type;
          let resource_type = results.resource_type;
          results.responsive_breakpoints.forEach(function (bp) {
            let cachedBp = Cache.get(results.public_id, {
              public_id,
              type,
              resource_type,
              raw_transformation: bp.transformation,
              format: path.extname(bp.breakpoints[0].url).slice(1)
            });
            expect(cachedBp).to.eql(bp.breakpoints.map(i => i.width));
          });
        });
    });
  });
  it("should create srcset from cache", function () {
  });
});
