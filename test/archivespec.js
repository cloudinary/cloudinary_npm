require('dotenv').load({
  silent: true,
});

const https = require('https');
const expect = require("expect.js");
const last = require('lodash/last');
const sinon = require("sinon");
const { execSync } = require('child_process');
const Q = require('q');
const fs = require('fs');
const os = require('os');
const cloudinary = require("../cloudinary");
const helper = require("./spechelper");

const { utils, api, uploader } = cloudinary.v2;
const { TEST_TAG } = helper;
const { IMAGE_URL } = helper;
const { sharedExamples } = helper;
const { includeContext } = helper;
const ARCHIVE_TAG = TEST_TAG + "_archive";
const PUBLIC_ID1 = ARCHIVE_TAG + "_1";
const PUBLIC_ID2 = ARCHIVE_TAG + "_2";
const PUBLIC_ID_RAW = ARCHIVE_TAG + "_3";

sharedExamples('archive', () => {
  before("Verify Configuration", () => {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  before(function () {
    this.timeout(helper.TIMEOUT_LONG);
    return Q.all([
      uploader.upload(IMAGE_URL,
        {
          public_id: PUBLIC_ID1,
          tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG]),
          transformation: {
            effect: "blackwhite",
          },
        }),
      uploader.upload(IMAGE_URL,
        {
          public_id: PUBLIC_ID2,
          tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG]),
          transformation: {
            effect: "blackwhite",
          },
        }),
      uploader.upload(IMAGE_URL,
        {
          public_id: PUBLIC_ID_RAW,
          resource_type: "raw",
          tags: helper.UPLOAD_TAGS.concat([ARCHIVE_TAG]),
        }),
    ]);
  });
  after(() => {
    if (!cloudinary.config().keep_test_products) {
      api.delete_resources_by_tag(ARCHIVE_TAG);
    }
  });
});

describe("archive", () => {
  includeContext('archive');
  describe("utils", () => {
    describe('.generate_zip_download_url', function () {
      this.timeout(helper.TIMEOUT_LONG);
      this.archive_result = void 0;
      before(function () {
        this.archive_result = utils.download_zip_url({
          target_public_id: 'gem_archive_test',
          public_ids: [PUBLIC_ID2, PUBLIC_ID1],
          target_tags: ARCHIVE_TAG,
          expires_at: Date.now() / 1000 + 60, // expiration after 60 seconds
        });
      });
      describe('public_ids', () => {
        it('should generate a valid url', function () {
          expect(this.archive_result).not.to.be.empty();
        });
        it('should include two files', function (done) {
          var filename;
          filename = `${os.tmpdir()}/deleteme-${Math.floor(Math.random() * 100000)}.zip`;
          expect(this.archive_result).to.contain("expires_at");
          https.get(this.archive_result, (res) => {
            var file;
            file = fs.createWriteStream(filename);
            if (res.statusCode === 200) {
              res.pipe(file);
            } else {
              done(new Error(`${res.statusCode}: ${res.headers['x-cld-error']}`));
            }
            res.on('end', () => {
              file.on('close', () => {
                let list = execSync(`unzip -l -qq ${filename}`);
                list = list.toString().split('\n').slice(0, -1);
                list = list.map(line => last(line.split(/[ ]+/)));
                expect(list.length).to.eql(2);
                expect(list).to.contain(PUBLIC_ID1 + ".jpg");
                expect(list).to.contain(PUBLIC_ID2 + ".jpg");
                done();
              });
            });
          });
        });
      });
    });
  });

  describe("uploader", () => {
    describe('.create_archive', function () {
      var archive_result;
      this.timeout(helper.TIMEOUT_LONG);
      before(() => uploader.create_archive({
        target_public_id: 'gem_archive_test',
        public_ids: [PUBLIC_ID2, PUBLIC_ID1],
        target_tags: [TEST_TAG, ARCHIVE_TAG],
        mode: 'create',
        skip_transformation_name: true,
      }).then((result) => {
        archive_result = result;
      }));
      it('should a Hash', () => {
        expect(archive_result).to.be.an(Object);
      });
      const EXPECTED_KEYS = ["resource_type", "type", "public_id", "version", "url", "secure_url", "created_at", "tags", "signature", "bytes", "etag", "resource_count", "file_count"];
      it(`should include keys: ${EXPECTED_KEYS.join(', ')}`, () => {
        expect(archive_result).to.have.keys(EXPECTED_KEYS);
      });
    });
    describe('.create_zip', function () {
      this.timeout(helper.TIMEOUT_LONG);
      it('should call create_archive with "zip" format and ignore missing resources', () => {
        helper.mockPromise((xhr, write) => {
          uploader.create_zip({
            tags: TEST_TAG,
            public_ids: [PUBLIC_ID_RAW, "non-existing-resource"],
            resource_type: "raw",
            allow_missing: true,
          });
          sinon.assert.calledWith(write, sinon.match(helper.uploadParamMatcher("tags[]", TEST_TAG)));
          sinon.assert.calledWith(write, sinon.match(helper.uploadParamMatcher("public_ids[]", PUBLIC_ID_RAW)));
          sinon.assert.calledWith(write, sinon.match(helper.uploadParamMatcher("public_ids[]", "non-existing-resource")));
          sinon.assert.calledWith(write, sinon.match(helper.uploadParamMatcher("allow_missing", 1)));
          sinon.assert.calledWith(write, sinon.match(helper.uploadParamMatcher("target_format", "zip")));
        });
      });
    });
  });
});
