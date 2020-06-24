require('dotenv').load({
  silent: true
});

const expect = require("expect.js");
const sinon = require('sinon');
const ClientRequest = require('_http_client').ClientRequest;
const http = require('http');
const Q = require('q');
const cloudinary = require("../../../../cloudinary");
const helper = require("../../../spechelper");
const wait = require('../../../testUtils/helpers/wait');
const sharedExamples = helper.sharedExamples;
const itBehavesLike = helper.itBehavesLike;
const uploadImage = helper.uploadImage;

const testConstants = require('../../../testUtils/testConstants');
const API_V2 = cloudinary.v2.api;

const {
  TIMEOUT,
  TAGS,
  PUBLIC_IDS,
  UNIQUE_JOB_SUFFIX_ID,
  PRESETS,
  TRANSFORMATIONS,
  PUBLIC_ID_PREFIX,
  UNIQUE_TEST_FOLDER
} = testConstants;

const {
  PUBLIC_ID,
  PUBLIC_ID_1,
  PUBLIC_ID_2,
  PUBLIC_ID_3,
  PUBLIC_ID_4,
  PUBLIC_ID_5,
  PUBLIC_ID_6,
  PUBLIC_ID_BACKUP_1,
  PUBLIC_ID_BACKUP_2,
  PUBLIC_ID_BACKUP_3
} = PUBLIC_IDS;

const {
  TEST_TAG,
  SDK_TAG,
  UPLOAD_TAGS
} = TAGS;

const {
  NAMED_TRANSFORMATION,
  NAMED_TRANSFORMATION2,
  EXPLICIT_TRANSFORMATION_NAME,
  EXPLICIT_TRANSFORMATION_NAME2
} = TRANSFORMATIONS;

const {
  API_TEST_UPLOAD_PRESET1,
  API_TEST_UPLOAD_PRESET2,
  API_TEST_UPLOAD_PRESET3,
  API_TEST_UPLOAD_PRESET4
} = PRESETS;

const EXPLICIT_TRANSFORMATION = {
  width: 100,
  crop: "scale",
  overlay: `text:Arial_60:${TEST_TAG}`
};
const EXPLICIT_TRANSFORMATION2 = {
  width: 200,
  crop: "scale",
  overlay: `text:Arial_60:${TEST_TAG}`
};



sharedExamples("a list with a cursor", function (testFunc, ...args) {
  specify(":max_results", function () {
    return helper.mockPromise(function (xhr, writeSpy, requestSpy) {
      testFunc(...args, {
        max_results: 10
      });
      if (writeSpy.called) {
        sinon.assert.calledWith(writeSpy, sinon.match(/max_results=10/));
      } else {
        sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(/max_results=10/)
        }));
      }
    });
  });
  specify(":next_cursor", function () {
    return helper.mockPromise(function (xhr, writeSpy, requestSpy) {
      testFunc(...args, {
        next_cursor: 23452342
      });
      if (writeSpy.called) {
        sinon.assert.calledWith(writeSpy, sinon.match(/next_cursor=23452342/));
      } else {
        sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(/next_cursor=23452342/)
        }));
      }
    });
  });
});

sharedExamples("accepts next_cursor", function (testFunc, ...args) {
  var requestSpy;
  var writeSpy;
  var xhr;

  before(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    writeSpy = sinon.spy(ClientRequest.prototype, 'write');
    requestSpy = sinon.spy(http, 'request');
  });
  after(function () {
    writeSpy.restore();
    requestSpy.restore();
    xhr.restore();
  });
  specify(":next_cursor", function () {
    testFunc(...args, {
      next_cursor: 23452342
    });
    if (writeSpy.called) {
      sinon.assert.calledWith(writeSpy, sinon.match(/next_cursor=23452342/));
    } else {
      sinon.assert.calledWith(requestSpy, sinon.match({
        query: sinon.match(/next_cursor=23452342/)
      }));
    }
  });
});

function getAllTags({ resources }) {
  return resources
    .map(e => e.tags)
    .reduce(((a, b) => a.concat(b)), []);
}

function findByAttr(elements, attr, value) {
  return elements.find(element => element[attr] === value);
}


describe("api", function () {
  this.retries(3);
  var contextKey = `test-key${UNIQUE_JOB_SUFFIX_ID}`;
  before("Verify Configuration", function () {
    let config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  before(function () {
    this.timeout(TIMEOUT.LONG);
    return Q.allSettled([
      uploadImage({
        public_id: PUBLIC_ID,
        tags: UPLOAD_TAGS,
        context: "key=value",
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      uploadImage({
        public_id: PUBLIC_ID_2,
        tags: UPLOAD_TAGS,
        context: "key=value",
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      uploadImage({
        public_id: PUBLIC_ID_5,
        tags: UPLOAD_TAGS,
        context: `${contextKey}=test`,
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      uploadImage({
        public_id: PUBLIC_ID_6,
        tags: UPLOAD_TAGS,
        context: `${contextKey}=alt-test`,
        eager: [EXPLICIT_TRANSFORMATION]
      })
    ]).finally(function () {});
  });
  after(function () {
    var config = cloudinary.config();
    this.timeout(TIMEOUT.LONG);
    if (config.keep_test_products) {
      return Promise.resolve();
    }
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
    return Q.allSettled([
      cloudinary.v2.api.delete_resources_by_tag(TEST_TAG),
      cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET1),
      cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET2),
      cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET3),
      cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET4)
    ]);
  });

  describe("resources", function () {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources);
    it("should allow listing resource_types", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.resource_types().then(function (result) {
        expect(result.resource_types).to.contain("image");
      });
    });
    it("should allow listing resources", function () {
      var publicId;
      this.timeout(TIMEOUT.MEDIUM);
      publicId = '';
      return uploadImage({
        tags: UPLOAD_TAGS
      }).then(function (result) {
        publicId = result.public_id;
        return cloudinary.v2.api.resources();
      }).then(function (result) {
        let resource = findByAttr(result.resources, "public_id", publicId);
        expect(resource).not.to.eql(void 0);
        expect(resource.type).to.eql("upload");
      });
    });
    it("should allow listing resources by type", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage({
        tags: UPLOAD_TAGS
      }).then(
        ({ public_id }) => cloudinary.v2.api.resources({ type: "upload" })
          .then(result => [public_id, result])
          .then(([public_id, result]) => {
            let resource = findByAttr(result.resources, "public_id", public_id);
            expect(resource).to.be.an(Object);
            expect(resource.type).to.eql("upload");
          }));
    });
    it("should allow listing resources by prefix", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.resources({
        type: "upload",
        prefix: PUBLIC_ID_PREFIX,
        max_results: 500
      }).then(function (result) {
        let public_ids = result.resources.map(resource => resource.public_id);

        public_ids.forEach((id) => {
          expect(id.indexOf(PUBLIC_ID_PREFIX)).to.be(0)
        });
      });
    });
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources_by_tag, TEST_TAG);
    it("should allow listing resources by tag", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.resources_by_tag(TEST_TAG, {
        context: true,
        tags: true,
        max_results: 500
      }).then((result) => {
        expect(result.resources.map(e => e.public_id))
          .to.contain(PUBLIC_ID).and.contain(PUBLIC_ID_2);
        expect(getAllTags(result)).to.contain(TEST_TAG);
        expect(result.resources.map(e => e.context && e.context.custom.key))
          .to.contain("value");
      });
    });
    it("should allow listing resources by context only", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.resources_by_context(contextKey, null)
        .then(result => expect(result.resources).to.have.length(2));
    });
    it("should allow listing resources by context key and value", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.resources_by_context(contextKey, "test").then(function (result) {
        expect(result.resources).to.have.length(1);
      });
    });
    it("should allow listing resources by public ids", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.resources_by_ids([PUBLIC_ID, PUBLIC_ID_2], {
        context: true,
        tags: true
      }).then((result) => {
        expect(result.resources.map(e => e.public_id).sort()).to.eql([PUBLIC_ID, PUBLIC_ID_2]);
        expect(getAllTags(result)).to.contain(TEST_TAG);
        expect(result.resources.map(e => e.context.custom.key)).to.contain("value");
      });
    });
    it("should allow listing resources specifying direction", function () {
      this.timeout(TIMEOUT.LONG);
      Q.all(
        cloudinary.v2.api.resources_by_tag(TEST_TAG, {
          type: "upload",
          max_results: 500,
          direction: "asc"
        }),
        cloudinary.v2.api.resources_by_tag(TEST_TAG, {
          type: "upload",
          max_results: 500,
          direction: "desc"
        })
      ).then(([resultAsc, resultDesc]) => [
        resultAsc.resources.map(r => r.public_id),
        resultDesc.resources.map(r => r.public_id)
      ]).then(([asc, desc]) => expect(asc.reverse()).to.eql(desc));
    });
    it("should allow listing resources by start_at", function () {
      let start_at = new Date().toString();
      helper.mockPromise((xhr, writeSpy, requestSpy) => {
        cloudinary.v2.api.resources({
          type: "upload",
          start_at: start_at,
          direction: "asc"
        });
        sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(`start_at=${encodeURIComponent(start_at)}`)
        }));
      });
    });
    it("should allow get resource metadata", function () {
      this.timeout(TIMEOUT.LONG);
      return uploadImage({
        tags: UPLOAD_TAGS,
        eager: [EXPLICIT_TRANSFORMATION]
      }).then(({ public_id }) => cloudinary.v2.api.resource(public_id)
        .then(resource => [public_id, resource]))
        .then(([public_id, resource]) => {
          expect(resource).not.to.eql(void 0);
          expect(resource.public_id).to.eql(public_id);
          expect(resource.bytes).to.eql(3381);
          expect(resource.derived).to.have.length(1);
        });
    });
    it("should allow getting the cinemagraph_analysis of a resource", async function () {
      // Get a resource and include a cinemagraph analysis value in the response
      const result = await API_V2.resource(PUBLIC_ID, { cinemagraph_analysis: true });

      // Ensure result includes a cinemagraph_analysis with a cinemagraph_score
      expect(result).not.to.be.empty();
      expect(result.cinemagraph_analysis).to.be.an("object");
      expect(result.cinemagraph_analysis).to.have.property("cinemagraph_score");
    });
    describe("derived pagination", function(){
      it("should send the derived_next_cursor to the server", function() {
        return helper.mockPromise((xhr, writeSpy, requestSpy) => {
          cloudinary.v2.api.resource(PUBLIC_ID, {derived_next_cursor: 'aaa'});
          return sinon.assert.calledWith(
            requestSpy, sinon.match(sinon.match({
              query: sinon.match('derived_next_cursor=aaa')
            }, 'derived_next_cursor=aaa')));
        });
      });
    });
  });
  describe("backup resource", function () {
    this.timeout(TIMEOUT.MEDIUM);

    const publicId = "api_test_backup" + UNIQUE_JOB_SUFFIX_ID;
    before(() => uploadImage({
      public_id: publicId,
      backup: true
    }).then(() => cloudinary.v2.api.resource(publicId)).then((resource) => {
      expect(resource).not.to.be(null);
    }));
    after(function () {
      return cloudinary.v2.api.delete_resources(publicId).then((response) => {
        expect(response).to.have.property("deleted");
      });
    });
    it("should return the asset details together with all of its backed up versions when versions is true", function () {
      return cloudinary.v2.api.resource(publicId, { versions: true })
        .then((resource) => {
          expect(resource.versions).to.be.an('array');
        });
    });

    it("should return the asset details together without backed up versions when versions is false", function () {
      return cloudinary.v2.api.resource(publicId, { versions: false })
        .then((resource) => {
          expect(resource.versions).to.be(undefined);
        });
    });
  });
  describe("delete", function () {
    it("should allow deleting derived resource", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage({
        tags: UPLOAD_TAGS,
        eager: [
          {
            width: 101,
            crop: "scale"
          }
        ]
      }).then(wait(2000)).then(
        ({ public_id }) => cloudinary.v2.api.resource(public_id)
          .then(resource => [public_id, resource])
      ).then(([public_id, resource]) => {
        expect(resource).not.to.eql(void 0);
        expect(resource.bytes).to.eql(3381);
        expect(resource.derived).to.have.length(1);
        let derived_resource_id = resource.derived[0].id;
        // ignore results and pass-through the public_id
        return cloudinary.v2.api.delete_derived_resources(derived_resource_id)
          .then(() => public_id);
      }).then(public_id => cloudinary.v2.api.resource(public_id))
        .then((resource) => {
          expect(resource).not.to.eql(void 0);
          expect(resource.derived).to.have.length(0);
        });
    });
    it("should allow deleting derived resources by transformations", function () {
      this.timeout(TIMEOUT.LARGE);
      return Q.all([
        uploadImage({
          public_id: PUBLIC_ID_1,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION]
        }),
        uploadImage({
          public_id: PUBLIC_ID_2,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION2]
        }),
        uploadImage({
          public_id: PUBLIC_ID_3,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION, EXPLICIT_TRANSFORMATION2]
        })
      ]).then(wait(4000)).then(() => cloudinary.v2.api.delete_derived_by_transformation(
        [PUBLIC_ID_1, PUBLIC_ID_3], [EXPLICIT_TRANSFORMATION, EXPLICIT_TRANSFORMATION2]
      )).then(
        () => cloudinary.v2.api.resource(PUBLIC_ID_1)
      ).then((result) => {
        expect(result.derived.length).to.eql(0);
        return cloudinary.v2.api.resource(PUBLIC_ID_2);
      }).then((result) => {
        expect(result.derived.find(d => d.transformation === EXPLICIT_TRANSFORMATION_NAME2))
          .to.not.be.empty();
        return cloudinary.v2.api.resource(PUBLIC_ID_3);
      }).then(function (result) {
        expect(result.derived.length).to.eql(0);
      });
    });
    it("should allow deleting resources", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage({
        public_id: PUBLIC_ID_3,
        tags: UPLOAD_TAGS
      }).then(
        () => cloudinary.v2.api.resource(PUBLIC_ID_3)
      ).then(function (resource) {
        expect(resource).not.to.eql(void 0);
        return cloudinary.v2.api.delete_resources(["apit_test", PUBLIC_ID_2, PUBLIC_ID_3]);
      }).then(
        () => cloudinary.v2.api.resource(PUBLIC_ID_3)
      ).then(() => {
        expect().fail();
      }).catch(function ({ error }) {
        expect(error).to.be.an(Object);
        expect(error.http_code).to.eql(404);
      });
    });
    describe("delete_resources_by_prefix", function () {
      itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, "prefix_foobar");
      return it("should allow deleting resources by prefix", function () {
        this.timeout(TIMEOUT.MEDIUM);
        return uploadImage({
          public_id: "api_test_by_prefix",
          tags: UPLOAD_TAGS
        }).then(
          () => cloudinary.v2.api.resource("api_test_by_prefix")
        ).then(function (resource) {
          expect(resource).not.to.eql(void 0);
          return cloudinary.v2.api.delete_resources_by_prefix("api_test_by");
        }).then(
          () => cloudinary.v2.api.resource("api_test_by_prefix")
        ).then(
          () => expect().fail()
        ).catch(function ({ error }) {
          expect(error).to.be.an(Object);
          expect(error.http_code).to.eql(404);
        });
      });
    });
    describe("delete_resources_by_tag", function () {
      let deleteTestTag = TEST_TAG + "_delete";
      itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, deleteTestTag);
      it("should allow deleting resources by tags", function () {
        this.timeout(TIMEOUT.MEDIUM);
        return uploadImage({
          public_id: PUBLIC_ID_4,
          tags: UPLOAD_TAGS.concat([deleteTestTag])
        }).then(
          () => cloudinary.v2.api.resource(PUBLIC_ID_4)
        ).then(function (resource) {
          expect(resource).to.be.ok();
          return cloudinary.v2.api.delete_resources_by_tag(deleteTestTag);
        }).then(
          () => cloudinary.v2.api.resource(PUBLIC_ID_4)
        ).then(
          () => expect().fail()
        ).catch(({ error }) => {
          expect(error).to.be.an(Object);
          expect(error.http_code).to.eql(404);
        });
      });
    });
  });
  describe("tags", function () {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.tags);
    it("should allow listing tags", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.tags({
        max_results: 500
      }).then(result => expect(result.tags).not.to.be.empty());
    });
    it("should allow listing tag by prefix ", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.tags({
        prefix: TEST_TAG.slice(0, -1),
        max_results: 500
      }).then(result => expect(result.tags).to.contain(TEST_TAG));
    });
    it("should allow listing tag by prefix if not found", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.tags({
        prefix: "api_test_no_such_tag"
      }).then(result => expect(result.tags).to.be.empty());
    });
  });
  describe("headers", function () {
    it("should include rate limits", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.resources().then(function (result) {
        expect(result.rate_limit_allowed).to.be.a("number");
        expect(result.rate_limit_reset_at).to.be.an("object");
        expect(result.rate_limit_reset_at).to.have.property("getDate");
        expect(result.rate_limit_remaining).to.be.a("number");
      });
    });
  });
  describe("transformations", function () {
    var transformationName;
    itBehavesLike("a list with a cursor", cloudinary.v2.api.transformation, EXPLICIT_TRANSFORMATION_NAME);
    itBehavesLike("a list with a cursor", cloudinary.v2.api.transformations);
    transformationName = "api_test_transformation3" + UNIQUE_JOB_SUFFIX_ID;
    after(function () {
      return Q.allSettled(
        [
          cloudinary.v2.api.delete_transformation(transformationName),
          cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION),
          cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION2)
        ]
      ).finally(function () {});
    });
    it("should allow listing transformations", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.transformations().then(function (result) {
        expect(result).to.have.key("transformations");
        expect(result.transformations).not.to.be.empty();
        expect(result.transformations[0]).to.have.key('used');
      });
    });
    it("should allow getting transformation metadata", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME).then(function (transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION]);
      });
    });
    it("should allow getting transformation metadata by info", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION).then(function (transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION]);
      });
    });
    it("should allow updating transformation allowed_for_strict", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.update_transformation(EXPLICIT_TRANSFORMATION_NAME, {
        allowed_for_strict: true
      }).then(
        () => cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME)
      ).then(function (transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.allowed_for_strict).to.be.ok();
        return cloudinary.v2.api.update_transformation(EXPLICIT_TRANSFORMATION_NAME, {
          allowed_for_strict: false
        });
      }).then(() => cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME)).then(function (transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.allowed_for_strict).not.to.be.ok();
      });
    });
    describe("Named Transformations", function () {
      it("should allow creating named transformation", function () {
        this.timeout(TIMEOUT.MEDIUM);
        return cloudinary.v2.api.create_transformation(NAMED_TRANSFORMATION, {
          crop: "scale",
          width: 102
        }).then(
          () => cloudinary.v2.api.transformation(NAMED_TRANSFORMATION)
        ).then(function (transformation) {
          expect(transformation).not.to.eql(void 0);
          expect(transformation.allowed_for_strict).to.be.ok();
          expect(transformation.info).to.eql([
            {
              crop: "scale",
              width: 102
            }
          ]);
          expect(transformation.used).not.to.be.ok();
        });
      });
      it("should allow creating named transformation with an empty format", function () {
        this.timeout(TIMEOUT.MEDIUM);
        return cloudinary.v2.api.create_transformation(NAMED_TRANSFORMATION2, {
          crop: "scale",
          width: 102,
          format: ''
        }).then(
          () => cloudinary.v2.api.transformation(NAMED_TRANSFORMATION2)
        ).then(function (transformation) {
          expect(transformation).not.to.eql(void 0);
          expect(transformation.allowed_for_strict).to.be.ok();
          expect(transformation.info).to.eql([
            {
              crop: "scale",
              width: 102,
              extension: 'none'
            }
          ]);
          expect(transformation.used).not.to.be.ok();
        });
      });
      it("should allow listing of named transformations", function () {
        return helper.mockPromise(function (xhr, write, request) {
          cloudinary.v2.api.transformations({
            named: true
          });
          return sinon.assert.calledWith(request, sinon.match({
            query: sinon.match('named=true')
          }, "named=true"));
        });
      });
      it("should allow unsafe update of named transformation", function () {
        this.timeout(TIMEOUT.MEDIUM);
        return cloudinary.v2.api.create_transformation(transformationName, {
          crop: "scale",
          width: 102
        }).then(() => cloudinary.v2.api.update_transformation(transformationName, {
          unsafe_update: {
            crop: "scale",
            width: 103
          }
        })).then(
          () => cloudinary.v2.api.transformation(transformationName)
        ).then((transformation) => {
          expect(transformation).not.to.eql(void 0);
          expect(transformation.info).to.eql([
            {
              crop: "scale",
              width: 103
            }
          ]);
          expect(transformation.used).not.to.be.ok();
        });
      });
      it("should allow deleting named transformation", function () {
        this.timeout(TIMEOUT.MEDIUM);
        return cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION)
          .then(() => cloudinary.v2.api.transformation(NAMED_TRANSFORMATION))
          .then(() => expect().fail())
          .catch(({ error }) => expect(error.http_code).to.eql(404));
      });
    });
    it("should allow deleting implicit transformation", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME).then(function (transformation) {
        expect(transformation).to.be.an(Object);
        return cloudinary.v2.api.delete_transformation(EXPLICIT_TRANSFORMATION_NAME);
      }).then(
        () => cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME)
      ).then(
        () => expect().fail()
      ).catch(({ error }) => expect(error.http_code).to.eql(404));
    });
  });
  describe("upload_preset", function () {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.upload_presets);
    it("should allow listing upload_presets", function () {
      return helper.mockPromise(function (xhr, write, request) {
        cloudinary.v2.api.upload_presets();
        return sinon.assert.calledWith(request, sinon.match({
          pathname: sinon.match(/.*\/upload_presets$/)
        }, "upload_presets"));
      });
    });
    it("should allow getting a single upload_preset", function () {
      return helper.mockPromise(function (xhr, write, request) {
        cloudinary.v2.api.upload_preset(API_TEST_UPLOAD_PRESET1);
        var expectedPath="/.*\/upload_presets/"+API_TEST_UPLOAD_PRESET1+"$";
        return sinon.assert.calledWith(request, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match("GET")
        }));
      });
    });
    it("should allow deleting upload_presets", function () {
      return helper.mockPromise(function (xhr, write, request) {
        cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET2);
        var expectedPath="/.*\/upload_presets/"+API_TEST_UPLOAD_PRESET2+"$";
        return sinon.assert.calledWith(request, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match("DELETE")
        }))
      });
    });
    it("should allow updating upload_presets", function () {
      return helper.mockPromise(function (xhr, write, request) {
        cloudinary.v2.api.update_upload_preset(API_TEST_UPLOAD_PRESET3,
          {
            colors: true,
            unsigned: true,
            disallow_public_id: true,
            live: true
          });
        var expectedPath="/.*\/upload_presets/"+API_TEST_UPLOAD_PRESET3+"$";
        sinon.assert.calledWith(request, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match("PUT")
        }));
        sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('colors', 1, "colors=1")));
        sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('unsigned', true, "unsigned=true")));
        sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('disallow_public_id', true, "disallow_public_id=true")));
        sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('live', true, "live=true")));
      });
    });
    it("should allow creating upload_presets", function () {
      return helper.mockPromise(function (xhr, write) {
        cloudinary.v2.api.create_upload_preset({
          folder: "upload_folder",
          unsigned: true,
          tags: UPLOAD_TAGS,
          live: true
        }).then((preset) => {
          cloudinary.v2.api.delete_upload_preset(preset.name).catch((err) => {
            console.log(err);
            // we don't fail the test if the delete fails
          });
        });

        sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('unsigned', true, "unsigned=true")));
        sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('live', true, "live=true")));
      });
    });
  });
  it("should support the usage API call", function () {
    this.timeout(TIMEOUT.MEDIUM);
    return cloudinary.v2.api.usage()
      .then(usage => expect(usage.last_update).not.to.eql(null));
  });
  describe("delete_all_resources", function () {
    itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_all_resources);
    describe("keep_original: yes", function () {
      it("should allow deleting all derived resources", function () {
        return helper.mockPromise(function (xhr, write, request) {
          let options = {
            keep_original: true
          };
          cloudinary.v2.api.delete_all_resources(options);
          sinon.assert.calledWith(request, sinon.match(arg => new RegExp("/resources/image/upload$").test(arg.pathname), "/resources/image/upload"));
          sinon.assert.calledWith(request, sinon.match(arg => arg.method === "DELETE", "DELETE"));
          sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('keep_original', 'true'), "keep_original=true"));
          sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('all', 'true'), "all=true"));
        });
      });
    });
  });
  describe("update", function () {
    describe("notification url", function () {
      var writeSpy, xhr;
      before(function () {
        xhr = sinon.useFakeXMLHttpRequest();
        writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      });
      after(function () {
        writeSpy.restore();
        xhr.restore();
      });
      it("should support changing moderation status with notification-url", function () {
        this.timeout(TIMEOUT.LONG);
        return uploadImage({
          moderation: "manual"
        }).then(upload_result => cloudinary.v2.api.update(upload_result.public_id, {
          moderation_status: "approved",
          notification_url: "http://example.com"
        })).then(function () {
          if (writeSpy.called) {
            sinon.assert.calledWith(writeSpy, sinon.match(/notification_url=http%3A%2F%2Fexample.com/));
            sinon.assert.calledWith(writeSpy, sinon.match(/moderation_status=approved/));
          }
        });
      });
    });
    describe("quality override", function() {
      const mocked = helper.mockTest();
      const qualityValues = ["auto:advanced", "auto:best", "80:420", "none"];
      qualityValues.forEach(quality => {
        it("should support '" + quality + "' in update", function() {
          cloudinary.v2.api.update("sample", {quality_override: quality});
          sinon.assert.calledWith(mocked.write, sinon.match(helper.apiParamMatcher("quality_override", quality)));
        });
      });
    });
    it("should support setting manual moderation status", function() {
      this.timeout(TIMEOUT.LONG);
      return uploadImage({
        moderation: "manual"
      }).then(upload_result => cloudinary.v2.api.update(upload_result.public_id, {
        moderation_status: "approved"
      })).then(api_result => expect(api_result.moderation[0].status).to.eql("approved"))
        .catch((err) => {
          console.og(err);
        });
    });
    it("should support requesting ocr info", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage()
        .then(upload_result => cloudinary.v2.api.update(upload_result.public_id, {
          ocr: "illegal"
        })).then(
          () => expect().fail()
        ).catch(({ error }) => expect(error.message).to.contain("Illegal value"));
    });
    it("should support requesting raw conversion", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage()
        .then(upload_result => cloudinary.v2.api.update(upload_result.public_id, {
          raw_convert: "illegal"
        })).then(
          () => expect().fail()
        ).catch(({ error }) => expect(error.message).to.contain("Illegal value"));
    });
    it("should support requesting categorization", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage().then(function (upload_result) {
        return cloudinary.v2.api.update(upload_result.public_id, {
          categorization: "illegal"
        });
      }).then(() => {
        expect().fail();
      }).catch(function ({ error }) {
        expect(error.message).to.contain("Illegal value");
      });
    });
    it("should support requesting detection", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage()
        .then(upload_result => cloudinary.v2.api.update(upload_result.public_id, {
          detection: "illegal"
        })).then(
          () => expect().fail()
        ).catch(({ error }) => expect(error.message).to.contain("Illegal value"));
    });
    it("should support requesting background_removal", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage()
        .then(upload_result => cloudinary.v2.api.update(upload_result.public_id, {
          background_removal: "illegal"
        })).then(
          () => expect().fail()
        ).catch(({ error }) => expect(error.message).to.contain("Illegal value"));
    });
    describe("access_control", function () {
      var acl, acl_string, options;
      acl = {
        access_type: 'anonymous',
        start: new Date(Date.UTC(2019, 1, 22, 16, 20, 57)),
        end: '2019-03-22 00:00 +0200'
      };
      acl_string = '{"access_type":"anonymous","start":"2019-02-22T16:20:57.000Z","end":"2019-03-22 00:00 +0200"}';
      options = {
        public_id: TEST_TAG,
        tags: [...UPLOAD_TAGS, 'access_control_test']
      };
      it("should allow the user to define ACL in the update parameters2", function () {
        return helper.mockPromise((xhr, writeSpy, requestSpy) => {
          options.access_control = [acl];
          cloudinary.v2.api.update("id", options);
          return sinon.assert.calledWith(
            writeSpy, sinon.match(arg => helper.apiParamMatcher('access_control', `[${acl_string}]`)(arg))
          );
        });
      });
    });
  });
  it("should support listing by moderation kind and value", function () {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources_by_moderation, "manual", "approved");
    return helper.mockPromise((xhr, write, request) => ["approved", "pending", "rejected"].forEach((stat) => {
      var status, status2;
      status = stat;
      status2 = status;
      request.resetHistory();
      cloudinary.v2.api.resources_by_moderation("manual", status2, {
        moderations: true
      });
      sinon.assert.calledWith(request, sinon.match(
        arg => new RegExp(`/resources/image/moderations/manual/${status2}$`).test(arg != null ? arg.pathname : void 0), `/resources/image/moderations/manual/${status}`
      ));
      sinon.assert.calledWith(request, sinon.match(
        arg => (arg != null ? arg.query : void 0) === "moderations=true", "moderations=true"
      ));
    }));
  });
  describe("folders", function () {
    // For this test to work, "Auto-create folders" should be enabled in the Upload Settings.
    // Replace `it` with  `it.skip` below if you want to disable it.
    it("should list folders in cloudinary", function () {
      this.timeout(TIMEOUT.LONG);
      return Q.all([
        uploadImage({
          public_id: 'test_folder1/item',
          tags: UPLOAD_TAGS
        }),
        uploadImage({
          public_id: 'test_folder2/item',
          tags: UPLOAD_TAGS
        }),
        uploadImage({
          public_id: 'test_folder2/item',
          tags: UPLOAD_TAGS
        }),
        uploadImage({
          public_id: 'test_folder1/test_subfolder1/item',
          tags: UPLOAD_TAGS
        }),
        uploadImage({
          public_id: 'test_folder1/test_subfolder2/item',
          tags: UPLOAD_TAGS
        })
      ]).then(wait(TIMEOUT.SHORT))
        .then(function (results) {
          return Q.all([cloudinary.v2.api.root_folders(), cloudinary.v2.api.sub_folders('test_folder1')]);
        }).then(function (results) {
          var folder, root, root_folders, sub_1;
          root = results[0];
          root_folders = (() => {
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
        }).then(wait(TIMEOUT.LONG)).then((result) => {
          console.log('error test_folder_not_exists should not pass to "then" handler but "catch"');
          expect().fail('error test_folder_not_exists should not pass to "then" handler but "catch"');
        }).catch(({ error }) => expect(error.message).to.eql('Can\'t find folder with path test_folder_not_exists'));
    });
    describe("create_folder", function () {
      it("should create a new folder", function () {
        const folderPath = `${UNIQUE_TEST_FOLDER}`;
        const expectedPath = `folders/${folderPath}`;
        return helper.mockPromise(function (xhr, write, request) {
          cloudinary.v2.api.create_folder(folderPath);
          sinon.assert.calledWith(request, sinon.match({
            pathname: sinon.match(expectedPath),
            method: sinon.match("POST")
          }));
        });
      });
    });
    describe("delete_folder", function () {
      this.timeout(TIMEOUT.MEDIUM);
      const folderPath = "test_folder/delete_folder/" + TEST_TAG;
      before(function () {
        return uploadImage({
          folder: folderPath,
          tags: UPLOAD_TAGS
        }).delay(2 * 1000).then(function () {
          return cloudinary.v2.api.delete_resources_by_prefix(folderPath)
            .then(() => cloudinary.v2.api.sub_folders(folderPath).then(folder => {
              expect(folder).not.to.be(null);
              expect(folder.total_count).to.eql(0);
              expect(folder.folders).to.be.empty;
            }));
        });
      });
      it('should delete an empty folder', function () {
        this.timeout(TIMEOUT.MEDIUM);
        return cloudinary.v2.api.delete_folder(
          folderPath
        ).delay(2 * 1000).then(() => cloudinary.v2.api.sub_folders(folderPath)
        ).then(() => expect().fail()
        ).catch(({error}) => expect(error.message).to.contain("Can't find folder with path"));
      });
    });
    describe("root_folders", function () {
      itBehavesLike("a list with a cursor", cloudinary.v2.api.root_folders);
    })
    describe("sub_folders", function () {
      itBehavesLike("a list with a cursor", cloudinary.v2.api.sub_folders, '/');
    });
  });
  describe('.restore', function () {
    this.timeout(TIMEOUT.MEDIUM);

    const publicId = "api_test_restore" + UNIQUE_JOB_SUFFIX_ID;
    before(() => uploadImage({
      public_id: publicId,
      backup: true,
      tags: UPLOAD_TAGS
    }).then(wait(2000)).then(() => cloudinary.v2.api.resource(publicId)).then((resource) => {
      expect(resource).not.to.be(null);
      expect(resource.bytes).to.eql(3381);
      return cloudinary.v2.api.delete_resources(publicId);
    }).then(() => cloudinary.v2.api.resource(publicId)).then((resource) => {
      expect(resource).not.to.be(null);
      expect(resource.bytes).to.eql(0);
      expect(resource.placeholder).to.eql(true);
    }));
    it('should restore a deleted resource', () => cloudinary.v2.api.restore(publicId).then((response) => {
      let info = response[publicId];
      expect(info).not.to.be(null);
      expect(info.bytes).to.eql(3381);
      return cloudinary.v2.api.resource(publicId);
    }).then((resource) => {
      expect(resource).not.to.be(null);
      expect(resource.bytes).to.eql(3381);
    }));

    it('should restore different versions of a deleted asset', async function () {
      this.timeout(TIMEOUT.LARGE);
      // Upload the same file twice (upload->delete->upload->delete)

      // Upload and delete a file
      const firstUpload = await uploadImage({ public_id: PUBLIC_ID_BACKUP_1, backup: true });
      await wait(1000)();

      const firstDelete = await API_V2.delete_resources([PUBLIC_ID_BACKUP_1]);


      // Upload and delete it again, this time add angle to create a different 'version'
      const secondUpload = await uploadImage({ public_id: PUBLIC_ID_BACKUP_1, backup: true, angle: '0'});
      await wait(1000)();

      const secondDelete = await API_V2.delete_resources([PUBLIC_ID_BACKUP_1]);


      // Sanity, ensure these uploads are different before we continue
      expect(firstUpload.bytes).not.to.equal(secondUpload.bytes);

      // Ensure all files were uploaded correctly
      expect(firstUpload).not.to.be(null);
      expect(secondUpload).not.to.be(null);

      // Ensure all files were deleted correctly
      expect(firstDelete).to.have.property("deleted");
      expect(secondDelete).to.have.property("deleted");

      // Get the versions versions of the deleted asset
      const getVersionsResp = await API_V2.resource(PUBLIC_ID_BACKUP_1, { versions: true });

      const firstAssetVersion = getVersionsResp.versions[0].version_id;
      const secondAssetVersion = getVersionsResp.versions[1].version_id;

      // Restore first version, ensure it's equal to the upload size
      await wait(1000)();
      const firstVerRestore = await API_V2.restore([PUBLIC_ID_BACKUP_1], { versions: [firstAssetVersion] });
      expect(firstVerRestore[PUBLIC_ID_BACKUP_1].bytes).to.eql(firstUpload.bytes);

      // Restore second version, ensure it's equal to the upload size
      const secondVerRestore = await API_V2.restore([PUBLIC_ID_BACKUP_1], { versions: [secondAssetVersion] });
      expect(secondVerRestore[PUBLIC_ID_BACKUP_1].bytes).to.eql(secondUpload.bytes);

      // Cleanup,
      const finalDeleteResp = await API_V2.delete_resources([PUBLIC_ID_BACKUP_1]);
      expect(finalDeleteResp).to.have.property("deleted");
    });

    it('should restore two different deleted assets', async () => {
      // Upload two different files
      const firstUpload = await uploadImage({ public_id: PUBLIC_ID_BACKUP_1, backup: true });
      const secondUpload = await uploadImage({ public_id: PUBLIC_ID_BACKUP_2, backup: true, angle: '0' });

      // delete both resources
      const deleteAll = await API_V2.delete_resources([PUBLIC_ID_BACKUP_1, PUBLIC_ID_BACKUP_2]);

      // Expect correct deletion of the assets
      expect(deleteAll.deleted[PUBLIC_ID_BACKUP_1]).to.be("deleted");
      expect(deleteAll.deleted[PUBLIC_ID_BACKUP_2]).to.be("deleted");

      const getFirstAssetVersion = await API_V2.resource(PUBLIC_ID_BACKUP_1, { versions: true });
      const getSecondAssetVersion = await API_V2.resource(PUBLIC_ID_BACKUP_2, { versions: true });

      const firstAssetVersion = getFirstAssetVersion.versions[0].version_id;
      const secondAssetVersion = getSecondAssetVersion.versions[0].version_id;

      const IDS_TO_RESTORE = [PUBLIC_ID_BACKUP_1, PUBLIC_ID_BACKUP_2];
      const VERSIONS_TO_RESTORE = [firstAssetVersion, secondAssetVersion];

      const restore = await API_V2.restore(IDS_TO_RESTORE, { versions: VERSIONS_TO_RESTORE });

      // Expect correct restorations
      expect(restore[PUBLIC_ID_BACKUP_1].bytes).to.equal(firstUpload.bytes);
      expect(restore[PUBLIC_ID_BACKUP_2].bytes).to.equal(secondUpload.bytes);

      // Cleanup
      const finalDelete = await API_V2.delete_resources([PUBLIC_ID_BACKUP_1, PUBLIC_ID_BACKUP_2]);
      // Expect correct deletion of the assets
      expect(finalDelete.deleted[PUBLIC_ID_BACKUP_1]).to.be("deleted");
      expect(finalDelete.deleted[PUBLIC_ID_BACKUP_2]).to.be("deleted");
    });
  });
  describe('mapping', function () {
    before(function () {
      this.mapping = `api_test_upload_mapping${Math.floor(Math.random() * 100000)}`;
      this.deleteMapping = false;
    });
    after(function () {
      return this.deleteMapping ? cloudinary.v2.api.delete_upload_mapping(this.mapping) : null;
    });
    itBehavesLike("a list with a cursor", cloudinary.v2.api.upload_mappings);
    it('should create mapping', function () {
      this.timeout(TIMEOUT.LONG);
      return cloudinary.v2.api
        .create_upload_mapping(this.mapping, {
          template: "http://cloudinary.com",
          tags: UPLOAD_TAGS
        }).then(
          () => cloudinary.v2.api.upload_mapping(this.mapping)
        ).then((result) => {
          this.deleteMapping = true;
          expect(result.template).to.eql("http://cloudinary.com");
          return cloudinary.v2.api.update_upload_mapping(this.mapping, {
            template: "http://res.cloudinary.com"
          });
        }).then(
          result => cloudinary.v2.api.upload_mapping(this.mapping)
        ).then((result) => {
          expect(result.template).to.eql("http://res.cloudinary.com");
          return cloudinary.v2.api.upload_mappings();
        }).then((result) => {
          expect(result.mappings.find(({ folder, template }) => folder === this.mapping && template === "http://res.cloudinary.com")).to.be.ok();
          return cloudinary.v2.api.delete_upload_mapping(this.mapping);
        }).then((result) => {
          this.deleteMapping = false;
          return cloudinary.v2.api.upload_mappings();
        }).then(
          ({ mappings }) => expect(mappings.find(({ folder }) => folder === this.mapping)).not.to.be.ok()
        );
    });
  });
  describe("publish", function () {
    var i, idsToDelete, publishTestId, publishTestTag;
    this.timeout(TIMEOUT.LONG);
    i = 0;
    publishTestId = "";
    publishTestTag = "";
    idsToDelete = [];
    beforeEach(function () {
      publishTestTag = TEST_TAG + i++;
      return uploadImage({
        type: "authenticated",
        tags: UPLOAD_TAGS.concat([publishTestTag])
      }).then((result) => {
        publishTestId = result.public_id;
        idsToDelete.push(publishTestId);
      });
    });
    after(function () {
      // cleanup any resource that were not published
      return cloudinary.v2.api.delete_resources(idsToDelete, {
        type: "authenticated"
      });
    });
    it("should publish by public id", function () {
      this.timeout(TIMEOUT.LONG);
      return cloudinary.v2.api.publish_by_ids([publishTestId], {
        type: "authenticated"
      }).then(function (result) {
        let published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        expect(published[0].url).to.match(/\/upload\//);
      });
    });
    it("should publish by prefix", function () {
      this.timeout(TIMEOUT.LONG);
      return cloudinary.v2.api.publish_by_prefix(publishTestId.slice(0, -1)).then((result) => {
        let published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        expect(published[0].url).to.match(/\/upload\//);
      });
    });
    it("should publish by tag", function () {
      this.timeout(TIMEOUT.LONG);
      return cloudinary.v2.api.publish_by_tag(publishTestTag).then((result) => {
        let published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        expect(published[0].url).to.match(/\/upload\//);
      });
    });
    it("should return empty when explicit given type doesn't match resource", function () {
      this.timeout(TIMEOUT.LONG);
      return cloudinary.v2.api.publish_by_ids([publishTestId], {
        type: "private"
      }).then(function (result) {
        let published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(0);
      });
    });
  });
  describe("access_mode", function () {
    let access_mode_tag, i, publicId;
    i = 0;
    this.timeout(TIMEOUT.LONG);
    publicId = "";
    access_mode_tag = '';

    beforeEach(async function () {
      access_mode_tag = TEST_TAG + "access_mode" + i++;
      const result = await uploadImage({
        access_mode: "authenticated",
        tags: UPLOAD_TAGS.concat([access_mode_tag])
      });

      await wait(5000)();
      publicId = result.public_id;
      expect(result.access_mode).to.be("authenticated");
    });

    it("should update access mode by ids", () => cloudinary.v2.api.update_resources_access_mode_by_ids("public", [publicId]).then((result) => {
      var resource;
      expect(result.updated).to.be.an('array');
      expect(result.updated.length).to.be(1);
      resource = result.updated[0];
      expect(resource.public_id).to.be(publicId);
      expect(resource.access_mode).to.be('public');
    }));
    it("should update access mode by prefix", () => cloudinary.v2.api.update_resources_access_mode_by_prefix("public", publicId.slice(0, -2)).then((result) => {
      var resource;
      expect(result.updated).to.be.an('array');
      expect(result.updated.length).to.be(1);
      resource = result.updated[0];
      expect(resource.public_id).to.be(publicId);
      expect(resource.access_mode).to.be('public');
    }));
    it("should update access mode by tag", () => cloudinary.v2.api.update_resources_access_mode_by_tag("public", access_mode_tag).then((result) => {
      var resource;
      expect(result.updated).to.be.an('array');
      expect(result.updated.length).to.be(1);
      resource = result.updated[0];
      expect(resource.public_id).to.be(publicId);
      expect(resource.access_mode).to.be('public');
    }));
  });
});
