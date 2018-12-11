var API_TEST_UPLOAD_PRESET1, API_TEST_UPLOAD_PRESET2, API_TEST_UPLOAD_PRESET3, API_TEST_UPLOAD_PRESET4, ClientRequest, EXPLICIT_TRANSFORMATION, EXPLICIT_TRANSFORMATION2, EXPLICIT_TRANSFORMATION_NAME, EXPLICIT_TRANSFORMATION_NAME2, IMAGE_FILE, IMAGE_URL, NAMED_TRANSFORMATION, PUBLIC_ID, PUBLIC_ID_1, PUBLIC_ID_2, PUBLIC_ID_3, PUBLIC_ID_4, PUBLIC_ID_5, PUBLIC_ID_6, PUBLIC_ID_PREFIX, Q, SUFFIX, TEST_TAG, UPLOAD_TAGS, cloudinary, expect, find, fs, getAllTags, helper, http, itBehavesLike, keys, matchesProperty, merge, mockTest, sharedExamples, sinon, uploadImage, utils;

require('dotenv').load({
  silent: true
});

helper = require("./spechelper");

expect = require("expect.js");

cloudinary = require("../cloudinary");

utils = cloudinary.utils;

({matchesProperty, merge} = utils);

matchesProperty = require('lodash/matchesProperty');

find = require('lodash/find');

keys = require('lodash/keys');

sinon = require('sinon');

ClientRequest = require('_http_client').ClientRequest;

http = require('http');

Q = require('q');

fs = require('fs');

mockTest = helper.mockTest;

sharedExamples = helper.sharedExamples;

itBehavesLike = helper.itBehavesLike;

TEST_TAG = helper.TEST_TAG;

IMAGE_FILE = helper.IMAGE_FILE;

IMAGE_URL = helper.IMAGE_URL;

UPLOAD_TAGS = helper.UPLOAD_TAGS;

uploadImage = helper.uploadImage;

SUFFIX = helper.SUFFIX;

PUBLIC_ID_PREFIX = "npm_api_test";

PUBLIC_ID = PUBLIC_ID_PREFIX + SUFFIX;

PUBLIC_ID_1 = PUBLIC_ID + "_1";

PUBLIC_ID_2 = PUBLIC_ID + "_2";

PUBLIC_ID_3 = PUBLIC_ID + "_3";

PUBLIC_ID_4 = PUBLIC_ID + "_4";

PUBLIC_ID_5 = PUBLIC_ID + "_5";

PUBLIC_ID_6 = PUBLIC_ID + "_6";

NAMED_TRANSFORMATION = "npm_api_test_transformation" + SUFFIX;

API_TEST_UPLOAD_PRESET1 = "npm_api_test_upload_preset_1_" + SUFFIX;

API_TEST_UPLOAD_PRESET2 = "npm_api_test_upload_preset_2_" + SUFFIX;

API_TEST_UPLOAD_PRESET3 = "npm_api_test_upload_preset_3_" + SUFFIX;

API_TEST_UPLOAD_PRESET4 = "npm_api_test_upload_preset_4_" + SUFFIX;

EXPLICIT_TRANSFORMATION_NAME = `c_scale,l_text:Arial_60:${TEST_TAG},w_100`;

EXPLICIT_TRANSFORMATION_NAME2 = `c_scale,l_text:Arial_60:${TEST_TAG},w_200`;

EXPLICIT_TRANSFORMATION = {
  width: 100,
  crop: "scale",
  overlay: `text:Arial_60:${TEST_TAG}`
};

EXPLICIT_TRANSFORMATION2 = {
  width: 200,
  crop: "scale",
  overlay: `text:Arial_60:${TEST_TAG}`
};

sharedExamples("a list with a cursor", function(testFunc, ...args) {
  specify(":max_results", function() {
    return helper.mockPromise(function(xhr, writeSpy, requestSpy) {
      testFunc(...args, {
        max_results: 10
      });
      if (writeSpy.called) {
        return sinon.assert.calledWith(writeSpy, sinon.match(/max_results=10/));
      } else {
        return sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(/max_results=10/)
        }));
      }
    });
  });
  return specify(":next_cursor", function() {
    return helper.mockPromise(function(xhr, writeSpy, requestSpy) {
      testFunc(...args, {
        next_cursor: 23452342
      });
      if (writeSpy.called) {
        return sinon.assert.calledWith(writeSpy, sinon.match(/next_cursor=23452342/));
      } else {
        return sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(/next_cursor=23452342/)
        }));
      }
    });
  });
});

sharedExamples("accepts next_cursor", function(testFunc, ...args) {
  var request, requestSpy, requestStub, writeSpy, xhr;
  xhr = request = requestStub = requestSpy = writeSpy = void 0;
  before(function() {
    xhr = sinon.useFakeXMLHttpRequest();
    writeSpy = sinon.spy(ClientRequest.prototype, 'write');
    return requestSpy = sinon.spy(http, 'request');
  });
  after(function() {
    writeSpy.restore();
    requestSpy.restore();
    return xhr.restore();
  });
  return specify(":next_cursor", function() {
    testFunc(...args, {
      next_cursor: 23452342
    });
    if (writeSpy.called) {
      return sinon.assert.calledWith(writeSpy, sinon.match(/next_cursor=23452342/));
    } else {
      return sinon.assert.calledWith(requestSpy, sinon.match({
        query: sinon.match(/next_cursor=23452342/)
      }));
    }
  });
});

getAllTags = function(arr) {
  return arr.resources.map(function(e) {
    return e.tags;
  }).reduce((function(a, b) {
    return a.concat(b);
  }), []);
};

describe("api", function() {
  var contextKey, find_by_attr;
  before("Verify Configuration", function() {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      return expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  before(function() {
    this.timeout(helper.TIMEOUT_LONG);
    return Q.allSettled([
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: PUBLIC_ID,
        tags: UPLOAD_TAGS,
        context: "key=value",
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: PUBLIC_ID_2,
        tags: UPLOAD_TAGS,
        context: "key=value",
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: PUBLIC_ID_5,
        tags: UPLOAD_TAGS,
        context: `${contextKey}=test`,
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: PUBLIC_ID_6,
        tags: UPLOAD_TAGS,
        context: `${contextKey}=alt-test`,
        eager: [EXPLICIT_TRANSFORMATION]
      })
    ]).finally(function() {});
  });
  after(function() {
    var config;
    this.timeout(helper.TIMEOUT_LONG);
    if (cloudinary.config().keep_test_products) {
      return Promise.resolve();
    } else {
      config = cloudinary.config();
      if (!(config.api_key && config.api_secret)) {
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
      }
      return Q.allSettled([cloudinary.v2.api.delete_resources_by_tag(TEST_TAG), cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET1), cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET2), cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET3), cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET4)]).finally(function() {});
    }
  });
  find_by_attr = function(elements, attr, value) {
    var element, j, len;
    for (j = 0, len = elements.length; j < len; j++) {
      element = elements[j];
      if (element[attr] === value) {
        return element;
      }
    }
    return void 0;
  };
  contextKey = `test-key${helper.SUFFIX}`;
  describe("resources", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources);
    it("should allow listing resource_types", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.resource_types().then(function(result) {
        return expect(result.resource_types).to.contain("image");
      });
    });
    it("should allow listing resources", function() {
      var publicId;
      this.timeout(helper.TIMEOUT_MEDIUM);
      publicId = '';
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: UPLOAD_TAGS
      }).then(function(result) {
        publicId = result.public_id;
        return cloudinary.v2.api.resources();
      }).then(function(result) {
        var resource;
        resource = find_by_attr(result.resources, "public_id", publicId);
        expect(resource).not.to.eql(void 0);
        return expect(resource.type).to.eql("upload");
      });
    });
    it("should allow listing resources by type", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: UPLOAD_TAGS
      }).then(function(result) {
        var public_id;
        public_id = result.public_id;
        return cloudinary.v2.api.resources({
          type: "upload"
        }).then(function(result) {
          return [public_id, result];
        });
      }).then(function([public_id, result]) {
        var resource;
        resource = find_by_attr(result.resources, "public_id", public_id);
        expect(resource).to.be.an(Object);
        return expect(resource.type).to.eql("upload");
      });
    });
    it("should allow listing resources by prefix", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.resources({
        type: "upload",
        prefix: PUBLIC_ID_PREFIX,
        max_results: 500
      }).then(function(result) {
        var public_ids, resource;
        public_ids = (function() {
          var j, len, ref, results1;
          ref = result.resources;
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            resource = ref[j];
            results1.push(resource.public_id);
          }
          return results1;
        })();
        expect(public_ids).to.contain(PUBLIC_ID);
        return expect(public_ids).to.contain(PUBLIC_ID_2);
      });
    });
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources_by_tag, TEST_TAG);
    it("should allow listing resources by tag", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.resources_by_tag(TEST_TAG, {
        context: true,
        tags: true,
        max_results: 500
      }).then(function(result) {
        expect(result.resources.map(function(e) {
          return e.public_id;
        })).to.contain(PUBLIC_ID).and.contain(PUBLIC_ID_2);
        expect(getAllTags(result)).to.contain(TEST_TAG);
        return expect(result.resources.map(function(e) {
          if (e.context != null) {
            return e.context.custom.key;
          } else {
            return null;
          }
        })).to.contain("value");
      });
    });
    it("should allow listing resources by context only", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.resources_by_context(contextKey, null).then(function(result) {
        return expect(result.resources).to.have.length(2);
      });
    });
    it("should allow listing resources by context key and value", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.resources_by_context(contextKey, "test").then(function(result) {
        return expect(result.resources).to.have.length(1);
      });
    });
    it("should allow listing resources by public ids", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.resources_by_ids([PUBLIC_ID, PUBLIC_ID_2], {
        context: true,
        tags: true
      }).then(function(result) {
        var resource;
        resource = find_by_attr(result.resources, "public_id", PUBLIC_ID);
        expect(result.resources.map(function(e) {
          return e.public_id;
        }).sort()).to.eql([PUBLIC_ID, PUBLIC_ID_2]);
        expect(getAllTags(result)).to.contain(TEST_TAG);
        return expect(result.resources.map(function(e) {
          return e.context.custom.key;
        })).to.contain("value");
      });
    });
    it("should allow listing resources specifying direction", function() {
      this.timeout(helper.TIMEOUT_LONG);
      return cloudinary.v2.api.resources_by_tag(TEST_TAG, {
        type: "upload",
        max_results: 500,
        direction: "asc"
      }).then((result) => {
        var asc, resource;
        asc = (function() {
          var j, len, ref, results1;
          ref = result.resources;
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            resource = ref[j];
            results1.push(resource.public_id);
          }
          return results1;
        })();
        return cloudinary.v2.api.resources_by_tag(TEST_TAG, {
          type: "upload",
          max_results: 500,
          direction: "desc"
        }).then(function(result) {
          return [asc, result];
        });
      }).then(function([asc, result]) {
        var desc, resource;
        desc = (function() {
          var j, len, ref, results1;
          ref = result.resources;
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            resource = ref[j];
            results1.push(resource.public_id);
          }
          return results1;
        })();
        return expect(asc.reverse()).to.eql(desc);
      });
    });
    it("should allow listing resources by start_at", function() {
      var requestSpy, start_at, writeSpy, xhr;
      xhr = sinon.useFakeXMLHttpRequest();
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      requestSpy = sinon.spy(http, 'request');
      start_at = new Date().toString();
      return cloudinary.v2.api.resources({
        type: "upload",
        start_at: start_at,
        direction: "asc"
      }).then(function() {
        var formatted;
        if (writeSpy.called) {
          return sinon.assert.calledWith(writeSpy, sinon.match(/stazdfasrt_at=10/));
        } else {
          return formatted = encodeURIComponent(start_at.slice(0, start_at.search("\\("))); // cut the date string before the '('
        }
      }).finally(function() {
        writeSpy.restore();
        requestSpy.restore();
        return xhr.restore();
      });
    });
    return it("should allow get resource metadata", function() {
      this.timeout(helper.TIMEOUT_LONG);
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: UPLOAD_TAGS,
        eager: [EXPLICIT_TRANSFORMATION]
      }).then(function(result) {
        return cloudinary.v2.api.resource(result.public_id).then(function(resource) {
          return [result.public_id, resource];
        });
      }).then(function([public_id, resource]) {
        expect(resource).not.to.eql(void 0);
        expect(resource.public_id).to.eql(public_id);
        expect(resource.bytes).to.eql(3381);
        return expect(resource.derived).to.have.length(1);
      });
    });
  });
  describe("delete", function() {
    it("should allow deleting derived resource", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: UPLOAD_TAGS,
        eager: [
          {
            width: 101,
            crop: "scale"
          }
        ]
      }).then(function(r) {
        return cloudinary.v2.api.resource(r.public_id).then(function(resource) {
          return [r.public_id, resource];
        });
      }).then(function([public_id, resource]) {
        var derived_resource_id;
        expect(resource).not.to.eql(void 0);
        expect(resource.bytes).to.eql(3381);
        expect(resource.derived).to.have.length(1);
        derived_resource_id = resource.derived[0].id;
        return cloudinary.v2.api.delete_derived_resources(derived_resource_id).then(function() {
          return public_id;
        });
      }).then(function(public_id) {
        return cloudinary.v2.api.resource(public_id);
      }).then(function(resource) {
        expect(resource).not.to.eql(void 0);
        return expect(resource.derived).to.have.length(0);
      });
    });
    it("should allow deleting derived resources by transformations", function() {
      this.timeout(helper.TIMEOUT_LONG);
      return Q.all([
        cloudinary.v2.uploader.upload(IMAGE_FILE,
        {
          public_id: PUBLIC_ID_1,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION]
        }),
        cloudinary.v2.uploader.upload(IMAGE_FILE,
        {
          public_id: PUBLIC_ID_2,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION2]
        }),
        cloudinary.v2.uploader.upload(IMAGE_FILE,
        {
          public_id: PUBLIC_ID_3,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION,
        EXPLICIT_TRANSFORMATION2]
        })
      ]).then(function(results) {
        return cloudinary.v2.api.delete_derived_by_transformation([PUBLIC_ID_1, PUBLIC_ID_3], [EXPLICIT_TRANSFORMATION, EXPLICIT_TRANSFORMATION2]);
      }).then(function(result) {
        return cloudinary.v2.api.resource(PUBLIC_ID_1);
      }).then(function(result) {
        expect(result.derived.length).to.eql(0);
        return cloudinary.v2.api.resource(PUBLIC_ID_2);
      }).then(function(result) {
        expect(find(result.derived, function(d) {
          return d.transformation === EXPLICIT_TRANSFORMATION_NAME2;
        })).to.not.be.empty();
        return cloudinary.v2.api.resource(PUBLIC_ID_3);
      }).then(function(result) {
        return expect(result.derived.length).to.eql(0);
      });
    });
    it("should allow deleting resources", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        public_id: PUBLIC_ID_3,
        tags: UPLOAD_TAGS
      }).then(function(r) {
        return cloudinary.v2.api.resource(PUBLIC_ID_3);
      }).then(function(resource) {
        expect(resource).not.to.eql(void 0);
        return cloudinary.v2.api.delete_resources(["apit_test", PUBLIC_ID_2, PUBLIC_ID_3]);
      }).then(function(result) {
        return cloudinary.v2.api.resource(PUBLIC_ID_3);
      }).then(function() {
        return expect().fail();
      }).catch(function({error}) {
        expect(error).to.be.an(Object);
        return expect(error.http_code).to.eql(404);
      });
    });
    describe("delete_resources_by_prefix", function() {
      itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, "prefix_foobar");
      return it("should allow deleting resources by prefix", function() {
        this.timeout(helper.TIMEOUT_MEDIUM);
        return cloudinary.v2.uploader.upload(IMAGE_FILE, {
          public_id: "api_test_by_prefix",
          tags: UPLOAD_TAGS
        }).then(function(r) {
          return cloudinary.v2.api.resource("api_test_by_prefix");
        }).then(function(resource) {
          expect(resource).not.to.eql(void 0);
          return cloudinary.v2.api.delete_resources_by_prefix("api_test_by");
        }).then(function() {
          return cloudinary.v2.api.resource("api_test_by_prefix");
        }).then(function() {
          return expect().fail();
        }).catch(function({error}) {
          expect(error).to.be.an(Object);
          return expect(error.http_code).to.eql(404);
        });
      });
    });
    return describe("delete_resources_by_tag", function() {
      var deleteTestTag;
      deleteTestTag = TEST_TAG + "_delete";
      itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, deleteTestTag);
      return it("should allow deleting resources by tags", function() {
        this.timeout(helper.TIMEOUT_MEDIUM);
        return cloudinary.v2.uploader.upload(IMAGE_FILE, {
          public_id: PUBLIC_ID_4,
          tags: UPLOAD_TAGS.concat([deleteTestTag])
        }).then(function(result) {
          return cloudinary.v2.api.resource(PUBLIC_ID_4);
        }).then(function(resource) {
          expect(resource).to.be.ok();
          return cloudinary.v2.api.delete_resources_by_tag(deleteTestTag);
        }).then(function(result) {
          return cloudinary.v2.api.resource(PUBLIC_ID_4);
        }).then(function() {
          return expect().fail();
        }).catch(function({error}) {
          expect(error).to.be.an(Object);
          return expect(error.http_code).to.eql(404);
        });
      });
    });
  });
  describe("tags", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.tags);
    it("should allow listing tags", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.tags({
        max_results: 500
      }).then(function(result) {
        return expect(result.tags).not.to.be.empty();
      });
    });
    it("should allow listing tag by prefix ", () => {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.tags({
        prefix: TEST_TAG.slice(0, -1),
        max_results: 500
      }).then((result) => {
        return expect(result.tags).to.contain(TEST_TAG);
      });
    });
    return it("should allow listing tag by prefix if not found", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.tags({
        prefix: "api_test_no_such_tag"
      }).then(function(result) {
        return expect(result.tags).to.be.empty();
      });
    });
  });
  describe("transformations", function() {
    var transformationName;
    itBehavesLike("a list with a cursor", cloudinary.v2.api.transformation, EXPLICIT_TRANSFORMATION_NAME);
    itBehavesLike("a list with a cursor", cloudinary.v2.api.transformations);
    transformationName = "api_test_transformation3" + SUFFIX;
    after(function() {
      return Q.allSettled([cloudinary.v2.api.delete_transformation(transformationName), cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION)]).finally(function() {});
    });
    it("should allow listing transformations", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.transformations().then(function(result) {
        expect(result).to.have.key("transformations");
        expect(result.transformations).not.to.be.empty();
        return expect(result.transformations[0]).to.have.key('used');
      });
    });
    it("should allow getting transformation metadata", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME).then(function(transformation) {
        expect(transformation).not.to.eql(void 0);
        return expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION]);
      });
    });
    it("should allow getting transformation metadata by info", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION).then(function(transformation) {
        expect(transformation).not.to.eql(void 0);
        return expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION]);
      });
    });
    it("should allow updating transformation allowed_for_strict", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.update_transformation(EXPLICIT_TRANSFORMATION_NAME, {
        allowed_for_strict: true
      }).then(function() {
        return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME);
      }).then(function(transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.allowed_for_strict).to.be.ok();
        return cloudinary.v2.api.update_transformation(EXPLICIT_TRANSFORMATION_NAME, {
          allowed_for_strict: false
        });
      }).then(function() {
        return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME);
      }).then(function(transformation) {
        expect(transformation).not.to.eql(void 0);
        return expect(transformation.allowed_for_strict).not.to.be.ok();
      });
    });
    it("should allow creating named transformation", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.create_transformation(NAMED_TRANSFORMATION, {
        crop: "scale",
        width: 102
      }).then(function() {
        return cloudinary.v2.api.transformation(NAMED_TRANSFORMATION);
      }).then(function(transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.allowed_for_strict).to.be.ok();
        expect(transformation.info).to.eql([
          {
            crop: "scale",
            width: 102
          }
        ]);
        return expect(transformation.used).not.to.be.ok();
      });
    });
    it("should allow listing of named transformations", function() {
      return helper.mockPromise(function(xhr, write, request) {
        cloudinary.v2.api.transformations({
          named: true
        });
        return sinon.assert.calledWith(request, sinon.match({
          query: sinon.match('named=true')
        }, "named=true"));
      });
    });
    it("should allow unsafe update of named transformation", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.create_transformation(transformationName, {
        crop: "scale",
        width: 102
      }).then(function(result) {
        return cloudinary.v2.api.update_transformation(transformationName, {
          unsafe_update: {
            crop: "scale",
            width: 103
          }
        });
      }).then(function(result) {
        return cloudinary.v2.api.transformation(transformationName);
      }).then(function(transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.info).to.eql([
          {
            crop: "scale",
            width: 103
          }
        ]);
        return expect(transformation.used).not.to.be.ok();
      });
    });
    it("should allow deleting named transformation", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION).then(function() {
        return cloudinary.v2.api.transformation(NAMED_TRANSFORMATION);
      }).then(function() {
        return expect().fail();
      }).catch(function({error}) {
        return expect(error.http_code).to.eql(404);
      });
    });
    return it("should allow deleting implicit transformation", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME).then(function(transformation) {
        expect(transformation).to.be.an(Object);
        return cloudinary.v2.api.delete_transformation(EXPLICIT_TRANSFORMATION_NAME);
      }).then(function() {
        return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME);
      }).then(function(transformation) {
        return expect().fail();
      }).catch(function({error}) {
        return expect(error.http_code).to.eql(404);
      });
    });
  });
  describe("upload_preset", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.upload_presets);
    it("should allow creating and listing upload_presets", function() {
      var presetNames;
      this.timeout(helper.TIMEOUT_MEDIUM);
      presetNames = [API_TEST_UPLOAD_PRESET3, API_TEST_UPLOAD_PRESET2, API_TEST_UPLOAD_PRESET1];
      return Promise.all(presetNames.map(function(name) {
        return cloudinary.v2.api.create_upload_preset({
          name: name,
          folder: "folder"
        });
      })).then(function() {
        return cloudinary.v2.api.upload_presets();
      }).then(function({presets}) {
        var presetList;
        presetList = presets.map(function(p) {
          return p.name;
        });
        return presetNames.forEach(function(p) {
          return expect(presetList).to.contain(p);
        });
      }).then(function() {
        return Promise.all(presetNames.map(function(name) {
          return cloudinary.v2.api.delete_upload_preset(name);
        }));
      });
    });
    it("should allow getting a single upload_preset", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.create_upload_preset({
        unsigned: true,
        folder: "folder",
        transformation: EXPLICIT_TRANSFORMATION,
        tags: ["a", "b", "c"],
        context: {
          a: "b",
          c: "d"
        }
      }).then(function(newPreset) {
        return cloudinary.v2.api.upload_preset(newPreset.name).then(function(preset) {
          return [newPreset.name, preset];
        });
      }).then(function([name, preset]) {
        expect(preset.name).to.eql(name);
        expect(preset.unsigned).to.eql(true);
        expect(preset.settings.folder).to.eql("folder");
        expect(preset.settings.transformation).to.eql([EXPLICIT_TRANSFORMATION]);
        expect(preset.settings.context).to.eql({
          a: "b",
          c: "d"
        });
        expect(preset.settings.tags).to.eql(["a", "b", "c"]);
        return cloudinary.v2.api.delete_upload_preset(name);
      });
    });
    it("should allow deleting upload_presets", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return cloudinary.v2.api.create_upload_preset({
        name: API_TEST_UPLOAD_PRESET4,
        folder: "folder"
      }).then(function() {
        return cloudinary.v2.api.upload_preset(API_TEST_UPLOAD_PRESET4);
      }).then(function() {
        return cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET4);
      }).then(function() {
        return cloudinary.v2.api.upload_preset(API_TEST_UPLOAD_PRESET4);
      }).then(function() {
        return expect().fail();
      }).catch(function({error}) {
        return expect(error.message).to.contain("Can't find");
      });
    });
    return it("should allow updating upload_presets", function() {
      var name;
      this.timeout(helper.TIMEOUT_MEDIUM);
      name = '';
      return cloudinary.v2.api.create_upload_preset({
        folder: "folder"
      }).then(function(preset) {
        name = preset.name;
        return cloudinary.v2.api.upload_preset(name);
      }).then(function(preset) {
        return cloudinary.v2.api.update_upload_preset(name, merge(preset.settings, {
          colors: true,
          unsigned: true,
          disallow_public_id: true
        }));
      }).then(function() {
        return cloudinary.v2.api.upload_preset(name);
      }).then(function(preset) {
        expect(preset.name).to.eql(name);
        expect(preset.unsigned).to.eql(true);
        expect(preset.settings).to.eql({
          folder: "folder",
          colors: true,
          disallow_public_id: true
        });
        return cloudinary.v2.api.delete_upload_preset(name);
      });
    });
  });
  it("should support the usage API call", function() {
    this.timeout(helper.TIMEOUT_MEDIUM);
    return cloudinary.v2.api.usage().then(function(usage) {
      return expect(usage.last_update).not.to.eql(null);
    });
  });
  describe("delete_all_resources", function() {
    itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_all_resources);
    return describe("keep_original: yes", function() {
      return it("should allow deleting all derived resources", function() {
        return helper.mockPromise(function(xhr, write, request) {
          var options;
          options = {
            keep_original: true
          };
          cloudinary.v2.api.delete_all_resources(options);
          sinon.assert.calledWith(request, sinon.match(function(arg) {
            return new RegExp("/resources/image/upload$").test(arg.pathname);
          }, "/resources/image/upload"));
          sinon.assert.calledWith(request, sinon.match(function(arg) {
            return "DELETE" === arg.method;
          }, "DELETE"));
          sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('keep_original', 'true'), "keep_original=true"));
          return sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('all', 'true'), "all=true"));
        });
      });
    });
  });
  describe("update", function() {
    describe("notification url", function() {
      var request, requestSpy, requestStub, writeSpy, xhr;
      xhr = request = requestStub = requestSpy = writeSpy = void 0;
      before(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        return writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      });
      after(function() {
        writeSpy.restore();
        return xhr.restore();
      });
      return it("should support changing moderation status with notification-url", function() {
        cloudinary.v2.api.update("sample", {
          moderation_status: "approved",
          notification_url: "http://example.com"
        });
        if (writeSpy.called) {
          sinon.assert.calledWith(writeSpy, sinon.match(/notification_url=http%3A%2F%2Fexample.com/));
          return sinon.assert.calledWith(writeSpy, sinon.match(/moderation_status=approved/));
        }
      });
    });
    it("should support setting manual moderation status", function() {
      this.timeout(helper.TIMEOUT_LONG);
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        moderation: "manual"
      }).then(function(upload_result) {
        return cloudinary.v2.api.update(upload_result.public_id, {
          moderation_status: "approved"
        });
      }).then(function(api_result) {
        return expect(api_result.moderation[0].status).to.eql("approved");
      });
    });
    it("should support requesting ocr info", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return uploadImage().then(function(upload_result) {
        return cloudinary.v2.api.update(upload_result.public_id, {
          ocr: "illegal"
        });
      }).then(function() {
        return expect().fail();
      }).catch(function({error}) {
        return expect(error.message).to.contain("Illegal value");
      });
    });
    it("should support requesting raw conversion", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return uploadImage().then(function(upload_result) {
        return cloudinary.v2.api.update(upload_result.public_id, {
          raw_convert: "illegal"
        });
      }).then(function() {
        return expect().fail();
      }).catch(function({error}) {
        return expect(error.message).to.contain("Illegal value");
      });
    });
    it("should support requesting categorization", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return uploadImage().then(function(upload_result) {
        return cloudinary.v2.api.update(upload_result.public_id, {
          categorization: "illegal"
        });
      }).then(function() {
        return expect().fail();
      }).catch(function({error}) {
        return expect(error.message).to.contain("Illegal value");
      });
    });
    it("should support requesting detection", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return uploadImage().then(function(upload_result) {
        return cloudinary.v2.api.update(upload_result.public_id, {
          detection: "illegal"
        });
      }).then(function() {
        return expect().fail();
      }).catch(function({error}) {
        return expect(error.message).to.contain("Illegal value");
      });
    });
    it("should support requesting background_removal", function() {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return uploadImage().then(function(upload_result) {
        return cloudinary.v2.api.update(upload_result.public_id, {
          background_removal: "illegal"
        });
      }).then(function() {
        return expect().fail();
      }).catch(function({error}) {
        return expect(error.message).to.contain("Illegal value");
      });
    });
    return describe("access_control", function() {
      var acl, acl_string, options;
      acl = {
        access_type: 'anonymous',
        start: new Date(Date.UTC(2019, 1, 22, 16, 20, 57)),
        end: '2019-03-22 00:00 +0200'
      };
      acl_string = '{"access_type":"anonymous","start":"2019-02-22T16:20:57.000Z","end":"2019-03-22 00:00 +0200"}';
      options = {
        public_id: helper.TEST_TAG,
        tags: [...helper.UPLOAD_TAGS, 'access_control_test']
      };
      return it("should allow the user to define ACL in the update parameters2", function() {
        return helper.mockPromise(function(xhr, writeSpy, requestSpy) {
          options.access_control = [acl];
          cloudinary.v2.api.update("id", options);
          return sinon.assert.calledWith(writeSpy, sinon.match(function(arg) {
            return helper.apiParamMatcher('access_control', `[${acl_string}]`)(arg);
          }));
        });
      });
    });
  });
  it("should support listing by moderation kind and value", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources_by_moderation, "manual", "approved");
    return helper.mockPromise(function(xhr, write, request) {
      return ["approved", "pending", "rejected"].forEach(function(stat) {
        var status, status2;
        status = stat;
        status2 = status;
        request.resetHistory();
        cloudinary.v2.api.resources_by_moderation("manual", status2, {
          moderations: true
        });
        sinon.assert.calledWith(request, sinon.match(function(arg) {
          return new RegExp(`/resources/image/moderations/manual/${status2}$`).test(arg != null ? arg.pathname : void 0);
        }, `/resources/image/moderations/manual/${status}`));
        return sinon.assert.calledWith(request, sinon.match(function(arg) {
          return "moderations=true" === (arg != null ? arg.query : void 0);
        }, "moderations=true"));
      });
    });
  });
  // For this test to work, "Auto-create folders" should be enabled in the Upload Settings.
  // Replace `it` with  `it.skip` below if you want to disable it.
  it("should list folders in cloudinary", function() {
    this.timeout(helper.TIMEOUT_LONG);
    return Q.all([
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder1/item',
        tags: UPLOAD_TAGS
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder2/item',
        tags: UPLOAD_TAGS
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder2/item',
        tags: UPLOAD_TAGS
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder1/test_subfolder1/item',
        tags: UPLOAD_TAGS
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder1/test_subfolder2/item',
        tags: UPLOAD_TAGS
      })
    ]).then(function(results) {
      return Q.all([cloudinary.v2.api.root_folders(), cloudinary.v2.api.sub_folders('test_folder1')]);
    }).then(function(results) {
      var folder, root, root_folders, sub_1;
      root = results[0];
      root_folders = (function() {
        var j, len, ref, results1;
        ref = root.folders;
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          folder = ref[j];
          results1.push(folder.name);
        }
        return results1;
      })();
      sub_1 = results[1];
      expect(root_folders).to.contain('test_folder1');
      expect(root_folders).to.contain('test_folder2');
      expect(sub_1.folders[0].path).to.eql('test_folder1/test_subfolder1');
      expect(sub_1.folders[1].path).to.eql('test_folder1/test_subfolder2');
      return cloudinary.v2.api.sub_folders('test_folder_not_exists');
    }).then(function(result) {
      console.log('error test_folder_not_exists should not pass to "then" handler but "catch"');
      return expect().fail('error test_folder_not_exists should not pass to "then" handler but "catch"');
    }).catch(function({error}) {
      return expect(error.message).to.eql('Can\'t find folder with path test_folder_not_exists');
    });
  });
  describe('.restore', function() {
    this.timeout(helper.TIMEOUT_MEDIUM);
    before(function() {
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        public_id: "api_test_restore",
        backup: true,
        tags: UPLOAD_TAGS
      }).then(function(result) {
        return cloudinary.v2.api.resource("api_test_restore");
      }).then(function(resource) {
        expect(resource).not.to.be(null);
        expect(resource["bytes"]).to.eql(3381);
        return cloudinary.v2.api.delete_resources("api_test_restore");
      }).then(function(resource) {
        return cloudinary.v2.api.resource("api_test_restore");
      }).then(function(resource) {
        expect(resource).not.to.be(null);
        expect(resource["bytes"]).to.eql(0);
        return expect(resource["placeholder"]).to.eql(true);
      });
    });
    return it('should restore a deleted resource', function() {
      return cloudinary.v2.api.restore("api_test_restore").then(function(response) {
        var info;
        info = response["api_test_restore"];
        expect(info).not.to.be(null);
        expect(info["bytes"]).to.eql(3381);
        return cloudinary.v2.api.resource("api_test_restore");
      }).then(function(resource) {
        expect(resource).not.to.be(null);
        return expect(resource["bytes"]).to.eql(3381);
      });
    });
  });
  describe('mapping', function() {
    var deleteMapping, mapping;
    mapping = `api_test_upload_mapping${Math.floor(Math.random() * 100000)}`;
    deleteMapping = false;
    after(function() {
      if (deleteMapping) {
        return cloudinary.v2.api.delete_upload_mapping(mapping);
      } else {
        return Promise.resolve();
      }
    });
    itBehavesLike("a list with a cursor", cloudinary.v2.api.upload_mappings);
    return it('should create mapping', function() {
      this.timeout(helper.TIMEOUT_LONG);
      return cloudinary.v2.api.create_upload_mapping(mapping, {
        template: "http://cloudinary.com",
        tags: UPLOAD_TAGS
      }).then(function(result) {
        return deleteMapping = cloudinary.v2.api.upload_mapping(mapping);
      }).then(function(result) {
        expect(result['template']).to.eql("http://cloudinary.com");
        return cloudinary.v2.api.update_upload_mapping(mapping, {
          template: "http://res.cloudinary.com"
        });
      }).then(function(result) {
        return cloudinary.v2.api.upload_mapping(mapping);
      }).then(function(result) {
        expect(result["template"]).to.eql("http://res.cloudinary.com");
        return cloudinary.v2.api.upload_mappings();
      }).then(function(result) {
        expect(find(result["mappings"], {
          folder: mapping,
          template: "http://res.cloudinary.com"
        })).to.be.ok();
        return cloudinary.v2.api.delete_upload_mapping(mapping);
      }).then(function(result) {
        deleteMapping = false;
        return cloudinary.v2.api.upload_mappings();
      }).then(function(result) {
        return expect(find(result["mappings"], matchesProperty('folder', mapping))).not.to.be.ok();
      });
    });
  });
  describe("publish", function() {
    var i, idsToDelete, publishTestId, publishTestTag;
    this.timeout(helper.TIMEOUT_LONG);
    i = 0;
    publishTestId = "";
    publishTestTag = "";
    idsToDelete = [];
    beforeEach(function() {
      publishTestTag = TEST_TAG + i++;
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        type: "authenticated",
        tags: UPLOAD_TAGS.concat([publishTestTag])
      }).then(function(result) {
        publishTestId = result.public_id;
        return idsToDelete.push(publishTestId);
      });
    });
    after(function() {
      // cleanup any resource that were not published
      return cloudinary.v2.api.delete_resources(idsToDelete, {
        type: "authenticated"
      });
    });
    it("should publish by public id", function() {
      this.timeout(helper.TIMEOUT_LONG);
      return cloudinary.v2.api.publish_by_ids([publishTestId], {
        type: "authenticated"
      }).then(function(result) {
        var published;
        published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        return expect(published[0].url).to.match(/\/upload\//);
      });
    });
    it("should publish by prefix", function() {
      this.timeout(helper.TIMEOUT_LONG);
      return cloudinary.v2.api.publish_by_prefix(publishTestId.slice(0, -1)).then(function(result) {
        var published;
        published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        return expect(published[0].url).to.match(/\/upload\//);
      });
    });
    it("should publish by tag", function() {
      this.timeout(helper.TIMEOUT_LONG);
      return cloudinary.v2.api.publish_by_tag(publishTestTag).then(function(result) {
        var published;
        published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        return expect(published[0].url).to.match(/\/upload\//);
      });
    });
    return it("should return empty when explicit given type doesn't match resource", function() {
      this.timeout(helper.TIMEOUT_LONG);
      return cloudinary.v2.api.publish_by_ids([publishTestId], {
        type: "private"
      }).then(function(result) {
        var published;
        published = result.published;
        expect(published).not.to.be(null);
        return expect(published.length).to.be(0);
      });
    });
  });
  return describe("access_mode", function() {
    var access_mode_tag, i, publicId;
    i = 0;
    this.timeout(helper.TIMEOUT_LONG);
    publicId = "";
    access_mode_tag = '';
    beforeEach(function() {
      access_mode_tag = TEST_TAG + "access_mode" + i++;
      return cloudinary.v2.uploader.upload(IMAGE_FILE, {
        access_mode: "authenticated",
        tags: UPLOAD_TAGS.concat([access_mode_tag])
      }).then(function(result) {
        publicId = result.public_id;
        return expect(result.access_mode).to.be("authenticated");
      });
    });
    it("should update access mode by ids", function() {
      return cloudinary.v2.api.update_resources_access_mode_by_ids("public", [publicId]).then(function(result) {
        var resource;
        expect(result.updated).to.be.an('array');
        expect(result.updated.length).to.be(1);
        resource = result.updated[0];
        expect(resource.public_id).to.be(publicId);
        return expect(resource.access_mode).to.be('public');
      });
    });
    it("should update access mode by prefix", function() {
      return cloudinary.v2.api.update_resources_access_mode_by_prefix("public", publicId.slice(0, -2)).then(function(result) {
        var resource;
        expect(result.updated).to.be.an('array');
        expect(result.updated.length).to.be(1);
        resource = result.updated[0];
        expect(resource.public_id).to.be(publicId);
        return expect(resource.access_mode).to.be('public');
      });
    });
    return it("should update access mode by tag", function() {
      return cloudinary.v2.api.update_resources_access_mode_by_tag("public", access_mode_tag).then(function(result) {
        var resource;
        expect(result.updated).to.be.an('array');
        expect(result.updated.length).to.be(1);
        resource = result.updated[0];
        expect(resource.public_id).to.be(publicId);
        return expect(resource.access_mode).to.be('public');
      });
    });
  });
});
