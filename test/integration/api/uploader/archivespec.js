const https = require('https');
const last = require('lodash/last');
const sinon = require("sinon");
const execSync = require('child_process').execSync;
const Q = require('q');
const fs = require('fs');
const os = require('os');
const describe = require('../../../testUtils/suite');
const cloudinary = require("../../../../cloudinary");
const helper = require("../../../spechelper");

const testConstants = require('../../../testUtils/testConstants');
const callReusableTest = require('../../../testUtils/reusableTests/reusableTests').callReusableTest;
const registerReusableTest = require('../../../testUtils/reusableTests/reusableTests').registerReusableTest;


const {
  TIMEOUT,
  TAGS,
  URLS
} = testConstants;

const {
  TEST_TAG,
  UPLOAD_TAGS
} = TAGS;

const {
  VIDEO_URL,
  IMAGE_URL
} = URLS;

const { utils, api, uploader } = cloudinary.v2;
const ARCHIVE_TAG = TEST_TAG + "_archive";
const PUBLIC_ID1 = ARCHIVE_TAG + "_1";
const PUBLIC_ID2 = ARCHIVE_TAG + "_2";
const PUBLIC_ID_RAW = ARCHIVE_TAG + "_3";
const FULLY_QUALIFIED_IMAGE = "image/upload/sample";
const FULLY_QUALIFIED_VIDEO = "video/upload/dog";


describe("archive", function () {
  this.timeout(TIMEOUT.LONG);

  before(function () {
    return Q.all([
      uploader.upload(IMAGE_URL,
        {
          public_id: PUBLIC_ID1,
          tags: UPLOAD_TAGS.concat([ARCHIVE_TAG]),
          transformation: {
            effect: "blackwhite"
          }
        }),
      uploader.upload(IMAGE_URL,
        {
          public_id: PUBLIC_ID2,
          tags: UPLOAD_TAGS.concat([ARCHIVE_TAG]),
          transformation: {
            effect: "blackwhite"
          }
        }),
      uploader.upload(IMAGE_URL,
        {
          public_id: PUBLIC_ID_RAW,
          resource_type: "raw",
          tags: UPLOAD_TAGS.concat([ARCHIVE_TAG])
        }),
      uploader.upload(VIDEO_URL,
        {
          public_id: "dog",
          resource_type: "video",
          tags: UPLOAD_TAGS.concat([ARCHIVE_TAG])
        })
    ]);
  });
  after(function () {
    if (!cloudinary.config().keep_test_products) {
      api.delete_resources_by_tag(ARCHIVE_TAG);
    }
  });

  describe("utils", function () {
    describe('.generate_zip_download_url', function () {
      this.archive_result = void 0;
      before(function () {
        this.archive_result = utils.download_zip_url({
          target_public_id: 'gem_archive_test',
          public_ids: [PUBLIC_ID2, PUBLIC_ID1],
          target_tags: ARCHIVE_TAG,
          expires_at: Date.now() / 1000 + 60 // expiration after 60 seconds
        });
      });
      describe('public_ids', function () {
        it('should generate a valid url', function () {
          expect(this.archive_result).not.to.be.empty();
        });
        it('should include two files', function (done) {
          var filename;
          filename = `${os.tmpdir()}/deleteme-${Math.floor(Math.random() * 100000)}.zip`;
          expect(this.archive_result).to.contain("expires_at");
          https.get(this.archive_result, function (res) {
            var file;
            file = fs.createWriteStream(filename);
            if (res.statusCode === 200) {
              res.pipe(file);
            } else {
              done(new Error(`${res.statusCode}: ${res.headers['x-cld-error']}`));
            }
            res.on('end', function () {
              file.on('close', function () {
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

  describe("uploader", function () {
    describe('.create_archive', function () {
      var archive_result;
      this.timeout(TIMEOUT.LONG);
      before(function () {
        return uploader.create_archive({
          target_public_id: 'gem_archive_test',
          public_ids: [PUBLIC_ID2, PUBLIC_ID1],
          target_tags: [TEST_TAG, ARCHIVE_TAG],
          mode: 'create',
          skip_transformation_name: true
        }).then((result) => {
          archive_result = result;
        });
      });
      it('should return an object', function () {
        expect(archive_result).to.be.an(Object);
      });
      const EXPECTED_KEYS = ["resource_type", "type", "public_id", "version", "url", "secure_url", "created_at", "tags", "signature", "bytes", "etag", "resource_count", "file_count"];
      it(`should include keys: ${EXPECTED_KEYS.join(', ')}`, function () {
        expect(archive_result).to.have.keys(EXPECTED_KEYS);
      });
    });
    describe('.create_zip', function () {
      this.timeout(TIMEOUT.LONG);
      it('should call create_archive with "zip" format and ignore missing resources', function () {
        helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
          uploader.create_zip({
            tags: TEST_TAG,
            public_ids: [PUBLIC_ID_RAW, "non-existing-resource"],
            resource_type: "raw",
            allow_missing: true
          });
          sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("tags[]", TEST_TAG)));
          sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("public_ids[]", PUBLIC_ID_RAW)));
          sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("public_ids[]", "non-existing-resource")));
          sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("allow_missing", 1)));
          sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("target_format", "zip")));
        });
      });
      it('should create archive with "zip" format and include multiple resource types', function () {
        return uploader.create_zip({
          fully_qualified_public_ids: [FULLY_QUALIFIED_IMAGE, FULLY_QUALIFIED_VIDEO],
          resource_type: "auto"
        }).then((result) => {
          expect(result.file_count).to.eql(2);
        });
      });
    });
  });
  describe('download_folder', function(){
    it('should return url with resource_type image', function(){
      let download_folder_url = utils.download_folder('samples/', {resource_type: 'image'});
      expect(download_folder_url).to.contain('image');
    });
    it('should return valid url', function(){
      let download_folder_url = utils.download_folder('folder/');
      expect(download_folder_url).not.to.be.empty();
      expect(download_folder_url).to.contain('generate_archive');
    });

    it('should flatten folder', function(){
      let download_folder_url = utils.download_folder('folder/', {flatten_folders: true});
      expect(download_folder_url).to.contain('flatten_folders');
    });

    it('should expire_at folder', function(){
      let download_folder_url = utils.download_folder('folder/', {expires_at: Date.now() / 1000 + 60});
      expect(download_folder_url).to.contain('expires_at');
    });

    it('should use original file_name of folder', function(){
      let download_folder_url = utils.download_folder('folder/', {use_original_filename: true});
      expect(download_folder_url).to.contain('use_original_filename');
    });
  });

  describe('download_backedup_asset', function(){
    it('should return url with asset and version id', function(){
      let download_backedup_asset_url = utils.download_backedup_asset('b71b23d9c89a81a254b88a91a9dad8cd', '0e493356d8a40b856c4863c026891a4e');
      expect(download_backedup_asset_url).to.contain('asset_id');
      expect(download_backedup_asset_url).to.contain('version_id');
    });
  });
});
