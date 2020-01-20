const expect = require("expect.js");
const Q = require('q');
const cloudinary = require("../cloudinary");
const helper = require("./spechelper");

const TEST_ID = Date.now();
const TEST_TAG = helper.TEST_TAG;
const UPLOAD_TAGS = helper.UPLOAD_TAGS;
const uploadImage = helper.uploadImage;
const EXTERNAL_ID_CREATE = 'metadata_create_' + TEST_ID;
const EXTERNAL_ID_CREATE_2 = 'metadata_create_2_' + TEST_ID;
const EXTERNAL_ID_DATE_VALIDATION = 'metadata_validate_date_' + TEST_ID;
const EXTERNAL_ID_DATE_VALIDATION_2 = 'metadata_validate_date_2_' + TEST_ID;
const EXTERNAL_ID_GET_LIST = 'metadata_list_' + TEST_ID;
const EXTERNAL_ID_GET_FIELD = 'metadata_get_by_id_' + TEST_ID;
const EXTERNAL_ID_UPDATE_BY_ID = 'metadata_update_by_id_' + TEST_ID;
const EXTERNAL_ID_DELETE = 'metadata_delete_' + TEST_ID;
const EXTERNAL_ID_UPDATE_DATASOURCE = 'metadata_datasource_update_' + TEST_ID;
const EXTERNAL_ID_DELETE_DATASOURCE_ENTRIES = 'metadata_delete_datasource_entries_' + TEST_ID;
const EXTERNAL_ID_RESTORE_DATASOURCE_ENTRIES = 'metadata_restore_datasource_entries_' + TEST_ID;
const EXTERNAL_ID_UPDATE = 'metadata_update_' + TEST_ID;
const PUBLIC_ID_UPLOAD = "metadata_upload_" + TEST_ID;
const LABEL_INT_1 = 'metadata_label_1_' + TEST_ID;
const LABEL_INT_2 = 'metadata_label_2_' + TEST_ID;
const LABEL_INT_3 = 'metadata_label_3_' + TEST_ID;
const LABEL_INT_4 = 'metadata_label_4_' + TEST_ID;
const LABEL_SET_1 = 'metadata_set_1_' + TEST_ID;
const LABEL_SET_2 = 'metadata_set_2_' + TEST_ID;
const LABEL_SET_3 = 'metadata_set_3_' + TEST_ID;
const LABEL_STRING_1 = 'metadata_string_1_' + TEST_ID;
const LABEL_STRING_2 = 'metadata_string_2_' + TEST_ID;
const LABEL_STRING_3 = 'metadata_string_3_' + TEST_ID;
const LABEL_DATE = 'metadata_date_' + TEST_ID;

const api = cloudinary.v2.api;

describe("structured metadata api", function () {
  this.timeout(helper.TIMEOUT_LARGE);

  before(function () {
    return Q.allSettled(
      [
        api.add_metadata_field({
          external_id: EXTERNAL_ID_GET_LIST,
          label: LABEL_INT_1,
          type: "integer",
          default_value: 10,
        }),
        api.add_metadata_field({
          external_id: EXTERNAL_ID_GET_FIELD,
          label: LABEL_INT_2,
          type: "integer",
          default_value: 1,
        }),
        api.add_metadata_field({
          external_id: EXTERNAL_ID_UPDATE_BY_ID,
          label: LABEL_INT_3,
          type: "integer",
          default_value: 1,
        }),
        api.add_metadata_field({
          external_id: EXTERNAL_ID_DELETE,
          label: LABEL_INT_4,
          type: "integer",
          default_value: 6,
        }),
        api.add_metadata_field({
          external_id: EXTERNAL_ID_UPDATE_DATASOURCE,
          label: LABEL_SET_1,
          type: "set",
          datasource: {
            values: [
              { external_id: "color_1", value: "red" },
              { external_id: "color_2", value: "blue" },
            ],
          },
        }),
        api.add_metadata_field({
          external_id: EXTERNAL_ID_UPDATE,
          label: LABEL_STRING_1,
          type: "string",
        }),
        uploadImage({
          public_id: PUBLIC_ID_UPLOAD,
          tags: UPLOAD_TAGS,
        }),
      ]
    ).finally(function () {});
  });

  after(function () {
    // Delete all metadata fields created during the test
    return Q.allSettled(
      [
        EXTERNAL_ID_CREATE,
        EXTERNAL_ID_CREATE_2,
        EXTERNAL_ID_DATE_VALIDATION,
        EXTERNAL_ID_DATE_VALIDATION_2,
        EXTERNAL_ID_GET_LIST,
        EXTERNAL_ID_GET_FIELD,
        EXTERNAL_ID_UPDATE_BY_ID,
        EXTERNAL_ID_DELETE,
        EXTERNAL_ID_UPDATE_DATASOURCE,
        EXTERNAL_ID_DELETE_DATASOURCE_ENTRIES,
        EXTERNAL_ID_RESTORE_DATASOURCE_ENTRIES,
        EXTERNAL_ID_UPDATE,
      ].map(field => api.delete_metadata_field(field))
    ).then(function () {
      return api.delete_resources_by_tag(TEST_TAG);
    }).finally(function () {});
  });

  describe("add metadata field", function () {
    it("should create metadata", function () {
      const metadataFields = [
        {
          external_id: EXTERNAL_ID_CREATE,
          label: LABEL_STRING_2,
          type: "string",
          default_value: "blue",
        }, {
          external_id: EXTERNAL_ID_CREATE_2,
          label: LABEL_STRING_3,
          type: "string",
        },
      ];
      return Q.all(metadataFields.map(field => api.add_metadata_field(field)))
        .then((results) => {
          expect([results[0], metadataFields[0]]).to.beAMetadataField();
          expect([results[1], metadataFields[1]]).to.beAMetadataField();
          return Q.all(
            [
              api.metadata_field_by_field_id(EXTERNAL_ID_CREATE),
              api.metadata_field_by_field_id(EXTERNAL_ID_CREATE_2),
            ]
          );
        })
        .then((results) => {
          expect([results[0], metadataFields[0]]).to.beAMetadataField();
          expect([results[1], metadataFields[1]]).to.beAMetadataField();
        });
    });

    describe("date_field_validation", function () {
      const maxValidDate = '2000-01-01';
      const minValidDate = '1950-01-01';
      const validDate = '1980-04-20';
      const invalidDate = '1940-01-20';
      const validMetadata = {
        external_id: EXTERNAL_ID_DATE_VALIDATION,
        label: LABEL_DATE,
        type: "date",
        mandatory: true,
        default_value: validDate,
        validation: {
          type: "and",
          rules: [
            {
              type: "greater_than",
              value: minValidDate,
            }, {
              type: "less_than",
              value: maxValidDate,
            },
          ],
        },
      };
      const invalidMetadata = {
        ...validMetadata,
        external_id: EXTERNAL_ID_DATE_VALIDATION_2,
        default_value: invalidDate,
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
  });

  describe("list_metadata_fields", function () {
    it("should return all metadata field definitions", function () {
      return api.list_metadata_fields()
        .then((result) => {
          expect(result).not.to.be.empty();
          expect(result.metadata_fields).not.to.be.empty();
          expect(result.metadata_fields).to.be.an("array");
          result.metadata_fields.forEach((field) => {
            expect(field).to.beAMetadataField();
          });
        });
    });
  });

  describe("metadata_field_by_field_id", function () {
    it("should return metadata field by external id", function () {
      return api.metadata_field_by_field_id(EXTERNAL_ID_GET_FIELD)
        .then((result) => {
          expect([result, { external_id: EXTERNAL_ID_GET_FIELD }]).to.beAMetadataField();
        });
    });
  });

  describe("update_metadata_field", function () {
    it("should update metadata field by external id", function () {
      const metadataChanges = {
        default_value: 10,
      };
      return api.update_metadata_field(EXTERNAL_ID_UPDATE_BY_ID, metadataChanges)
        .then((result) => {
          expect([result, metadataChanges]).to.beAMetadataField();
          return api.metadata_field_by_field_id(EXTERNAL_ID_UPDATE_BY_ID);
        })
        .then((result) => {
          expect([result, metadataChanges]).to.beAMetadataField();
        });
    });
  });

  describe("delete_metadata_field", function () {
    it("should delete metadata field by external id", function () {
      return api.delete_metadata_field(EXTERNAL_ID_DELETE)
        .then((result) => {
          expect(result).not.to.be.empty();
          expect(result.message).to.eql("ok");
          return api.metadata_field_by_field_id(EXTERNAL_ID_DELETE);
        })
        .catch(({ error }) => {
          expect(error).not.to.be(void 0);
          expect(error.http_code).to.eql(404);
          expect(error.message).to.contain(`External ID ${EXTERNAL_ID_DELETE} doesn't exist`);
        });
    });
  });

  describe("update_metadata_field_datasource", function () {
    it("should update metadata field datasource by external id", function () {
      const datasource_changes = {
        values: [
          { external_id: "color_1", value: "brown" },
          { external_id: "color_2", value: "black" },
        ],
      };
      return api.update_metadata_field_datasource(EXTERNAL_ID_UPDATE_DATASOURCE, datasource_changes)
        .then((result) => {
          expect(result).not.to.be.empty();
          return api.metadata_field_by_field_id(EXTERNAL_ID_UPDATE_DATASOURCE);
        })
        .then((result) => {
          expect(result).to.beAMetadataField();
          result.datasource.values.forEach((item) => {
            const old_value = datasource_changes.values.find(val => val.external_id === item.external_id).value;
            expect(item.value).to.eql(old_value);
          });
        });
    });
  });

  describe("delete_datasource_entries", function () {
    it("should delete entries in metadata field datasource", function () {
      const metadata = {
        external_id: EXTERNAL_ID_DELETE_DATASOURCE_ENTRIES,
        label: LABEL_SET_3,
        type: "set",
        datasource: {
          values: [
            {
              external_id: "size_1",
              value: "big",
            },
            {
              external_id: "size_2",
              value: "small",
            },
          ],
        },
      };
      const external_ids_for_deletion = [metadata.datasource.values[0].external_id];
      return api.add_metadata_field(metadata)
        .then(() => api.delete_datasource_entries(EXTERNAL_ID_DELETE_DATASOURCE_ENTRIES, external_ids_for_deletion))
        .then((result) => {
          expect(result).not.to.be.empty();
          expect(result.values.length).to.eql(1);
          expect(result.values[0].external_id).to.eql(metadata.datasource.values[1].external_id);
        });
    });
  });

  describe("restore_metadata_field_datasource", function () {
    it("should restore a deleted entry in a metadata field datasource", function () {
      const metadata = {
        external_id: EXTERNAL_ID_RESTORE_DATASOURCE_ENTRIES,
        label: LABEL_SET_2,
        type: "set",
        datasource: {
          values: [
            {
              external_id: "size_1",
              value: "big",
            },
            {
              external_id: "size_2",
              value: "small",
            },
          ],
        },
      };
      const DELETED_ENTRY = [metadata.datasource.values[0].external_id];
      return api.add_metadata_field(metadata)
        .then(() => api.delete_datasource_entries(EXTERNAL_ID_RESTORE_DATASOURCE_ENTRIES, DELETED_ENTRY))
        .then((result) => {
          expect(result).not.to.be.empty();
          expect(result.values.length).to.eql(1);
          expect(result.values[0].external_id).to.eql(metadata.datasource.values[1].external_id);
        })
        .then(() => api.restore_metadata_field_datasource(EXTERNAL_ID_RESTORE_DATASOURCE_ENTRIES, DELETED_ENTRY))
        .then((result) => {
          expect(result).not.to.be.empty();
          expect(result.values.length).to.eql(2);
          expect(result.values[0].external_id).to.eql(metadata.datasource.values[0].external_id);
          expect(result.values[1].external_id).to.eql(metadata.datasource.values[1].external_id);
        });
    });
  });

  describe("api.update", function () {
    const METADATA_VALUE = "123456";
    it("should update metadata", function () {
      return api.update(PUBLIC_ID_UPLOAD, {
        metadata: { [EXTERNAL_ID_UPDATE]: METADATA_VALUE },
      })
        .then((result) => {
          expect(result).not.to.be.empty();
          return api.resource(PUBLIC_ID_UPLOAD);
        })
        .then((result) => {
          expect(result.metadata[EXTERNAL_ID_UPDATE]).to.eql(METADATA_VALUE);
        });
    });
  });
});
