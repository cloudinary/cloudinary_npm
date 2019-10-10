require('dotenv').load({
  silent: true,
});

const https = require('https');
const http = require('http');
const expect = require("expect.js");
const sinon = require('sinon');
const fs = require('fs');
const Q = require('q');
const path = require('path');
const at = require('lodash/at');
const uniq = require('lodash/uniq');
const ClientRequest = require('_http_client').ClientRequest;
const cloudinary = require("../cloudinary");
const helper = require("./spechelper");

const TEST_TAG = helper.TEST_TAG;
const IMAGE_FILE = helper.IMAGE_FILE;
const LARGE_RAW_FILE = helper.LARGE_RAW_FILE;
const LARGE_VIDEO = helper.LARGE_VIDEO;
const EMPTY_IMAGE = helper.EMPTY_IMAGE;
const RAW_FILE = helper.RAW_FILE;
const UPLOAD_TAGS = helper.UPLOAD_TAGS;
const uploadImage = helper.uploadImage;

require('jsdom-global')();

describe("uploader", function () {
  before("Verify Configuration", function () {
    var config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  this.timeout(helper.TIMEOUT_LONG);
  after(function () {
    var config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
    return Q.allSettled([
      !cloudinary.config().keep_test_products ? cloudinary.v2.api.delete_resources_by_tag(helper.TEST_TAG) : void 0,
      !cloudinary.config().keep_test_products ? cloudinary.v2.api.delete_resources_by_tag(helper.TEST_TAG,
        {
          resource_type: "video",
        }) : void 0,
    ]);
  });
  beforeEach(function () {
    cloudinary.config(true);
  });
  it("should successfully upload file", function () {
    this.timeout(helper.TIMEOUT_LONG);
    return uploadImage().then(function (result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version,
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
    });
  });
  it("should successfully upload url", function () {
    return cloudinary.v2.uploader.upload("http://cloudinary.com/images/old_logo.png", {
      tags: UPLOAD_TAGS,
    }).then(function (result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version,
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
    });
  });
  describe("remote urls ", function () {
    var writeSpy;
    writeSpy = void 0;
    beforeEach(function () {
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
    });
    afterEach(function () {
      writeSpy.restore();
    });
    it("should send s3:// URLs to server", function () {
      cloudinary.v2.uploader.upload("s3://test/1.jpg", {
        tags: UPLOAD_TAGS,
      });
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('file', "s3://test/1.jpg")));
    });
    it("should send gs:// URLs to server", function () {
      cloudinary.v2.uploader.upload("gs://test/1.jpg", {
        tags: UPLOAD_TAGS,
      });
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('file', "gs://test/1.jpg")));
    });
    it("should send ftp:// URLs to server", function () {
      cloudinary.v2.uploader.upload("ftp://example.com/1.jpg", {
        tags: UPLOAD_TAGS,
      });
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('file', "ftp://example.com/1.jpg")));
    });
  });

  describe("rename", function () {
    this.timeout(helper.TIMEOUT_LONG);
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
          overwrite: true,
        });
      }).then(function ({ public_id }) {
        return cloudinary.v2.api.resource(public_id);
      }).then(function ({ format }) {
        expect(format).to.eql("png");
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
      it("should should pass the invalidate value in rename to the server", function () {
        cloudinary.v2.uploader.rename("first_id", "second_id", {
          invalidate: true,
        });
        expect(spy.calledWith(sinon.match(function (arg) {
          return arg.toString().match(/name="invalidate"/);
        }))).to.be.ok();
      });
    });
  });
  describe("destroy", function () {
    this.timeout(helper.TIMEOUT_MEDIUM);
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
  });
  it("should support `async` option in explicit api", function () {
    return cloudinary.v2.uploader.explicit("sample", {
      type: "facebook",
      eager: [
        {
          crop: "scale",
          width: "2.0",
        },
      ],
      async: true,
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
          width: "2.0",
        },
      ],
    }).then(function (result) {
      var url = cloudinary.utils.url("sample", {
        type: "upload",
        crop: "scale",
        width: "2.0",
        format: "jpg",
        version: result.version,
      });
      expect(result.eager[0].url).to.eql(url);
    });
  });
  it("should support eager in upload", function () {
    this.timeout(helper.TIMEOUT_SHORT);
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      eager: [
        {
          crop: "scale",
          width: "2.0",
        },
      ],
      tags: UPLOAD_TAGS,
    });
  });
  describe("custom headers", function () {
    it("should support custom headers in object format e.g. {Link: \"1\"}", function () {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        headers: {
          Link: "1",
        },
        tags: UPLOAD_TAGS,
      });
    });
    it("should support custom headers as array of strings e.g. [\"Link: 1\"]", function () {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        headers: ["Link: 1"],
        tags: UPLOAD_TAGS,
      });
    });
  });
  describe("text images", function() {
    it("should successfully generate text image", function () {
      return cloudinary.v2.uploader.text("hello world", {
        tags: UPLOAD_TAGS,
      }).then(function (result) {
        expect(result.width).to.within(50, 70);
        expect(result.height).to.within(5, 15);
      });
    });
    var mocked = helper.mockTest();
    it("should pass text image parameters to server", function() {
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
      tags: UPLOAD_TAGS,
    }, function (error, result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version,
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      done();
    });
    file_reader = fs.createReadStream(IMAGE_FILE, {
      encoding: 'binary',
    });
    file_reader.on('data', function (chunk) {
      stream.write(chunk, 'binary');
    });
    file_reader.on('end', function () {
      stream.end();
    });
  });
  describe("tags", function () {
    this.timeout(helper.TIMEOUT_MEDIUM);
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
        tags: ["tag1", "tag2", TEST_TAG],
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
    this.timeout(helper.TIMEOUT_MEDIUM);
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
          custom2: "testCustom2",
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
        key4: 'val\=ue',
      };
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        context: context,
      }).then(function (result) {
        return cloudinary.v2.api.resource(result.public_id, {
          context: true,
        });
      }).then(function (result) {
        expect(result.context.custom).to.eql(context);
      });
    });
  });
  it("should support timeouts", function () {
    // testing a 1ms timeout, nobody is that fast.
    return cloudinary.v2.uploader.upload("http://cloudinary.com/images/old_logo.png", {
      timeout: 1,
      tags: UPLOAD_TAGS,
    }).then(function () {
      expect().fail();
    }).catch(function ({ error }) {
      expect(error.http_code).to.eql(499);
      expect(error.message).to.eql("Request Timeout");
    });
  });
  it("should upload a file and base public id on the filename if use_filename is set to true", function () {
    this.timeout(helper.TIMEOUT_MEDIUM);
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      use_filename: true,
      tags: UPLOAD_TAGS,
    }).then(function ({ public_id }) {
      expect(public_id).to.match(/logo_[a-zA-Z0-9]{6}/);
    });
  });
  it("should upload a file and set the filename as the public_id if use_filename is set to true and unique_filename is set to false", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      use_filename: true,
      unique_filename: false,
      tags: UPLOAD_TAGS,
    }).then(function (result) {
      expect(result.public_id).to.eql("logo");
    });
  });
  describe("allowed_formats", function () {
    it("should allow whitelisted formats", function () {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        allowed_formats: ["png"],
        tags: UPLOAD_TAGS,
      }).then(function (result) {
        expect(result.format).to.eql("png");
      });
    });
    it("should prevent non whitelisted formats from being uploaded", function () {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        allowed_formats: ["jpg"],
        tags: UPLOAD_TAGS,
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
        tags: UPLOAD_TAGS,
      }).then(function (result) {
        expect(result.format).to.eql("jpg");
      });
    });
  });
  it("should allow sending face coordinates", function () {
    var coordinates, custom_coordinates, different_coordinates, out_coordinates;
    this.timeout(helper.TIMEOUT_LONG);
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
        51, // coordinates are limited to the image dimensions
      ],
    ];
    different_coordinates = [[122, 32, 111, 152]];
    custom_coordinates = [1, 2, 3, 4];
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      face_coordinates: coordinates,
      faces: true,
      tags: UPLOAD_TAGS,
    }).then(function (result) {
      expect(result.faces).to.eql(out_coordinates);
      return cloudinary.v2.uploader.explicit(result.public_id, {
        faces: true,
        face_coordinates: different_coordinates,
        custom_coordinates: custom_coordinates,
        type: "upload",
      });
    }).then(function (result) {
      expect(result.faces).not.to.be(void 0);
      return cloudinary.v2.api.resource(result.public_id, {
        faces: true,
        coordinates: true,
      });
    }).then(function (info) {
      expect(info.faces).to.eql(different_coordinates);
      expect(info.coordinates).to.eql({
        faces: different_coordinates,
        custom: [custom_coordinates],
      });
    });
  });
  it("should allow sending context", function () {
    this.timeout(helper.TIMEOUT_LONG);
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      context: {
        caption: "some caption",
        alt: "alternative",
      },
      tags: UPLOAD_TAGS,
    }).then(function ({ public_id }) {
      return cloudinary.v2.api.resource(public_id, {
        context: true,
      });
    }).then(function ({ context }) {
      expect(context.custom.caption).to.eql("some caption");
      expect(context.custom.alt).to.eql("alternative");
    });
  });
  it("should support requesting manual moderation", function () {
    this.timeout(helper.TIMEOUT_LONG);
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      moderation: "manual",
      tags: UPLOAD_TAGS,
    }).then(function (result) {
      expect(result.moderation[0].status).to.eql("pending");
      expect(result.moderation[0].kind).to.eql("manual");
    });
  });
  it("should support requesting ocr analysis", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      ocr: "adv_ocr",
      tags: UPLOAD_TAGS,
    }).then(function (result) {
      expect(result.info.ocr).to.have.key("adv_ocr");
    });
  });
  it("should support requesting raw conversion", function () {
    return cloudinary.v2.uploader.upload(RAW_FILE, {
      raw_convert: "illegal",
      resource_type: "raw",
      tags: UPLOAD_TAGS,
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
      tags: UPLOAD_TAGS,
    }).then(function () {
      expect().fail();
    }).catch(function (error) {
      expect(error != null).to.be(true);
    });
  });
  it("should support requesting detection", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      detection: "illegal",
      tags: UPLOAD_TAGS,
    }).then(function () {
      expect().fail();
    }).catch(function (error) {
      expect(error).not.to.be(void 0);
      expect(error.message).to.contain("Detection is invalid");
    });
  });
  it("should support requesting background_removal", function () {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      background_removal: "illegal",
      tags: UPLOAD_TAGS,
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
      tags: UPLOAD_TAGS,
    }).then(function (result) {
      expect(result).to.have.key("quality_analysis");
    });
  });
  describe("upload_chunked", function () {
    this.timeout(helper.TIMEOUT_LONG * 10);
    it("should specify chunk size", function (done) {
      return fs.stat(LARGE_RAW_FILE, function (err, stat) {
        cloudinary.v2.uploader.upload_large(LARGE_RAW_FILE, {
          chunk_size: 7000000,
          timeout: helper.TIMEOUT_LONG,
          tags: UPLOAD_TAGS,
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
          tags: UPLOAD_TAGS,
        }, function (error, result) {
          expect(error.message).to.eql("All parts except EOF-chunk must be larger than 5mb");
          done();
        });
      });
    });
    it("should support uploading a small raw file", function (done) {
      fs.stat(RAW_FILE, function (err, stat) {
        cloudinary.v2.uploader.upload_large(RAW_FILE, {
          tags: UPLOAD_TAGS,
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
    it("should support uploading a small image file", function (done) {
      fs.stat(IMAGE_FILE, function (err, stat) {
        return cloudinary.v2.uploader.upload_chunked(IMAGE_FILE, {
          tags: UPLOAD_TAGS,
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
      this.timeout(helper.TIMEOUT_LONG * 10);
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      stat = fs.statSync(LARGE_VIDEO);
      expect(stat).to.be.ok();
      return Q.denodeify(cloudinary.v2.uploader.upload_chunked)(LARGE_VIDEO, {
        chunk_size: 6000000,
        resource_type: 'video',
        timeout: helper.TIMEOUT_LONG * 10,
        tags: UPLOAD_TAGS,
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
        timeout: helper.TIMEOUT_LONG * 10,
        tags: UPLOAD_TAGS,
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
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.uploader.upload_large("http://cloudinary.com/images/old_logo.png", {
        tags: UPLOAD_TAGS,
      }, function (error, result) {
        if (error != null) {
          done(new Error(error.message));
        }
        expect(result.etag).to.eql("7dc60722d4653261648038b579fdb89e");
        done();
      });
    });
  });
  it("should support unsigned uploading using presets", function () {
    this.timeout(helper.TIMEOUT_LONG);
    let presetName;
    return cloudinary.v2.api.create_upload_preset({
      folder: "upload_folder",
      unsigned: true,
      tags: UPLOAD_TAGS,
    }).then(function (preset) {
      presetName = preset.name;
      return cloudinary.v2.uploader.unsigned_upload(IMAGE_FILE, preset.name, {
        tags: UPLOAD_TAGS,
      });
    }).then(function ({ public_id }) {
      expect(public_id).to.match(/^upload_folder\/[a-z0-9]+$/);
    }).finally(function () {
      return cloudinary.v2.api.delete_upload_preset(presetName);
    });
  });
  it("should reject promise if error code is returned from the server", function () {
    return cloudinary.v2.uploader.upload(EMPTY_IMAGE, {
      tags: UPLOAD_TAGS,
    }).then(function () {
      expect().fail("server should return an error when uploading an empty file");
    }).catch(function (error) {
      expect(error.message.toLowerCase()).to.contain("empty");
    });
  });
  it("should successfully upload with pipes", function (done) {
    var file_reader, upload;
    this.timeout(helper.TIMEOUT_LONG);
    upload = cloudinary.v2.uploader.upload_stream({
      tags: UPLOAD_TAGS,
    }, function (error, result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version,
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      done();
    });
    file_reader = fs.createReadStream(IMAGE_FILE);
    file_reader.pipe(upload);
  });
  it("should fail with http.Agent (non secure)", function () {
    this.timeout(helper.TIMEOUT_LONG);
    expect(cloudinary.v2.uploader.upload_stream).withArgs({
      agent: new http.Agent(),
    }, function (error, result) {}).to.throwError();
  });
  it("should successfully override https agent", function () {
    var file_reader, upload;
    upload = cloudinary.v2.uploader.upload_stream({
      agent: new https.Agent(),
      tags: UPLOAD_TAGS,
    }, function (error, result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version,
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
                effect: "sepia",
              },
              format: "jpg",
              bytes_step: 20000,
              create_derived: true,
              min_width: 200,
              max_width: 1000,
              max_images: 20,
            },
            {
              transformation: {
                angle: 10,
              },
              format: "gif",
              create_derived: true,
              bytes_step: 20000,
              min_width: 200,
              max_width: 1000,
              max_images: 20,
            },
          ],
          tags: UPLOAD_TAGS,
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
              format,
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
          effect: "sepia",
        },
      });
      sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("async", 1)));
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
      it("should should pass the invalidate value to the server", function () {
        cloudinary.v2.uploader.explicit("cloudinary", {
          type: "twitter_name",
          eager: [
            {
              crop: "scale",
              width: "2.0",
            },
          ],
          invalidate: true,
          quality_analysis: true,
          tags: [TEST_TAG],
        });
        sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('invalidate', 1)));
        sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('quality_analysis', 1)));
      });
    });
    it("should support raw_convert", function () {
      cloudinary.v2.uploader.explicit("cloudinary", {
        raw_convert: "google_speech",
        tags: [TEST_TAG],
      });
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('raw_convert', 'google_speech')));
    });
  });
  it("should create an image upload tag with required properties", function () {
    var fakeDiv, input_element, tag;
    this.timeout(helper.TIMEOUT_LONG);
    tag = cloudinary.v2.uploader.image_upload_tag("image_id", {
      chunk_size: "1234",
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
  describe("access_control", function () {
    var acl, acl_string, options, requestSpy, writeSpy;
    writeSpy = void 0;
    requestSpy = void 0;
    options = void 0;
    beforeEach(function () {
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      requestSpy = sinon.spy(http, 'request');
      options = {
        public_id: helper.TEST_TAG,
        tags: [...helper.UPLOAD_TAGS, 'access_control_test'],
      };
    });
    afterEach(function () {
      requestSpy.restore();
      writeSpy.restore();
    });
    acl = {
      access_type: 'anonymous',
      start: new Date(Date.UTC(2019, 1, 22, 16, 20, 57)),
      end: '2019-03-22 00:00 +0200',
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

  describe("sign requests", function () {
    var configBck2 = void 0;
    var writeSpy;
    writeSpy = void 0;
    beforeEach(function () {
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      configBck2 = cloudinary.config();
      cloudinary.config({
        api_key: "1234",
        api_secret: "",
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
        signature: 'b77fc0b0dffbf7e74bdad36b615225fb6daff81e',
      });
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('signature', "b77fc0b0dffbf7e74bdad36b615225fb6daff81e")));
      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('timestamp', '1569707219')));
    });
  });
});
