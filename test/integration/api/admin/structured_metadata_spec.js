const assert = require('assert');
const Q = require('q');
const sinon = require('sinon');
const cloudinary = require("../../../../cloudinary");
const helper = require("../../../spechelper");
const TIMEOUT = require('../../../testUtils/testConstants').TIMEOUT;

const TEST_ID = Date.now();

const EXTERNAL_ID_GENERAL = 'metadata_external_id_general_' + TEST_ID;
const EXTERNAL_ID_STRING = 'metadata_external_id_string_' + TEST_ID;
const EXTERNAL_ID_INT = 'metadata_external_id_int_' + TEST_ID;
const EXTERNAL_ID_DATE = 'metadata_external_id_date_' + TEST_ID;
const EXTERNAL_ID_ENUM = 'metadata_external_id_enum_' + TEST_ID;
const EXTERNAL_ID_ENUM_2 = 'metadata_external_id_enum_2_' + TEST_ID;
const EXTERNAL_ID_SET = 'metadata_external_id_set_' + TEST_ID;
const EXTERNAL_ID_SET_2 = 'metadata_external_id_set_2_' + TEST_ID;
const EXTERNAL_ID_SET_3 = 'metadata_external_id_set_3_' + TEST_ID;
const EXTERNAL_ID_SET_4 = 'metadata_external_id_set_4_' + TEST_ID;
const EXTERNAL_ID_DELETE = 'metadata_deletion_' + TEST_ID;
const EXTERNAL_ID_DELETE_2 = 'metadata_deletion_2_' + TEST_ID;
const EXTERNAL_ID_DATE_VALIDATION = 'metadata_date_validation_' + TEST_ID;
const EXTERNAL_ID_DATE_VALIDATION_2 = 'metadata_date_validation_2_' + TEST_ID;
const EXTERNAL_ID_INT_VALIDATION = 'metadata_int_validation_' + TEST_ID;
const EXTERNAL_ID_INT_VALIDATION_2 = 'metadata_int_validation_2_' + TEST_ID;
const DATASOURCE_ENTRY_EXTERNAL_ID = 'metadata_datasource_entry_external_id' + TEST_ID;

const datasource_single = [
  {
    value: 'v1',
    external_id: DATASOURCE_ENTRY_EXTERNAL_ID
  }
];
const datasource_multiple = [
  {
    value: 'v2',
    external_id: DATASOURCE_ENTRY_EXTERNAL_ID
  },
  {
    value: 'v3'
  },
  {
    value: 'v4'
  }
];

const metadata_fields_external_ids = [
  EXTERNAL_ID_GENERAL, EXTERNAL_ID_DATE, EXTERNAL_ID_ENUM_2, EXTERNAL_ID_SET, EXTERNAL_ID_INT_VALIDATION,
  EXTERNAL_ID_INT_VALIDATION_2, EXTERNAL_ID_DATE_VALIDATION, EXTERNAL_ID_DATE_VALIDATION_2
];

const metadata_fields_to_create = [
  {
    external_id: EXTERNAL_ID_GENERAL,
    type: 'string'
  },
  {
    external_id: EXTERNAL_ID_ENUM_2,
    type: 'enum',
    datasource: {
      values: datasource_multiple
    }
  },
  {
    external_id: EXTERNAL_ID_DELETE_2,
    type: 'integer'
  },
  {
    external_id: EXTERNAL_ID_SET_2,
    type: 'set',
    datasource: {
      values: datasource_multiple
    }
  },
  {
    external_id: EXTERNAL_ID_SET_3,
    type: 'set',
    datasource: {
      values: datasource_multiple
    }
  }
];

const api = cloudinary.v2.api;

function createMetadataFieldForTest(field) {
  if (!field.label) {
    field.label = field.external_id;
  }
  return api.add_metadata_field(field);
}

describe("structured metadata api", function () {
  this.timeout(TIMEOUT.LARGE);

  before(function () {
    // Create the metadata fields required for the tests
    return Q.allSettled(
      metadata_fields_to_create.map(field => createMetadataFieldForTest(field))
    ).finally(function () {
    });
  });

  after(function () {
    // Delete all metadata fields created during testing
    return Q.allSettled(
      metadata_fields_external_ids.map(field => api.delete_metadata_field(field))
    ).finally(function () {
    });
  });

  describe("list_metadata_fields", function () {
    it("should return all metadata field definitions", function () {
      const expectedPath = `/metadata_fields$`;
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        api.list_metadata_fields();
        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match("GET")
        }));
      });
    });
  });

  describe("metadata_field_by_field_id", function () {
    it("should return metadata field by external id", function () {
      return api.metadata_field_by_field_id(EXTERNAL_ID_GENERAL)
        .then((result) => {
          expect([result, {label: EXTERNAL_ID_GENERAL}]).to.beAMetadataField();
        });
    });
  });

  describe("add_metadata_field", function () {
    const expectedPath = "/metadata_fields$";
    it("should create string metadata field", function () {
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        const metadata = {
          external_id: EXTERNAL_ID_STRING,
          label: EXTERNAL_ID_STRING,
          type: 'string'
        };
        api.add_metadata_field(metadata);
        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match("POST")
        }));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('external_id', EXTERNAL_ID_STRING)));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('type', 'string')));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('label', EXTERNAL_ID_STRING)));
      });
    });
    it("should create integer metadata field", function () {
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        const metadata = {
          external_id: EXTERNAL_ID_INT,
          label: EXTERNAL_ID_INT,
          type: 'integer'
        };
        api.add_metadata_field(metadata);
        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match("POST")
        }));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('external_id', EXTERNAL_ID_INT)));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('type', 'integer')));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('label', EXTERNAL_ID_INT)));
      });
    });
    it("should create date metadata field", function () {
      const metadata = {
        external_id: EXTERNAL_ID_DATE,
        label: EXTERNAL_ID_DATE,
        type: 'date'
      };
      return api.add_metadata_field(metadata).then((result) => {
        expect(result).to.beAMetadataField();
        return api.metadata_field_by_field_id(EXTERNAL_ID_DATE);
      }).then((result) => {
        expect([result, {
          ...metadata,
          mandatory: false
        }]).to.beAMetadataField();
      });
    });
    it("should create enum metadata field", function () {
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        const metadata = {
          datasource: {
            values: datasource_single
          },
          external_id: EXTERNAL_ID_ENUM,
          label: EXTERNAL_ID_ENUM,
          type: 'enum'
        };
        api.add_metadata_field(metadata);
        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match("POST")
        }));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('external_id', EXTERNAL_ID_ENUM)));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('type', 'enum')));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('label', EXTERNAL_ID_ENUM)));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher('datasource', {values: datasource_single})));
      });
    });
    it("should create set metadata field", function () {
      const metadata = {
        datasource: {
          values: datasource_multiple
        },
        external_id: EXTERNAL_ID_SET,
        label: EXTERNAL_ID_SET,
        type: 'set'
      };
      return api.add_metadata_field(metadata).then((result) => {
        expect(result).to.beAMetadataField();
        return api.metadata_field_by_field_id(EXTERNAL_ID_SET);
      }).then((result) => {
        expect([result, {
          external_id: EXTERNAL_ID_SET,
          label: EXTERNAL_ID_SET,
          type: 'set',
          mandatory: false
        }]).to.beAMetadataField();
      });
    });
  });

  describe("update_metadata_field", function () {
    it("should update metadata field by external id", function () {
      const newLabel = 'update_metadata_test_new_label' + EXTERNAL_ID_GENERAL;
      const newDefaultValue = 'update_metadata_test_new_default_value' + EXTERNAL_ID_GENERAL;
      const updatedMetadata = {
        external_id: EXTERNAL_ID_SET,
        label: newLabel,
        type: 'integer',
        mandatory: true,
        default_value: newDefaultValue
      };
      return api.update_metadata_field(EXTERNAL_ID_GENERAL, updatedMetadata)
        .then((result) => {
          expect(result).to.beAMetadataField();
          return api.metadata_field_by_field_id(EXTERNAL_ID_GENERAL);
        })
        .then((result) => {
          expect([result, {
            external_id: EXTERNAL_ID_GENERAL,
            label: newLabel,
            type: 'string',
            mandatory: true,
            default_value: newDefaultValue
          }]).to.beAMetadataField();
        });
    });
  });

  describe("update_metadata_field_datasource", function () {
    it("should update metadata field datasource by external id", function () {
      return api.update_metadata_field_datasource(EXTERNAL_ID_ENUM_2, {values: datasource_single})
        .then(() => api.metadata_field_by_field_id(EXTERNAL_ID_ENUM_2))
        .then((result) => {
          expect(result.datasource).to.beADatasource();
          expect([result.datasource.values[0], datasource_single[0]]);
        });
    });
  });

  describe("delete_metadata_field", function () {
    it("should delete metadata field by external id", function () {
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        const expectedPath = `/metadata_fields/${EXTERNAL_ID_DELETE}$`;
        api.delete_metadata_field(EXTERNAL_ID_DELETE);
        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match("DELETE")
        }));
      });
    });
    it("should delete metadata field and fail when attempting to create a new one with the same external id", function () {
      const metadata = {
        external_id: EXTERNAL_ID_DELETE_2,
        label: EXTERNAL_ID_DELETE_2,
        type: 'integer'
      };
      return api.delete_metadata_field(EXTERNAL_ID_DELETE_2)
        .then((result) => {
          expect(result).not.to.be.empty();
          expect(result.message).to.eql("ok");
          return api.add_metadata_field(metadata);
        })
        .catch(({error}) => {
          expect(error).not.to.be(void 0);
          expect(error.http_code).to.eql(400);
          expect(error.message).to.contain(`external id ${EXTERNAL_ID_DELETE_2} already exists`);
        });
    });
  });

  describe("delete_datasource_entries", function () {
    it("should delete entries in metadata field datasource", function () {
      return api.delete_datasource_entries(EXTERNAL_ID_SET_2, [DATASOURCE_ENTRY_EXTERNAL_ID])
        .then((result) => {
          expect(result).not.to.be.empty();
          expect(result).to.beADatasource();
          expect(result.values.length).to.eql(datasource_multiple.length - 1);
          expect(result.values[0].value).to.eql(datasource_multiple[1].value);
          expect(result.values[1].value).to.eql(datasource_multiple[2].value);
        });
    });
  });

  describe("date_field_validation", function () {
    const pastDate = helper.toISO8601DateOnly(Date.now() - 60000 * 60 * 24 * 3);
    const yesterdayDate = helper.toISO8601DateOnly(Date.now() - 60000 * 60 * 24);
    const todayDate = helper.toISO8601DateOnly(Date.now());
    const futureDate = helper.toISO8601DateOnly(Date.now() + 60000 * 60 * 24 * 3);
    const lastThreeDaysValidation = {
      type: "and",
      rules: [
        {
          type: "greater_than",
          equals: false,
          value: pastDate
        }, {
          type: "less_than",
          equals: false,
          value: todayDate
        }
      ]
    };
    const validMetadata = {
      external_id: EXTERNAL_ID_DATE_VALIDATION,
      label: EXTERNAL_ID_DATE_VALIDATION,
      type: 'date',
      default_value: yesterdayDate,
      validation: lastThreeDaysValidation
    };
    const invalidMetadata = {
      ...validMetadata,
      external_id: EXTERNAL_ID_DATE_VALIDATION_2,
      default_value: futureDate
    };
    it("should create date field when default value validation passes", function () {
      return api.add_metadata_field(validMetadata)
        .then((result) => {
          expect(result).to.beAMetadataField();
          return api.metadata_field_by_field_id(EXTERNAL_ID_DATE_VALIDATION);
        })
        .then((result) => {
          expect(result).to.beAMetadataField();
          expect(result.default_value).to.eql(validMetadata.default_value);
          expect(result.validation).to.eql(lastThreeDaysValidation);
        });
    });
    it("should not create date field with illegal default value", function () {
      return api.add_metadata_field(invalidMetadata).then(() => {
        expect().fail();
      }).catch((res) => {
        expect(res.error).not.to.be(void 0);
        expect(res.error.message).to.contain("default_value is invalid");
      });
    });
  });

  describe("integer_field_validation", function () {
    const validation = {
      type: 'less_than',
      equals: true,
      value: 5
    };
    it("should create integer metadata with valid default value", function () {
      const metadata = {
        external_id: EXTERNAL_ID_INT_VALIDATION,
        label: EXTERNAL_ID_INT_VALIDATION,
        type: 'integer',
        default_value: 5,
        validation
      };
      return api.add_metadata_field(metadata)
        .then((result) => {
          expect(result).to.beAMetadataField();
          return api.metadata_field_by_field_id(EXTERNAL_ID_INT_VALIDATION);
        }).then((result) => {
          expect(result).to.beAMetadataField();
          expect(result.validation).to.eql(metadata.validation);
          expect(result.default_value).to.eql(metadata.default_value);
        });
    });
    it("should not create integer metadata with invalid default value", function () {
      const metadata = {
        external_id: EXTERNAL_ID_INT_VALIDATION_2,
        label: EXTERNAL_ID_INT_VALIDATION_2,
        type: 'integer',
        default_value: 6,
        validation
      };
      return api.add_metadata_field(metadata)
        .then((result) => {
          expect(result).to.beAMetadataField();
          return api.metadata_field_by_field_id(EXTERNAL_ID_INT_VALIDATION_2);
        }).catch(({error}) => {
          expect(error).not.to.be(void 0);
          expect(error.http_code).to.eql(400);
          expect(error.message).to.contain(`default_value is invalid`);
        });
    });
  });

  describe("order_metadata_field_datasource", function () {
    it("should sort by asc in a metadata field datasource", function () {
      // datasource is set with values in the order v2, v3, v4
      return api.order_metadata_field_datasource(EXTERNAL_ID_SET_3, 'value', 'asc')
        .then((result) => {
          expect(result).to.beADatasource();
          // ascending order means v2 is the first value
          expect(result.values[0].value).to.eql('v2');
        })
    });

    it("should sort by desc in a metadata field datasource", function () {
      // datasource is set with values in the order v2, v3, v4
      return api.order_metadata_field_datasource(EXTERNAL_ID_SET_3, 'value', 'desc')
        .then((result) => {
          expect(result).to.beADatasource();
          // descending order means v4 is the first value
          expect(result.values[0].value).to.eql('v4');
        })
    });
  });

  describe("reorder_metadata_fields", function () {
    const pathname = /\/metadata_fields\/order$/
    const method = /^PUT$/

    it("should reorder the metadata fields for label order by asc", function () {
      helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
        api.reorder_metadata_fields("label", "asc");

        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(pathname),
          method: sinon.match(method)
        }));

        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher("order_by", "label")));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher("direction", "asc")));
      });
    });

    it("should reorder the metadata fields for external_id order by desc", function () {
      helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
        api.reorder_metadata_fields("external_id", "desc");

        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(pathname),
          method: sinon.match(method)
        }));

        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher("order_by", "external_id")));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher("direction", "desc")));
      });
    });

    it("should reorder the metadata fields for for created_at order by asc", function () {
      helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
        api.reorder_metadata_fields("created_at", "asc");

        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(pathname),
          method: sinon.match(method)
        }));

        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher("order_by", "created_at")));
        sinon.assert.calledWith(writeSpy, sinon.match(helper.apiJsonParamMatcher("direction", "asc")));
      });
    });
  });

  describe("restore_metadata_field_datasource", function () {
    it("should restore a deleted entry in a metadata field datasource", function () {
      return api.delete_datasource_entries(EXTERNAL_ID_SET_3, [DATASOURCE_ENTRY_EXTERNAL_ID])
        .then((result) => {
          expect(result).to.beADatasource();
          expect(result.values.length).to.eql(datasource_multiple.length - 1);
        })
        .then(() => api.restore_metadata_field_datasource(EXTERNAL_ID_SET_3, [DATASOURCE_ENTRY_EXTERNAL_ID]))
        .then((result) => {
          expect(result).to.beADatasource();
          expect(result.values.length).to.eql(datasource_multiple.length);
        });
    });
  });

  it('Should update an metadata field that is an array', (done) => {
    let metadata = {
      "external_id": EXTERNAL_ID_SET_4,
      "label": EXTERNAL_ID_SET_4,
      "type": "set",
      "datasource": {
        "values": [
          {
            "external_id": "1",
            "value": "Email",
            "state": "active"
          }
        ]
      }
    };

    api.add_metadata_field(metadata, (res, res2) => {
      cloudinary.v2.uploader.update_metadata({[EXTERNAL_ID_SET_4]: [1]}, ['sample'], (err, result) => {
        expect(typeof err).to.be('undefined');
        expect(result.public_ids[0]).to.equal('sample');
        done();
      })
    });
  });

  describe('rules', () => {
    it('should allow listing metadata rules', () => {
      const expectedPath = '/metadata_rules';
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        api.list_metadata_rules();
        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match('GET')
        }));
      });
    });

    it('should allow adding new metadata rules', () => {
      const expectedPath = '/metadata_rules';
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        const newMetadataRule = {
          metadata_field_id: 'field_id',
          name: 'rule_name',
          condition: {},
          result: {}
        };
        api.add_metadata_rule(newMetadataRule);

        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match('POST')
        }));

        sinon.assert.calledOnce(writeSpy);

        const firstCallArgs = JSON.parse(writeSpy.firstCall.args[0]);
        assert.deepStrictEqual(firstCallArgs, {
          metadata_field_id: 'field_id',
          name: 'rule_name',
          condition: {},
          result: {}
        });
      });
    });

    it('should allow editing metadata rules', () => {
      const expectedPath = '/metadata_rules/some-metadata-rule-id';
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        const ruleUpdate = {
          metadata_field_id: 'new_field_id',
          name: 'new_rule_name',
          condition: {},
          result: {},
          state: 'inactive'
        };
        api.update_metadata_rule('some-metadata-rule-id', ruleUpdate);

        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match('PUT')
        }));

        sinon.assert.calledOnce(writeSpy);

        const firstCallArgs = JSON.parse(writeSpy.firstCall.args[0]);
        assert.deepStrictEqual(firstCallArgs, {
          metadata_field_id: 'new_field_id',
          name: 'new_rule_name',
          condition: {},
          result: {},
          state: 'inactive'
        });
      });
    });

    it('should allow removing existing metadata rules', () => {
      const expectedPath = '/metadata_rules/some-metadata-rule-id';
      return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
        api.delete_metadata_rule('some-metadata-rule-id');
        sinon.assert.calledWith(requestSpy, sinon.match({
          pathname: sinon.match(new RegExp(expectedPath)),
          method: sinon.match('DELETE')
        }));
      });
    });
  });
});
