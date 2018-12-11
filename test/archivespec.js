var ARCHIVE_TAG, ClientRequest, IMAGE_URL, Q, TEST_TAG, api, cloudinary, exec, execSync, expect, fs, helper, http, https, includeContext, last, os, publicId1, publicId2, publicIdRaw, sharedExamples, sinon, uploader, utils, zlib;

require('dotenv').load({
  silent: true
});

helper = require("./spechelper");

http = require('http');

https = require('https');

expect = require("expect.js");

cloudinary = require("../cloudinary");

utils = cloudinary.v2.utils;

last = require('lodash/last');

({api, uploader} = cloudinary.v2);

zlib = require('zlib');

sinon = require("sinon");

ClientRequest = require('_http_client').ClientRequest;

exec = require('child_process').exec;

execSync = require('child_process').execSync;

Q = require('q');

fs = require('fs');

os = require('os');

TEST_TAG = helper.TEST_TAG;

IMAGE_URL = helper.IMAGE_URL;

sharedExamples = helper.sharedExamples;

includeContext = helper.includeContext;

ARCHIVE_TAG = TEST_TAG + "_archive";

publicId1 = ARCHIVE_TAG + "_1";

publicId2 = ARCHIVE_TAG + "_2";

publicIdRaw = ARCHIVE_TAG + "_3";

sharedExamples('archive', function() {
  before("Verify Configuration", function() {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      return expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  before(function() {
    this.timeout(helper.TIMEOUT_LONG);
    return Q.all([
      uploader.upload(IMAGE_URL,
      {
        public_id: publicId1,
        tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG]),
        transformation: {
          effect: "blackwhite"
        }
      }),
      uploader.upload(IMAGE_URL,
      {
        public_id: publicId2,
        tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG]),
        transformation: {
          effect: "blackwhite"
        }
      }),
      uploader.upload(IMAGE_URL,
      {
        public_id: publicIdRaw,
        resource_type: "raw",
        tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG])
      })
    ]);
  });
  return after(function() {
    if (!cloudinary.config().keep_test_products) {
      return cloudinary.v2.api.delete_resources_by_tag(ARCHIVE_TAG);
    }
  });
});

describe("utils", function() {
  before("Verify Configuration", function() {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      return expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  includeContext.call(this, 'archive');
  return describe('.generate_zip_download_url', function() {
    var archive_result;
    this.timeout(helper.TIMEOUT_LONG);
    archive_result = void 0;
    before(function() {
      return archive_result = utils.download_zip_url({
        target_public_id: 'gem_archive_test',
        public_ids: [publicId2, publicId1],
        target_tags: ARCHIVE_TAG,
        expires_at: Date.now() / 1000 + 60 // expiration after 60 seconds
      });
    });
    return describe('public_ids', function() {
      it('should generate a valid url', function() {
        return expect(archive_result).not.to.be.empty();
      });
      return it('should include two files', function(done) {
        var filename;
        filename = `${os.tmpdir()}/deleteme-${Math.floor(Math.random() * 100000)}.zip`;
        expect(archive_result).to.contain("expires_at");
        return https.get(archive_result, function(res) {
          var file;
          file = fs.createWriteStream(filename);
          if (res.statusCode === 200) {
            res.pipe(file);
          } else {
            done(new Error(`${res.statusCode}: ${res.headers['x-cld-error']}`));
          }
          return res.on('end', function() {
            return file.on('close', function() {
              var i, list;
              list = execSync(`unzip -l -qq ${filename}`);
              list = list.toString().split('\n').slice(0, -1);
              list = (function() {
                var j, len, results;
// keep only filenames
                results = [];
                for (j = 0, len = list.length; j < len; j++) {
                  i = list[j];
                  results.push(last(i.split(/[ ]+/)));
                }
                return results;
              })();
              expect(list.length).to.eql(2);
              expect(list).to.contain(publicId1 + ".jpg");
              expect(list).to.contain(publicId2 + ".jpg");
              return done();
            });
          });
        });
      });
    });
  });
});

describe("uploader", function() {
  before("Verify Configuration", function() {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      return expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  includeContext.call(this, 'archive');
  describe('.create_archive', function() {
    var archive_result, expected_keys;
    this.timeout(helper.TIMEOUT_LONG);
    archive_result = void 0;
    before(function() {
      this.timeout(helper.TIMEOUT_LONG);
      return uploader.create_archive({
        target_public_id: 'gem_archive_test',
        public_ids: [publicId2, publicId1],
        target_tags: [TEST_TAG, ARCHIVE_TAG],
        mode: 'create',
        skip_transformation_name: true
      }, function(error, result) {
        if (error != null) {
          new Error(error.message);
        }
        return archive_result = result;
      });
    });
    it('should return a Hash', function() {
      return expect(archive_result).to.be.an(Object);
    });
    expected_keys = ["resource_type", "type", "public_id", "version", "url", "secure_url", "created_at", "tags", "signature", "bytes", "etag", "resource_count", "file_count"];
    return it(`should include keys: ${expected_keys.join(', ')}`, function() {
      return expect(archive_result).to.have.keys(expected_keys);
    });
  });
  return describe('.create_zip', function() {
    var mocked;
    this.timeout(helper.TIMEOUT_LONG);
    mocked = helper.mockTest();
    return it('should call create_archive with "zip" format and ignore missing resources', function() {
      uploader.create_zip({
        tags: TEST_TAG,
        public_ids: [publicIdRaw, "non-existing-resource"],
        resource_type: "raw",
        allow_missing: true
      });
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("tags[]", TEST_TAG)));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("public_ids[]", publicIdRaw)));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("public_ids[]", "non-existing-resource")));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("allow_missing", 1)));
      return sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("target_format", "zip")));
    });
  });
});
