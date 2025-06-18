const https = require('https');
const http = require('http');
const sinon = require('sinon');
const fs = require('fs');
const Q = require('q');
const path = require('path');
const at = require('lodash/at');
const uniq = require('lodash/uniq');
const ClientRequest = require('_http_client').ClientRequest;
const cloudinary = require("../../../../cloudinary");
const helper = require("../../../spechelper");
const describe = require('../../../testUtils/suite');
const cloneDeep = require('lodash/cloneDeep');
const assert = require('assert');

const IMAGE_FILE = helper.IMAGE_FILE;
const LARGE_IMAGE_FILE = helper.LARGE_IMAGE_FILE;
const LARGE_RAW_FILE = helper.LARGE_RAW_FILE;
const LARGE_VIDEO = helper.LARGE_VIDEO;
const EMPTY_IMAGE = helper.EMPTY_IMAGE;
const RAW_FILE = helper.RAW_FILE;
const uploadImage = helper.uploadImage;
const shouldTestAddOn = helper.shouldTestAddOn;
const ADDON_OCR = helper.ADDON_OCR;
const TEST_ID = Date.now();

const METADATA_FIELD_UNIQUE_EXTERNAL_ID = 'metadata_field_external_id_' + TEST_ID;
const METADATA_FIELD_VALUE = 'metadata_field_value_' + TEST_ID;
const METADATA_SAMPLE_DATA = { metadata_color: "red", metadata_shape: "dodecahedron" };
const METADATA_SAMPLE_DATA_ENCODED = "metadata_color=red|metadata_shape=dodecahedron";
const createTestConfig = require('../../../testUtils/createTestConfig');

const testConstants = require('../../../testUtils/testConstants');
const { shouldTestFeature, DYNAMIC_FOLDERS } = require("../../../spechelper");
const UPLOADER_V2 = cloudinary.v2.uploader;

const {
  TIMEOUT,
  TAGS,
  TEST_EVAL_STR,
  TEST_IMG_WIDTH
} = testConstants;

const {
  TEST_TAG,
  UPLOAD_TAGS
} = TAGS;

const SAMPLE_IMAGE_URL_1 = "https://res.cloudinary.com/demo/image/upload/sample"
const SAMPLE_IMAGE_URL_2 = "https://res.cloudinary.com/demo/image/upload/car"

require('jsdom-global')();

describe("uploader", function () {
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
  it("should successfully upload file", function () {
    this.timeout(TIMEOUT.LONG);
    return uploadImage().then(function (result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
    });
  });
  it("should successfully upload with metadata", function () {
    return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
      uploadImage({ metadata: METADATA_SAMPLE_DATA });
      sinon.assert.calledWith(requestSpy, sinon.match({
        method: sinon.match("POST")
      }));
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("metadata", METADATA_SAMPLE_DATA_ENCODED)));
    });
  });
  it('should upload a file with correctly encoded transformation string', () => {
    return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
      const uploadResult = cloudinary.v2.uploader.upload('irrelevant', { transformation: { overlay: { text: 'test / 火' } } });
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('transformation', 'l_text:test %2F 火')));
    });
  });
  it('should upload a file with correctly encoded transformation string incl 4bytes characters', () => {
    return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
      cloudinary.v2.uploader.upload('irrelevant', { transformation: { overlay: { text: 'test 𩸽 🍺' } } })
        .then((uploadResult) => {
          sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('transformation', 'l_text:test 𩸽 🍺')));
          expect(uploadResult).to.have.key("created_at");
        });
    });
  });
  it("should successfully upload url", function () {
    return cloudinary.v2.uploader.upload("https://cloudinary.com/images/old_logo.png", {
      tags: UPLOAD_TAGS
    }).then(function (result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
    });
  });
  it("should successfully override original_filename", function () {
    return cloudinary.v2.uploader.upload("https://cloudinary.com/images/old_logo.png", {
      filename_override: 'overridden'
    }).then((result) => {
      expect(result.original_filename).to.eql('overridden');
    });
  });
  it("Should upload a valid docx file as base64", function () {
    let data = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,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';

    return cloudinary.v2.uploader.upload(data, {
      resource_type: 'auto', // this defaults to 'image' if not specified
      tags: UPLOAD_TAGS
    });
  });
  it('should allow uploading with parameters containing &', function () {
    const publicId = `ampersand-test-${Date.now()}`;
    return cloudinary.v2.uploader.upload('https://cloudinary.com/images/old_logo.png', {
      notification_url: 'https://example.com?exampleparam1=aaa&exampleparam2=bbb',
      public_id: publicId
    }).then((result) => {
      expect(result).to.have.property('public_id');
      expect(result.public_id).to.equal(publicId);
    }).catch((error) => {
      expect(error).to.be(null);
    });
  });
  it('should allow upload with url safe base64 in overlay', function () {
    const overlayUrl = 'https://res.cloudinary.com/demo/image/upload/logos/cloudinary_full_logo_white_small.png';
    const baseImageUrl = 'https://cloudinary.com/images/old_logo.png';

    const options = { transformation: { overlay: { url: overlayUrl } } };
    return cloudinary.v2.uploader.upload(baseImageUrl, options)
      .then((result) => {
        expect(result).to.have.key("created_at");
      });
  });
  describe("remote urls ", function () {
    const mocked = helper.mockTest();
    it("should send s3:// URLs to server", function () {
      cloudinary.v2.uploader.upload("s3://test/1.jpg", {
        tags: UPLOAD_TAGS
      });
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher('file', "s3://test/1.jpg")));
    });
    it("should send gs:// URLs to server", function () {
      cloudinary.v2.uploader.upload("gs://test/1.jpg", {
        tags: UPLOAD_TAGS
      });
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher('file', "gs://test/1.jpg")));
    });
    it("should send ftp:// URLs to server", function () {
      cloudinary.v2.uploader.upload("ftp://example.com/1.jpg", {
        tags: UPLOAD_TAGS
      });
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher('file', "ftp://example.com/1.jpg")));
    });
  });
  describe("rename", function () {
    this.timeout(TIMEOUT.LONG);
    it("should successfully rename a file", function () {
      return uploadImage().then(function (result) {
        return cloudinary.v2.uploader.rename(result.public_id, result.public_id + "2").then(function () {
          return result.public_id;
        });
      }).then(function (public_id) {
        return cloudinary.v2.api.resource(public_id + "2");
      });
    });
    it("should not rename to an existing public_id", function () {
      return Promise.all([uploadImage(), uploadImage()]).then(function (results) {
        return cloudinary.v2.uploader.rename(results[0].public_id, results[1].public_id);
      }).then(function () {
        expect().fail();
      }).catch(function (error) {
        expect(error).to.be.ok();
      });
    });
    it("should allow to rename to an existing ID, if overwrite is true", function () {
      return Promise.all([uploadImage(), uploadImage()]).then(function (results) {
        return cloudinary.v2.uploader.rename(results[0].public_id, results[1].public_id, {
          overwrite: true
        });
      }).then(function ({ public_id }) {
        return cloudinary.v2.api.resource(public_id);
      }).then(function ({ format }) {
        expect(format).to.eql("png");
      });
    });
    it('should include tags in rename response if requested explicitly', async () => {
      const uploadResult = await cloudinary.v2.uploader.upload(IMAGE_FILE, { context: 'alt=Example|class=Example', tags: ['test-tag'] });

      const renameResult = await cloudinary.v2.uploader.rename(uploadResult.public_id, `${uploadResult.public_id}-renamed`, { tags: true, context: true });

      expect(renameResult).to.have.property('tags');
      expect(renameResult).to.have.property('context');
    });
    it('should include notification_url in rename response if included in the request', async () => {
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        const renameResult = cloudinary.v2.uploader.rename('irrelevant', 'irrelevant', { notification_url: 'https://notification-url.com' });
        sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('notification_url', 'https://notification-url.com')));
      });
    });
    return context(":invalidate", function () {
      var spy, xhr;
      spy = void 0;
      xhr = void 0;
      before(function () {
        xhr = sinon.useFakeXMLHttpRequest();
        spy = sinon.spy(ClientRequest.prototype, 'write');
      });
      after(function () {
        spy.restore();
        return xhr.restore();
      });
      it("should pass the invalidate value in rename to the server", function () {
        cloudinary.v2.uploader.rename("first_id", "second_id", {
          invalidate: true
        });
        expect(spy.calledWith(sinon.match(function (arg) {
          return arg.toString().match(/name="invalidate"/);
        }))).to.be.ok();
      });
    });
  });
  describe("destroy", function () {
    this.timeout(TIMEOUT.MEDIUM);
    it("should delete a resource", function () {
      var public_id;
      return uploadImage().then(function (result) {
        public_id = result.public_id;
        return cloudinary.v2.uploader.destroy(public_id);
      }).then(function (result) {
        expect(result.result).to.eql("ok");
        return cloudinary.v2.api.resource(public_id);
      }).then(function () {
        expect().fail();
      }).catch(function (error) {
        expect(error).to.be.ok();
      });
    });
    it('should pass notification_url', async () => {
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        const renameResult = cloudinary.v2.uploader.destroy('irrelevant', { notification_url: 'https://notification-url.com' });
        sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('notification_url', 'https://notification-url.com')));
      });
    });
  });
  it("should support `async` option in explicit api", function () {
    return cloudinary.v2.uploader.explicit("sample", {
      type: "facebook",
      eager: [
        {
          crop: "scale",
          width: "2.0"
        }
      ],
      async: true
    }).then(function (result) {
      expect(result.status).to.eql('pending');
      expect(result.resource_type).to.eql('image');
      expect(result.type).to.eql('facebook');
      expect(result.public_id).to.eql('sample');
    });
  });
  it("should successfully call explicit api", function () {
    return cloudinary.v2.uploader.explicit("sample", {
      type: "upload",
      eager: [
        {
          crop: "scale",
          width: "2.0"
        }
      ]
    }).then(function (result) {
      var url = cloudinary.utils.url("sample", {
        type: "upload",
        crop: "scale",
        width: "2.0",
        format: "jpg",
        version: result.version
      });
      expect(result.eager[0].secure_url).to.eql(url);
    });
  });
  it("should support eager in upload", function () {
    this.timeout(TIMEOUT.SHORT);
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      eager: [
        {
          crop: "scale",
          width: "2.0"
        }
      ],
      tags: UPLOAD_TAGS
    });
  });
  describe("extra headers", function () {
    it("should support extra headers in object format e.g. {Link: \"1\"}", function () {
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        cloudinary.v2.uploader.upload(IMAGE_FILE, {
          extra_headers: {
            Link: "1"
          }
        });
        assert.ok(requestSpy.args[0][0].headers.Link);
        assert.equal(requestSpy.args[0][0].headers.Link, "1");
      });
    });
  });
  describe("text images", function () {
    it("should successfully generate text image", function () {
      return cloudinary.v2.uploader.text("hello world", {
        tags: UPLOAD_TAGS
      }).then(function (result) {
        expect(result.width).to.within(50, 70);
        expect(result.height).to.within(5, 15);
      });
    });
    var mocked = helper.mockTest();
    it("should pass text image parameters to server", function () {
      cloudinary.v2.uploader.text("hello word",
        {
          font_family: "Arial",
          font_size: 12,
          font_weight: "black"
        });
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("font_family", "Arial")));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("font_size", "12")));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("font_weight", "black")));
    });
  });
  it("should successfully upload stream", function (done) {
    var file_reader, stream;
    stream = cloudinary.v2.uploader.upload_stream({
      tags: UPLOAD_TAGS
    }, function (error, result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      done();
    });
    file_reader = fs.createReadStream(IMAGE_FILE, {
      encoding: 'binary'
    });
    file_reader.on('data', function (chunk) {
      stream.write(chunk, 'binary');
    });
    file_reader.on('end', function () {
      stream.end();
    });
  });
  describe("tags", function () {
    this.timeout(TIMEOUT.MEDIUM);
    it("should add tags to existing resources", function () {
      return uploadImage().then(function (result) {
        return uploadImage().then(function (res) {
          return [result.public_id, res.public_id];
        });
      }).then(function ([firstId, secondId]) {
        return cloudinary.v2.uploader.add_tag("tag1", [firstId, secondId]).then(function () {
          return [firstId, secondId];
        });
      }).then(function ([firstId, secondId]) {
        return cloudinary.v2.api.resource(secondId).then(function (r1) {
          expect(r1.tags).to.contain("tag1");
        }).then(function () {
          return [firstId, secondId];
        });
      }).then(function ([firstId, secondId]) {
        return cloudinary.v2.uploader.remove_all_tags([firstId, secondId, 'noSuchId']).then(function (result) {
          return [firstId, secondId, result];
        });
      }).then(function ([firstId, secondId, result]) {
        expect(result.public_ids).to.contain(firstId);
        expect(result.public_ids).to.contain(secondId);
        expect(result.public_ids).to.not.contain('noSuchId');
      });
    });
    it("should keep existing tags when adding a new tag", function () {
      return uploadImage().then(function (result) {
        return cloudinary.v2.uploader.add_tag("tag1", result.public_id).then(function () {
          return result.public_id;
        });
      }).then(function (publicId) {
        return cloudinary.v2.uploader.add_tag("tag2", publicId).then(function () {
          return publicId;
        });
      }).then(function (publicId) {
        return cloudinary.v2.api.resource(publicId);
      }).then(function (result) {
        expect(result.tags).to.contain("tag1").and.contain("tag2");
      });
    });
    it("should replace existing tag", function () {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: ["tag1", "tag2", TEST_TAG]
      }).then(function (result) {
        var public_id = result.public_id;
        return cloudinary.v2.uploader.replace_tag("tag3Å", public_id).then(function () {
          return public_id;
        });
      }).then(function (public_id) { // TODO this also tests non ascii characters
        return cloudinary.v2.api.resource(public_id);
      }).then(function (result) {
        expect(result.tags).to.eql(["tag3Å"]);
      });
    });
  });
  describe("context", function () {
    this.timeout(TIMEOUT.MEDIUM);
    before(function () {
      return Q.all([uploadImage(), uploadImage()]).spread((result1, result2) => {
        this.first_id = result1.public_id;
        this.second_id = result2.public_id;
      });
    });
    it("should add context to existing resources", function () {
      return cloudinary.v2.uploader
        .add_context('alt=testAlt|custom=testCustom', [this.first_id, this.second_id])
        .then(() => cloudinary.v2.uploader.add_context({
          alt2: "testAlt2",
          custom2: "testCustom2"
        }, [this.first_id, this.second_id]))
        .then(() => cloudinary.v2.api.resource(this.second_id))
        .then(({ context }) => {
          expect(context.custom.alt).to.equal('testAlt');
          expect(context.custom.alt2).to.equal('testAlt2');
          expect(context.custom.custom).to.equal('testCustom');
          expect(context.custom.custom2).to.equal('testCustom2');
          return cloudinary.v2.uploader.remove_all_context([this.first_id, this.second_id, 'noSuchId']);
        }).then(({ public_ids }) => {
          expect(public_ids).to.contain(this.first_id);
          expect(public_ids).to.contain(this.second_id);
          expect(public_ids).to.not.contain('noSuchId');
          return cloudinary.v2.api.resource(this.second_id);
        }).then(function ({ context }) {
          expect(context).to.be(void 0);
        });
    });
    it("should upload with context containing reserved characters", function () {
      var context = {
        key1: 'value1',
        key2: 'valu\e2',
        key3: 'val=u|e3',
        key4: 'val\=ue'
      };
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        context: context
      }).then(function (result) {
        return cloudinary.v2.api.resource(result.public_id, {
          context: true
        });
      }).then(function (result) {
        expect(result.context.custom).to.eql(context);
      });
    });
  });
  it("should support timeouts", function () {
    // testing a 1ms timeout, nobody is that fast.
    return cloudinary.v2.uploader.upload("https://cloudinary.com/images/old_logo.png", {
      timeout: 1,
      tags: UPLOAD_TAGS
    }).then(function () {
      expect().fail();
    }).catch(function ({ error }) {
      expect(error.http_code).to.eql(499);
      expect(error.message).to.eql("Request Timeout");
    });
  });
  it("should upload a file and base public id on the filename if use_filename is set to true", function () {
    this.timeout(TIMEOUT.MEDIUM);
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      use_filename: true,
      tags: UPLOAD_TAGS
    }).then(function ({ public_id }) {
      expect(public_id).to.match(/logo_[a-zA-Z0-9]{6}/);
    });
  });
  it("should upload a file and set the filename as the public_id if use_filename is set to true and unique_filename is set to false", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      use_filename: true,
      unique_filename: false,
      tags: UPLOAD_TAGS
    }).then(function (result) {
      expect(result.public_id).to.eql("logo");
    });
  });
  describe("allowed_formats", function () {
    it("should allow whitelisted formats", function () {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        allowed_formats: ["png"],
        tags: UPLOAD_TAGS
      }).then(function (result) {
        expect(result.format).to.eql("png");
      });
    });
    it("should prevent non whitelisted formats from being uploaded", function () {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        allowed_formats: ["jpg"],
        tags: UPLOAD_TAGS
      }).then(function () {
        expect().fail();
      }).catch(function (error) {
        expect(error.http_code).to.eql(400);
      });
    });
    it("should allow non whitelisted formats if type is specified and convert to that type", function () {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        allowed_formats: ["jpg"],
        format: "jpg",
        tags: UPLOAD_TAGS
      }).then(function (result) {
        expect(result.format).to.eql("jpg");
      });
    });
  });
  it("should allow sending face coordinates", function () {
    var coordinates, custom_coordinates, different_coordinates, out_coordinates;
    this.timeout(TIMEOUT.LONG);
    coordinates = [[120, 30, 109, 150], [121, 31, 110, 151]];
    out_coordinates = [
      [120,
        30,
        109,
        51],
      [
        121,
        31,
        110,
        51 // coordinates are limited to the image dimensions
      ]
    ];
    different_coordinates = [[122, 32, 111, 152]];
    custom_coordinates = [1, 2, 3, 4];
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      face_coordinates: coordinates,
      faces: true,
      tags: UPLOAD_TAGS
    }).then(function (result) {
      expect(result.faces).to.eql(out_coordinates);
      return cloudinary.v2.uploader.explicit(result.public_id, {
        faces: true,
        face_coordinates: different_coordinates,
        custom_coordinates: custom_coordinates,
        type: "upload"
      });
    }).then(function (result) {
      expect(result.faces).not.to.be(void 0);
      return cloudinary.v2.api.resource(result.public_id, {
        faces: true,
        coordinates: true
      });
    }).then(function (info) {
      expect(info.faces).to.eql(different_coordinates);
      expect(info.coordinates).to.eql({
        faces: different_coordinates,
        custom: [custom_coordinates]
      });
    });
  });
  it("should allow sending context", function () {
    this.timeout(TIMEOUT.LONG);
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      context: {
        caption: "some caption",
        alt: "alternative"
      },
      tags: UPLOAD_TAGS
    }).then(function ({ public_id }) {
      return cloudinary.v2.api.resource(public_id, {
        context: true
      });
    }).then(function ({ context }) {
      expect(context.custom.caption).to.eql("some caption");
      expect(context.custom.alt).to.eql("alternative");
    });
  });
  it("should support requesting manual moderation", function () {
    this.timeout(TIMEOUT.LONG);
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      moderation: "manual",
      tags: UPLOAD_TAGS
    }).then(function (result) {
      expect(result.moderation[0].status).to.eql("pending");
      expect(result.moderation[0].kind).to.eql("manual");
    });
  });
  it("should support requesting raw conversion", function () {
    return cloudinary.v2.uploader.upload(RAW_FILE, {
      raw_convert: "illegal",
      resource_type: "raw",
      tags: UPLOAD_TAGS
    }).then(function () {
      expect().fail();
    }).catch(function (error) {
      expect(error != null).to.be(true);
      expect(error.message).to.contain("Raw convert is invalid");
    });
  });
  it("should support requesting categorization", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      categorization: "illegal",
      tags: UPLOAD_TAGS
    }).then(function () {
      expect().fail();
    }).catch(function (error) {
      expect(error != null).to.be(true);
    });
  });
  it("should support requesting detection", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      detection: "illegal",
      tags: UPLOAD_TAGS
    }).then(function () {
      expect().fail();
    }).catch(function (error) {
      expect(error).not.to.be(void 0);
      expect(error.message).to.contain("Detection invalid model 'illegal'");
    });
  });
  it("should support requesting background_removal", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      background_removal: "illegal",
      tags: UPLOAD_TAGS
    }).then(function () {
      expect().fail();
    }).catch(function (error) {
      expect(error != null).to.be(true);
      expect(error.message).to.contain("is invalid");
    });
  });
  it("should support requesting analysis", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      quality_analysis: true,
      tags: UPLOAD_TAGS
    }).then(function (result) {
      expect(result).to.have.key("quality_analysis");
    });
  });

  describe('when passing visual_search in parameters', () => {
    var spy, xhr;
    spy = void 0;
    xhr = void 0;
    before(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      spy = sinon.spy(ClientRequest.prototype, 'write');
    });
    after(function () {
      spy.restore();
      return xhr.restore();
    });

    it('should pass its value to the upload api', () => {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        visual_search: true
      });

      expect(spy.calledWith(sinon.match((arg) => {
        return arg.toString().match(/visual_search=true/);
      })));
    });
  });

  describe('when passing on_success in parameters', () => {
    var spy, xhr;
    spy = void 0;
    xhr = void 0;
    before(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      spy = sinon.spy(ClientRequest.prototype, 'write');
    });
    after(function () {
      spy.restore();
      return xhr.restore();
    });

    it('should pass its value to the upload api', () => {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        on_success: 'current_asset.update({tags: ["autocaption"]});'
      });

      expect(spy.calledWith(sinon.match((arg) => {
        return arg.toString().match(/on_success='current_asset.update({tags: ["autocaption"]});'/);
      })));
    });
  });

  describe("upload_chunked", function () {
    this.timeout(TIMEOUT.LONG * 10);
    it("should specify chunk size", function (done) {
      return fs.stat(LARGE_RAW_FILE, function (err, stat) {
        cloudinary.v2.uploader.upload_large(LARGE_RAW_FILE, {
          chunk_size: 7000000,
          timeout: TIMEOUT.LONG,
          tags: UPLOAD_TAGS
        }, function (error, result) {
          if (error != null) {
            done(new Error(error.message));
          }
          expect(result.bytes).to.eql(stat.size);
          expect(result.etag).to.eql("4c13724e950abcb13ec480e10f8541f5");
          return done();
        });
      });
    });
    it("should return error if value is less than 5MB", function (done) {
      fs.stat(LARGE_RAW_FILE, function (err, stat) {
        cloudinary.v2.uploader.upload_large(LARGE_RAW_FILE, {
          chunk_size: 40000,
          tags: UPLOAD_TAGS
        }, function (error, result) {
          expect(error.message).to.eql("All parts except EOF-chunk must be larger than 5mb");
          done();
        });
      });
    });
    it("should use file name", function (done) {
      fs.stat(LARGE_RAW_FILE, function (err, stat) {
        return cloudinary.v2.uploader.upload_large(LARGE_RAW_FILE, {
          use_filename: true
        }, function (error, result) {
          if (error != null) {
            done(new Error(error.message));
          }
          expect(result.public_id).to.match(/TheCompleteWorksOfShakespeare_[a-zA-Z0-9]{6}/);
          done();
        });
      });
    });
    it("should support uploading a small raw file", function (done) {
      fs.stat(RAW_FILE, function (err, stat) {
        cloudinary.v2.uploader.upload_large(RAW_FILE, {
          tags: UPLOAD_TAGS
        }, function (error, result) {
          if (error != null) {
            done(new Error(error.message));
          }
          expect(result.bytes).to.eql(stat.size);
          expect(result.etag).to.eql("ffc265d8d1296247972b4d478048e448");
          done();
        });
      });
    });
    it("should add original filename on upload large", function (done) {
      fs.stat(RAW_FILE, function (err, stat) {
        cloudinary.v2.uploader.upload_large(RAW_FILE, {
          filename: 'my_file_name'
        }, function (error, result) {
          if (error != null) {
            done(new Error(error.message));
          }
          expect(result.original_filename).to.eql('my_file_name');
          done();
        });
      });
    });
    it("should support uploading a small image file", function (done) {
      fs.stat(IMAGE_FILE, function (err, stat) {
        return cloudinary.v2.uploader.upload_chunked(IMAGE_FILE, {
          tags: UPLOAD_TAGS
        }, function (error, result) {
          if (error != null) {
            done(new Error(error.message));
          }
          expect(result.bytes).to.eql(stat.size);
          expect(result.etag).to.eql("7dc60722d4653261648038b579fdb89e");
          done();
        });
      });
    });
    it("should support uploading large video files", function () {
      var stat, writeSpy;
      this.timeout(TIMEOUT.LONG * 10);
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      stat = fs.statSync(LARGE_VIDEO);
      expect(stat).to.be.ok();
      return Q.denodeify(cloudinary.v2.uploader.upload_chunked)(LARGE_VIDEO, {
        chunk_size: 6000000,
        resource_type: 'video',
        timeout: TIMEOUT.LONG * 10,
        tags: UPLOAD_TAGS
      }).then(function (result) {
        var timestamps;
        expect(result.bytes).to.eql(stat.size);
        expect(result.etag).to.eql("ff6c391d26be0837ee5229885b5bd571");
        timestamps = writeSpy.args.map(function (a) {
          return a[0].toString();
        }).filter(function (p) {
          return p.match(/timestamp/);
        }).map(function (p) {
          return p.match(/"timestamp"\s+(\d+)/)[1];
        });
        expect(timestamps.length).to.be.greaterThan(1);
        expect(uniq(timestamps)).to.eql(uniq(timestamps)); // uniq b/c last timestamp may be duplicated
      }).finally(function () {
        writeSpy.restore();
      });
    });
    it("should update timestamp for each chunk", function () {
      var writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      return Q.denodeify(cloudinary.v2.uploader.upload_chunked)(LARGE_VIDEO, {
        chunk_size: 6000000,
        resource_type: 'video',
        timeout: TIMEOUT.LONG * 10,
        tags: UPLOAD_TAGS
      }).then(function () {
        var timestamps = writeSpy.args.map(function (a) {
          return a[0].toString();
        }).filter(function (p) {
          return p.match(/timestamp/);
        }).map(function (p) {
          return p.match(/"timestamp"\s+(\d+)/)[1];
        });
        expect(timestamps.length).to.be.greaterThan(1);
        expect(uniq(timestamps)).to.eql(uniq(timestamps));
      }).finally(function () {
        writeSpy.restore();
      });
    });
    it("should support uploading based on a url", function (done) {
      this.timeout(TIMEOUT.MEDIUM);
      cloudinary.v2.uploader.upload_large("https://cloudinary.com/images/old_logo.png", {
        tags: UPLOAD_TAGS
      }, function (error, result) {
        if (error != null) {
          done(new Error(error.message));
        }
        expect(result.etag).to.eql("7dc60722d4653261648038b579fdb89e");
        done();
      });
    });
  });
  describe("dynamic folders", () => {
    const mocked = helper.mockTest();
    it('should pass dynamic folder params', () => {
      const public_id_prefix = "fd_public_id_prefix";
      const asset_folder = "asset_folder";
      const display_name = "display_name";
      const use_filename_as_display_name = true;
      const folder = "folder/test";
      UPLOADER_V2.upload(IMAGE_FILE, {
        public_id_prefix,
        asset_folder,
        display_name,
        use_filename_as_display_name,
        folder
      });
      sinon.assert.calledWithMatch(mocked.write, helper.uploadParamMatcher("public_id_prefix", public_id_prefix));
      sinon.assert.calledWithMatch(mocked.write, helper.uploadParamMatcher("asset_folder", asset_folder));
      sinon.assert.calledWithMatch(mocked.write, helper.uploadParamMatcher("display_name", display_name));
      sinon.assert.calledWithMatch(mocked.write, helper.uploadParamMatcher("use_filename_as_display_name", 1));
      sinon.assert.calledWithMatch(mocked.write, helper.uploadParamMatcher("folder", folder));
    });

    it('should not contain asset_folder in public_id', async function () {
      if (!shouldTestFeature(DYNAMIC_FOLDERS)) {
        this.skip();
      }

      const asset_folder = "asset_folder";
      return UPLOADER_V2.upload(IMAGE_FILE, {
        asset_folder
      }).then((result) => {
        expect(result.public_id).to.not.contain('asset_folder')
      });
    });

    it('should not contain asset_folder in public_id when use_asset_folder_as_public_id_prefix is false', async function () {
      if (!shouldTestFeature(DYNAMIC_FOLDERS)) {
        this.skip();
      }

      const asset_folder = "asset_folder";
      return UPLOADER_V2.upload(IMAGE_FILE, {
        asset_folder,
        use_asset_folder_as_public_id_prefix: false
      }).then((result) => {
        expect(result.public_id).to.not.contain('asset_folder')
      });
    });

    it('should contain asset_folder in public_id when use_asset_folder_as_public_id_prefix is true', async function () {
      if (!shouldTestFeature(DYNAMIC_FOLDERS)) {
        this.skip();
      }

      const asset_folder = "asset_folder";
      return UPLOADER_V2.upload(IMAGE_FILE, {
        asset_folder,
        use_asset_folder_as_public_id_prefix: true
      }).then((result) => {
        expect(result.public_id).to.contain('asset_folder')
      });
    });
  });
  it("should support unsigned uploading using presets", async function () {
    this.timeout(TIMEOUT.LONG);

    let preset = await cloudinary.v2.api.create_upload_preset({
      folder: "upload_folder",
      unsigned: true,
      tags: UPLOAD_TAGS
    }).catch((err) => {
      console.log(err);
      throw new Error('create_upload_preset failed');
    });

    let uploadResponse = await cloudinary.v2.uploader.unsigned_upload(IMAGE_FILE, preset.name, {
      tags: UPLOAD_TAGS
    }).catch((err) => {
      console.log(err);
      throw new Error('unsigned_upload failed');
    });

    expect(uploadResponse.public_id).to.match(/^upload_folder\/[a-z0-9]+$/);

    await cloudinary.v2.api.delete_upload_preset(preset.name).catch((err) => {
      console.log(err);
      // we don't fail the test if the delete fails
    });
  });

  it("should reject with promise rejection if disable_promises: false", function (done) {
    const spy = sinon.spy();

    cloudinary.v2.uploader.upload_large(EMPTY_IMAGE, { disable_promises: false }, () => { });

    function unhandledRejection() {
      spy();
    }
    process.on('unhandledRejection', unhandledRejection);

    // Promises are not disabled meaning we should throw unhandledRejection
    setTimeout(() => {
      expect(sinon.assert.called(spy));
      process.removeListener('unhandledRejection', unhandledRejection);
      done();
    }, 2000);
  });

  it("should reject with promise rejection by default", function (done) {
    const spy = sinon.spy();

    cloudinary.v2.uploader.upload_large(EMPTY_IMAGE, () => { });

    function unhandledRejection() {
      spy();
    }
    process.on('unhandledRejection', unhandledRejection);

    // Promises are not disabled meaning we should throw unhandledRejection
    setTimeout(() => {
      expect(sinon.assert.called(spy));
      process.removeListener('unhandledRejection', unhandledRejection);
      done();
    }, 2000);
  });

  it("should reject without promise rejection if disable_promises: true", function (done) {
    const spy = sinon.spy();

    cloudinary.v2.uploader.upload_large(EMPTY_IMAGE, { disable_promises: true }, () => { });

    function unhandledRejection() {
      spy();
    }
    process.on('unhandledRejection', unhandledRejection);

    // Promises are  disabled meaning unhandledRejection was not called
    setTimeout(() => {
      expect(sinon.assert.notCalled(spy));
      process.removeListener('unhandledRejection', unhandledRejection);
      done();
    }, 2000);
  });


  it("should reject promise if error code is returned from the server", function () {
    return cloudinary.v2.uploader.upload(EMPTY_IMAGE, {
      tags: UPLOAD_TAGS
    }).then(function () {
      expect().fail("server should return an error when uploading an empty file");
    }).catch(function (error) {
      expect(error.message.toLowerCase()).to.contain("empty");
    });
  });
  it("should successfully upload with pipes", function (done) {
    this.timeout(TIMEOUT.LONG);
    const upload = cloudinary.v2.uploader.upload_stream({
      tags: UPLOAD_TAGS
    }, function (error, result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      done();
    });
    fs.createReadStream(IMAGE_FILE).pipe(upload);
  });
  it("should successfully upload in chunks with pipes", (done) => {
    this.timeout(TIMEOUT.LONG);
    const upload = cloudinary.v2.uploader.upload_chunked_stream({
      chunk_size: 7000000,
      timeout: TIMEOUT.LONG
    }, (error, result) => {
      assert.strictEqual(error, undefined);
      assert.ok(result.public_id);
      done();
    });
    fs.createReadStream(LARGE_IMAGE_FILE).pipe(upload);
  });
  it("should fail with http.Agent (non secure)", function () {
    this.timeout(TIMEOUT.LONG);
    expect(cloudinary.v2.uploader.upload_stream).withArgs({
      agent: new http.Agent()
    }, function (error, result) { }).to.throwError();
  });
  it("should successfully override https agent", function () {
    var file_reader, upload;
    upload = cloudinary.v2.uploader.upload_stream({
      agent: new https.Agent(),
      tags: UPLOAD_TAGS
    }, function (error, result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
    });
    file_reader = fs.createReadStream(IMAGE_FILE);
    file_reader.pipe(upload);
  });
  context(":responsive_breakpoints", function () {
    context(":create_derived with different transformation settings", function () {
      before(function () {
        helper.setupCache();
      });
      it('should return a responsive_breakpoints in the response', function () {
        return cloudinary.v2.uploader.upload(IMAGE_FILE, {
          responsive_breakpoints: [
            {
              transformation: {
                effect: "sepia"
              },
              format: "jpg",
              bytes_step: 20000,
              create_derived: true,
              min_width: 200,
              max_width: 1000,
              max_images: 20
            },
            {
              transformation: {
                angle: 10
              },
              format: "gif",
              create_derived: true,
              bytes_step: 20000,
              min_width: 200,
              max_width: 1000,
              max_images: 20
            }
          ],
          tags: UPLOAD_TAGS
        }).then(function (result) {
          expect(result).to.have.key('responsive_breakpoints');
          expect(result.responsive_breakpoints).to.have.length(2);
          expect(at(result, "responsive_breakpoints[0].transformation")[0]).to.eql("e_sepia");
          expect(at(result, "responsive_breakpoints[0].breakpoints[0].url")[0]).to.match(/\.jpg$/);
          expect(at(result, "responsive_breakpoints[1].transformation")[0]).to.eql("a_10");
          expect(at(result, "responsive_breakpoints[1].breakpoints[0].url")[0]).to.match(/\.gif$/);
          result.responsive_breakpoints.forEach(function (bp) {
            var cached, format;
            format = path.extname(bp.breakpoints[0].url).slice(1);
            cached = cloudinary.Cache.get(result.public_id, {
              raw_transformation: bp.transformation,
              format
            });
            expect(cached).to.be.ok();
            expect(cached.length).to.be(bp.breakpoints.length);
            bp.breakpoints.forEach(function (o) {
              expect(cached).to.contain(o.width);
            });
          });
        });
      });
    });
  });
  describe("async upload", function () {
    var mocked = helper.mockTest();
    it("should pass `async` value to the server", function () {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        async: true,
        transformation: {
          effect: "sepia"
        }
      });
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("async", 1)));
    });
  });
  it("should pass `accessibility_analysis` option to the server", function () {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.uploader.upload(IMAGE_FILE, { accessibility_analysis: true });
      return sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("accessibility_analysis", 1)));
    });
  });
  describe("explicit", function () {
    var spy, xhr;
    spy = void 0;
    xhr = void 0;
    before(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      spy = sinon.spy(ClientRequest.prototype, 'write');
    });
    after(function () {
      spy.restore();
      xhr.restore();
    });
    describe(":invalidate", function () {
      it("should pass the invalidate value to the server", function () {
        cloudinary.v2.uploader.explicit("cloudinary", {
          type: "twitter_name",
          eager: [
            {
              crop: "scale",
              width: "2.0"
            }
          ],
          invalidate: true,
          quality_analysis: true,
          tags: [TEST_TAG]
        });
        sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('invalidate', 1)));
        sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('quality_analysis', 1)));
      });
    });
    it("should support metadata", function () {
      cloudinary.v2.uploader.explicit("cloudinary", { metadata: METADATA_SAMPLE_DATA });
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher("metadata", METADATA_SAMPLE_DATA_ENCODED)));
    });
    it("should support raw_convert", function () {
      cloudinary.v2.uploader.explicit("cloudinary", {
        raw_convert: "google_speech",
        tags: [TEST_TAG]
      });
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('raw_convert', 'google_speech')));
    });
    it("should pass `accessibility_analysis` to server", function () {
      cloudinary.v2.uploader.explicit("cloudinary", { accessibility_analysis: true });
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('accessibility_analysis', 1)));
    });
  });
  it("should create an image upload tag with required properties", function () {
    var fakeDiv, input_element, tag;
    this.timeout(TIMEOUT.LONG);
    tag = cloudinary.v2.uploader.image_upload_tag("image_id", {
      chunk_size: "1234"
    });
    expect(tag).to.match(/^<input/);
    // Create an HTMLElement from the returned string to validate attributes
    fakeDiv = document.createElement('div');
    fakeDiv.innerHTML = tag;
    input_element = fakeDiv.firstChild;
    expect(input_element.tagName.toLowerCase()).to.be('input');
    expect(input_element.getAttribute("data-url")).to.be.ok();
    expect(input_element.getAttribute("data-form-data")).to.be.ok();
    expect(input_element.getAttribute("data-cloudinary-field")).to.match(/image_id/);
    expect(input_element.getAttribute("data-max-chunk-size")).to.match(/1234/);
    expect(input_element.getAttribute("class")).to.match(/cloudinary-fileupload/);
    expect(input_element.getAttribute("name")).to.be('file');
    expect(input_element.getAttribute("type")).to.be('file');
  });
  describe(":quality_override", function () {
    const mocked = helper.mockTest();
    const qualityValues = ["auto:advanced", "auto:best", "80:420", "none"];
    function testValue(quality) {
      return it("should pass '" + quality + "'", function () {
        cloudinary.v2.uploader.upload(IMAGE_FILE, {
          "quality_override": quality
        });
        sinon.assert.calledWithMatch(mocked.write, helper.uploadParamMatcher("quality_override", quality));
      });
    }
    qualityValues.forEach(value => testValue(value));
    it("should be supported by explicit api", function () {
      cloudinary.v2.uploader.explicit("cloudinary", {
        "quality_override": "auto:best"
      });
      sinon.assert.calledWithMatch(mocked.write, helper.uploadParamMatcher("quality_override", "auto:best"));
    });
  });
  describe("update_metadata", function () {
    it("should update metadata of existing resources", function () {
      const metadata_fields = { metadata_color: "red", metadata_shape: "" };
      const public_ids = ["test_id_1", "test_id_2"];
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        cloudinary.v2.uploader.update_metadata(metadata_fields, public_ids);
        sinon.assert.calledWith(requestSpy, sinon.match({
          method: sinon.match("POST")
        }));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("metadata", "metadata_color=red|metadata_shape=")));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("public_ids[]", public_ids[0])));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("public_ids[]", public_ids[1])));
      });
    });
    it("should support updating metadata with clear_invalid", function () {
      const metadata_fields = { metadata_color: "red" };
      const public_ids = ["test_id_1"];
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        cloudinary.v2.uploader.update_metadata(metadata_fields, public_ids, { clear_invalid: true });
        sinon.assert.calledWith(requestSpy, sinon.match({
          method: sinon.match("POST")
        }));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher("clear_invalid", true)));
      });
    })
  });
  describe("access_control", function () {
    var acl, acl_string, options, requestSpy, writeSpy;
    writeSpy = void 0;
    requestSpy = void 0;
    options = void 0;
    beforeEach(function () {
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      requestSpy = sinon.spy(http, 'request');
      options = {
        public_id: TEST_TAG,
        tags: [...UPLOAD_TAGS, 'access_control_test']
      };
    });
    afterEach(function () {
      requestSpy.restore();
      writeSpy.restore();
    });
    acl = {
      access_type: 'anonymous',
      start: new Date(Date.UTC(2019, 1, 22, 16, 20, 57)),
      end: '2019-03-22 00:00 +0200'
    };
    acl_string = '{"access_type":"anonymous","start":"2019-02-22T16:20:57.000Z","end":"2019-03-22 00:00 +0200"}';
    it("should allow the user to define ACL in the upload parameters", function () {
      options.access_control = [acl];
      return uploadImage(options).then((resource) => {
        var response_acl;
        sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('access_control', `[${acl_string}]`)));
        expect(resource).to.have.key('access_control');
        response_acl = resource.access_control;
        expect(response_acl.length).to.be(1);
        expect(response_acl[0].access_type).to.be("anonymous");
        expect(Date.parse(response_acl[0].start)).to.be(Date.parse(acl.start));
        expect(Date.parse(response_acl[0].end)).to.be(Date.parse(acl.end));
      });
    });
  });
  describe(":ocr", function () {
    const ocrType = "adv_ocr";

    it("should support requesting ocr when uploading", async function () {
      if (!shouldTestAddOn(ADDON_OCR)) {
        this.skip();
      }
      // Upload an image and request ocr details in the response
      const result = await UPLOADER_V2.upload(IMAGE_FILE, { ocr: ocrType, tags: [TEST_TAG] });

      // Ensure result includes properly structured ocr details
      expect(result).not.to.be.empty();
      expect(result.info).to.be.an("object");
      expect(result.info.ocr).to.be.an("object");
      expect(result.info.ocr).to.have.key(ocrType);
      expect(result.info.ocr[ocrType]).to.have.key("status");
      expect(result.info.ocr[ocrType]).to.have.key("data");
    });

    it("should support ocr parameter in explicit", async function () {
      if (!shouldTestAddOn(ADDON_OCR)) {
        this.skip();
      }
      // Upload an image
      const uploadResult = await UPLOADER_V2.upload(IMAGE_FILE, {
        tags: [TEST_TAG]
      });

      // Call explicit on the uploaded image with ocr parameter
      const explicitResult = await UPLOADER_V2.explicit(uploadResult.public_id, {
        ocr: ocrType,
        "tags": [TEST_TAG],
        type: "upload"
      });

      // Ensure result isn't an error
      expect(explicitResult).not.to.be.empty();
      expect(explicitResult.public_id).to.eql(uploadResult.public_id);
    });
  });

  describe("structured metadata fields", function () {
    const metadata_fields = { [METADATA_FIELD_UNIQUE_EXTERNAL_ID]: METADATA_FIELD_VALUE };
    before(function () {
      return cloudinary.v2.api.add_metadata_field({
        external_id: METADATA_FIELD_UNIQUE_EXTERNAL_ID,
        label: METADATA_FIELD_UNIQUE_EXTERNAL_ID,
        type: "string"
      }).finally(function () { });
    });
    after(function () {
      return cloudinary.v2.api.delete_metadata_field(METADATA_FIELD_UNIQUE_EXTERNAL_ID)
        .finally(function () { });
    });
    it("should be set when calling upload with metadata", function () {
      return uploadImage({
        tags: UPLOAD_TAGS,
        metadata: metadata_fields
      }).then((result) => {
        expect(result.metadata[METADATA_FIELD_UNIQUE_EXTERNAL_ID]).to.eql(METADATA_FIELD_VALUE);
      });
    });
    it("should be set when calling explicit with metadata", function () {
      return uploadImage({
        tags: UPLOAD_TAGS
      })
        .then(result => cloudinary.v2.uploader.explicit(result.public_id, {
          type: "upload",
          metadata: metadata_fields
        }))
        .then((result) => {
          expect(result.metadata[METADATA_FIELD_UNIQUE_EXTERNAL_ID]).to.eql(METADATA_FIELD_VALUE);
        });
    });
    it('should allow passing both string and a number for a number smd field', () => {
      const smdNumberField = 'smd_number_field';
      cloudinary.v2.api.add_metadata_field({
        external_id: smdNumberField,
        label: smdNumberField,
        type: 'number'
      }).then(() => {
        return Promise.all([
          uploadImage({
            tags: UPLOAD_TAGS,
            metadata: {
              [smdNumberField]: 123
            }
          }),
          uploadImage({
            tags: UPLOAD_TAGS,
            metadata: {
              [smdNumberField]: '123'
            }
          })
        ]);
      }).then(([firstUpload, secondUpload]) => {
        expect(firstUpload.metadata[smdNumberField]).to.eql(123);
        expect(secondUpload.metadata[smdNumberField]).to.eql(123);
      });
    });
    it("should be updatable with uploader.update_metadata on an existing resource", function () {
      let publicId;
      return uploadImage({
        tags: UPLOAD_TAGS
      })
        .then((result) => {
          publicId = result.public_id;
          return cloudinary.v2.uploader.update_metadata(metadata_fields, [publicId]);
        })
        .then((result) => {
          expect(result).not.to.be.empty();
          expect(result.public_ids.length).to.eql(1);
          expect(result.public_ids).to.contain(publicId);
        });
    });
    it("should be updatable with uploader.update_metadata on multiple existing resources", function () {
      let resource_1;
      let resource_2;

      return Q.allSettled(
        [
          uploadImage({
            tags: UPLOAD_TAGS
          }),
          uploadImage({
            tags: UPLOAD_TAGS
          })
        ]
      ).then(function ([result_1, result_2]) {
        resource_1 = result_1.value;
        resource_2 = result_2.value;
        return cloudinary.v2.uploader.update_metadata(metadata_fields, [resource_1.public_id, resource_2.public_id]);
      })
        .then((result) => {
          expect(result.public_ids.length).to.eql(2);
          expect(result.public_ids).to.contain(resource_1.public_id);
          expect(result.public_ids).to.contain(resource_2.public_id);
        });
    });
  });

  it('should add the eval parameter to an uploaded asset', async () => {
    const result = await UPLOADER_V2.upload(IMAGE_FILE, {
      tags: [TEST_TAG],
      eval: TEST_EVAL_STR
    });

    expect(result).not.to.be.empty();
    expect(result.context).to.be.an("object");
    expect(result.context.custom).to.be.an("object");
    expect(result.context.custom.width).to.eql(TEST_IMG_WIDTH);
    expect(result.quality_analysis).to.be.an("object");
    expect(result.quality_analysis.focus).to.be.an("number");
  });

  describe("sign requests", function () {
    var configBck2 = void 0;
    var writeSpy;
    writeSpy = void 0;
    beforeEach(function () {
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      configBck2 = cloneDeep(cloudinary.config());
      cloudinary.config({
        api_key: "1234",
        api_secret: ""
      });
    });
    afterEach(function () {
      cloudinary.config(configBck2);
      writeSpy.restore();
    });
    it("should allow a signature and timestamp parameter on uploads", function () {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        public_id: 'folder/file',
        version: '1234',
        timestamp: 1569707219,
        signature: 'b77fc0b0dffbf7e74bdad36b615225fb6daff81e'
      });
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('signature', "b77fc0b0dffbf7e74bdad36b615225fb6daff81e")));
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('timestamp', '1569707219')));
    });
  });

  describe(":cinemagraph_analysis", function () {
    it("should support requesting a cinemagraph_analysis when uploading", async function () {
      // Upload an image and request a cinemagraph analysis value in the response
      const result = await UPLOADER_V2.upload(IMAGE_FILE, {
        "cinemagraph_analysis": true,
        "tags": [TEST_TAG]
      });

      // Ensure result includes a cinemagraph_analysis with a cinemagraph_score
      expect(result).not.to.be.empty();
      expect(result.cinemagraph_analysis).to.be.an("object");
      expect(result.cinemagraph_analysis).to.have.property("cinemagraph_score");
    });

    it("should support requesting a cinemagraph_analysis when calling explicit", async function () {
      // Upload an image
      const uploadResult = await UPLOADER_V2.upload(IMAGE_FILE, {
        "tags": [TEST_TAG]
      });

      // Call explicit on the uploaded image and request a cinemagraph analysis value in the response
      const explicitResult = await UPLOADER_V2.explicit(uploadResult.public_id, {
        "cinemagraph_analysis": true,
        "tags": [TEST_TAG],
        type: "upload"
      });

      // Ensure result includes a cinemagraph_analysis with a cinemagraph_score
      expect(explicitResult).not.to.be.empty();
      expect(explicitResult.cinemagraph_analysis).to.be.an("object");
      expect(explicitResult.cinemagraph_analysis).to.have.property("cinemagraph_score");
    });
  });
  describe("sprite", function () {
    const SPRITE_TEST_TAG = `SPRITE_TEST_TAG${TEST_TAG}`

    let uploaded_url_1, uploaded_url_2;

    before(async function () {
      // Upload images to be used by sprite and multi
      const uploads = await Promise.all([
        uploadImage({ tags: [SPRITE_TEST_TAG, ...UPLOAD_TAGS] }),
        uploadImage({ tags: [SPRITE_TEST_TAG, ...UPLOAD_TAGS] })
      ]);
      uploaded_url_1 = uploads[0].url;
      uploaded_url_2 = uploads[1].url;
    });

    it("should generate a sprite by tag", async function () {
      const result = await UPLOADER_V2.generate_sprite(SPRITE_TEST_TAG);
      expect(result).to.beASprite();
      expect(Object.entries(result.image_infos).length).to.eql(2);
    });
    it("should generate a sprite by tag with raw transformation", async function () {
      const result = await UPLOADER_V2.generate_sprite(SPRITE_TEST_TAG, {
        transformation: { raw_transformation: 'w_100' }
      });
      expect(result).to.beASprite();
      expect(result.css_url).to.contain('w_100');
    });
    it("should generate a sprite by tag with transformation params", async function () {
      const result = await UPLOADER_V2.generate_sprite(SPRITE_TEST_TAG, { width: 100, format: 'jpg' });
      expect(result).to.beASprite('jpg');
      expect(result.css_url).to.contain('f_jpg,w_100');
    });
    it("should generate a sprite by URLs array", async function () {
      const result = await UPLOADER_V2.generate_sprite({ 'urls': [uploaded_url_1, uploaded_url_2] });
      expect(result).to.beASprite();
      expect(Object.entries(result.image_infos).length).to.eql(2);
    });
    it("should generate an url to download a sprite by URLs array", function () {
      const url = UPLOADER_V2.download_generated_sprite({ 'urls': [SAMPLE_IMAGE_URL_1, SAMPLE_IMAGE_URL_2] });
      expect(url).to.beASignedDownloadUrl("image/sprite", { urls: [SAMPLE_IMAGE_URL_1, SAMPLE_IMAGE_URL_2] });
    });
    it("should generate an url to download a sprite by tag", async function () {
      const url = UPLOADER_V2.download_generated_sprite(SPRITE_TEST_TAG);
      expect(url).to.beASignedDownloadUrl("image/sprite", { tag: SPRITE_TEST_TAG });
    });
  })
  describe("multi", function () {
    const MULTI_TEST_TAG = `MULTI_TEST_TAG${TEST_TAG}`

    let uploaded_url_1, uploaded_url_2;

    before(async function () {
      // Upload images to be used by sprite and multi
      const uploads = await Promise.all([
        uploadImage({ tags: [MULTI_TEST_TAG, ...UPLOAD_TAGS] }),
        uploadImage({ tags: [MULTI_TEST_TAG, ...UPLOAD_TAGS] })
      ]);
      uploaded_url_1 = uploads[0].url;
      uploaded_url_2 = uploads[1].url;
    });

    it("should create a pdf by tag", async function () {
      const result = await UPLOADER_V2.multi(MULTI_TEST_TAG, { format: "pdf" });
      expect(result).to.beAMulti();
      expect(result.url).to.match(new RegExp(`\.pdf$`));
    });
    it("should create a gif with a transformation by tag", async function () {
      const options = { width: 0.5, crop: "crop" };
      const transformation = cloudinary.utils.generate_transformation_string(Object.assign({}, options));
      const result = await UPLOADER_V2.multi(MULTI_TEST_TAG, { transformation: options });
      expect(result).to.beAMulti();
      expect(result.url).to.match(new RegExp(`/image/multi/${transformation}/.*\.gif$`));
    });
    it("should generate a gif with a transformation by URLs array", async function () {
      const options = { width: 0.5, crop: "crop" };
      const transformation = cloudinary.utils.generate_transformation_string(Object.assign({}, options));
      const result = await UPLOADER_V2.multi({ urls: [uploaded_url_1, uploaded_url_2], transformation: options });
      expect(result).to.beAMulti();
      expect(result.url).to.match(new RegExp(`/image/multi/${transformation}/.*\.gif$`));
    });
    it("should generate a download URL for a gif by URLs array", function () {
      const url = UPLOADER_V2.download_multi({ urls: [SAMPLE_IMAGE_URL_1, SAMPLE_IMAGE_URL_2] });
      expect(url).to.beASignedDownloadUrl("image/multi", { urls: [SAMPLE_IMAGE_URL_1, SAMPLE_IMAGE_URL_2] });
    });
    it("should generate a download URL for a gif by tag", function () {
      const url = UPLOADER_V2.download_multi(MULTI_TEST_TAG);
      expect(url).to.beASignedDownloadUrl("image/multi", { tag: MULTI_TEST_TAG });
    });
  });
  describe("proxy support", function () {
    const mocked = helper.mockTest();
    const proxy = "https://myuser:mypass@example.com"
    it("should support proxy for upload calls", function () {
      cloudinary.config({ api_proxy: proxy });
      UPLOADER_V2.upload(IMAGE_FILE, { "tags": [TEST_TAG] });
      sinon.assert.calledWith(mocked.request, sinon.match(
        arg => arg.agent instanceof https.Agent
      ));
    });
    it("should prioritize custom agent", function () {
      cloudinary.config({ api_proxy: proxy });
      const custom_agent = https.Agent()
      UPLOADER_V2.upload(IMAGE_FILE, { "tags": [TEST_TAG], agent: custom_agent });
      sinon.assert.calledWith(mocked.request, sinon.match(
        arg => arg.agent === custom_agent
      ));
    });
    it("should support api_proxy as options key", function () {
      cloudinary.config({});
      UPLOADER_V2.upload(IMAGE_FILE, { "tags": [TEST_TAG], api_proxy: proxy });
      sinon.assert.calledWith(mocked.request, sinon.match(
        arg => arg.agent instanceof https.Agent
      ));
    });
  })
  describe("signature_version parameter support", function () {
    it("should use signature_version from config when not specified", function () {
      const original_signature_version = cloudinary.config().signature_version;
      cloudinary.config({ signature_version: 1 });
      let upload_result;
      return uploadImage()
        .then(function (result) {
          upload_result = result;
          const public_id = result.public_id;
          const version = result.version;
          const expected_signature_v1 = cloudinary.utils.api_sign_request(
            { public_id: public_id, version: version },
            cloudinary.config().api_secret,
            null,
            1
          );
          expect(result.signature).to.eql(expected_signature_v1);
        })
        .finally(function () {
          cloudinary.config({ signature_version: original_signature_version });
        });
    });
  });
});
