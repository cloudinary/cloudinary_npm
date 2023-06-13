const Q = require('q');
const cloudinary = require("../../../../cloudinary");
const describe = require('../../../testUtils/suite');
const TEST_ID = Date.now();

const createTestConfig = require('../../../testUtils/createTestConfig');

const testConstants = require('../../../testUtils/testConstants');
const UPLOADER_V2 = cloudinary.v2.uploader;

const {
  TIMEOUT,
  TAGS
} = testConstants;

const {
  TEST_TAG
} = TAGS;

require('jsdom-global')();

describe("create slideshow tests", function () {
  this.timeout(TIMEOUT.LONG);
  after(function () {
    var config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
    return Q.allSettled([
      !cloudinary.config().keep_test_products ? cloudinary.v2.api.delete_resources_by_tag(TEST_TAG) : void 0,
      !cloudinary.config().keep_test_products ? cloudinary.v2.api.delete_resources_by_tag(TEST_TAG,
        {
          resource_type: "video"
        }) : void 0
    ]);
  });
  beforeEach(function () {
    cloudinary.config(true);
    cloudinary.config(createTestConfig());
  });


  it("should successfully create slideshow", async function () {
    // this.timeout(TIMEOUT.LONG);
    const slideshowManifest
      = 'w_352;h_240;du_5;fps_30;vars_(slides_((media_s64:aHR0cHM6Ly9y' +
      'ZXMuY2xvdWRpbmFyeS5jb20vZGVtby9pbWFnZS91cGxvYWQvY291cGxl);(media_s64:aH' +
      'R0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vZGVtby9pbWFnZS91cGxvYWQvc2FtcGxl)))';

    const slideshowManifestJson = {
      "w": 848,
      "h": 480,
      "du": 6,
      "fps": 30,
      "vars": {
        "sdur": 500,
        "tdur": 500,
        "slides": [
          {
            "media": "i:protests9"
          }, {
            "media": "i:protests8"
          },
          {
            "media": "i:protests7"
          },
          {
            "media": "i:protests6"
          },
          {
            "media": "i:protests2"
          },
          {
            "media": "i:protests1"
          }
        ]
      }
    }


    const res = await UPLOADER_V2.create_slideshow({
      manifest_transformation: {
        custom_function: {
          function_type: 'render',
          source: slideshowManifest
        }
      },
      transformation: {
        width: 100,
        height: 100,
        crop: 'scale'
      },
      // manifest_json: slideshowManifestJson,
      tags: [TEST_TAG],
      overwrite: true,
      public_id: TEST_ID,
      notification_url: 'https://example.com'
    });

    expect(res.status).to.be('processing');
    expect(res.public_id).to.be(TEST_ID.toString()); // TestID is int, Server returns a string and not an int.
    expect(res.batch_id.length).to.be.above(5); // some long string
  })
})
