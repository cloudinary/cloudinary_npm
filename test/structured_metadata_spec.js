const expect = require("expect.js");
const Q = require('q');
const cloudinary = require("../cloudinary");
const helper = require("./spechelper");

const IMAGE_FILE = helper.IMAGE_FILE;

const SUFFIX = helper.SUFFIX;
const EXTERNAL_ID_PREFIX = "metadata";
const EXTERNAL_ID = EXTERNAL_ID_PREFIX + SUFFIX;
const EXTERNAL_ID_1 = EXTERNAL_ID + "_1";
const EXTERNAL_ID_2 = EXTERNAL_ID + "_2";
const EXTERNAL_ID_3 = EXTERNAL_ID + "_3";
const EXTERNAL_ID_4 = EXTERNAL_ID + "_4";
const EXTERNAL_ID_5 = EXTERNAL_ID + "_5";
const EXTERNAL_ID_6 = EXTERNAL_ID + "_6";
const EXTERNAL_ID_7 = EXTERNAL_ID + "_7";
const EXTERNAL_ID_8 = EXTERNAL_ID + "_8";
const EXTERNAL_ID_9 = EXTERNAL_ID + "_9";
const EXTERNAL_ID_10 = EXTERNAL_ID + "_10";
const EXTERNAL_ID_11 = EXTERNAL_ID + "_11";
const EXTERNAL_ID_12 = EXTERNAL_ID + "_12";
const EXTERNAL_ID_13 = EXTERNAL_ID + "_13";
const EXTERNAL_ID_14 = EXTERNAL_ID + "_14";

const api = cloudinary.v2.api;
const uploader = cloudinary.v2.uploader;

describe("structured metadata api", function () {
  const mandatory_fields = ['type', 'external_id', 'label', 'mandatory', 'default_value', 'validation'];
  this.timeout(helper.TIMEOUT_MEDIUM);
  after(function () {
    return Q.allSettled(
      [
        api.delete_metadata_field(EXTERNAL_ID_1),
        api.delete_metadata_field(EXTERNAL_ID_2),
        api.delete_metadata_field(EXTERNAL_ID_3),
        api.delete_metadata_field(EXTERNAL_ID_5),
        api.delete_metadata_field(EXTERNAL_ID_6),
        api.delete_metadata_field(EXTERNAL_ID_7),
        api.delete_metadata_field(EXTERNAL_ID_9),
        api.delete_metadata_field(EXTERNAL_ID_10),
        api.delete_metadata_field(EXTERNAL_ID_11),
        api.delete_metadata_field(EXTERNAL_ID_12),
        api.delete_metadata_field(EXTERNAL_ID_13),
        api.delete_metadata_field(EXTERNAL_ID_14),
      ]
    ).finally(function () {});
  });

  it("should create metadata", function () {
    const metadataArr = [
      {
        external_id: EXTERNAL_ID_1,
        label: "color",
        type: "string",
        default_value: "blue",
      }, {
        external_id: EXTERNAL_ID_2,
        label: "text",
        type: "string",
      },
    ];
    const labels = metadataArr.map(item => item.label);
    return Promise.all(metadataArr.map(field => api.add_metadata_field(field))).then((results) => {
      expect(results).not.to.be.empty();
      results.forEach((res) => {
        expect(res).not.to.be.empty();
        expect(labels).to.contain(res.label);
      });
    });
  });
  describe("date_field_validation", function () {
    const maxValidDate = '2000-01-01';
    const minValidDate = '1950-01-01';
    const validDate = '1980-04-20';
    const invalidDate = '1940-01-20';
    const validMetadata = {
      external_id: EXTERNAL_ID_3,
      label: "dateOfBirth",
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
      external_id: EXTERNAL_ID_4,
      label: "dateOfBirth",
      type: "date",
      mandatory: true,
      default_value: invalidDate,
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
    it("should create date field with default value", function () {
      return api.add_metadata_field(validMetadata).then((result) => {
        expect(result).not.to.be.empty();
        expect(result.label).to.eql(validMetadata.label);
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
  it("should return list metadata field definitions", function () {
    return api.add_metadata_field({
      external_id: EXTERNAL_ID_5,
      label: "age",
      type: "integer",
      default_value: 10,
    }).then(() => api.list_metadata_fields())
      .then((result) => {
        expect(result).not.to.be.empty();
        expect(result.metadata_fields).not.to.be.empty();
        result.metadata_fields.forEach((field) => {
          expect(field).to.include.keys(...mandatory_fields);
        });
      });
  });
  it("should return metadata field by external id", function () {
    return api.add_metadata_field({
      external_id: EXTERNAL_ID_6,
      label: "length",
      type: "integer",
      default_value: 1,
    }).then(({ external_id, label }) => {
      expect(label).to.eql("length");
      return api.metadata_field_by_field_id(external_id);
    }).then((result) => {
      expect(result).not.to.be.empty();
      expect(result).to.include.keys(...mandatory_fields);
    });
  });
  it("should update metadata field by external id", function () {
    const metadata = {
      default_value: 10,
    };
    return api.add_metadata_field({
      external_id: EXTERNAL_ID_7,
      label: "width",
      type: "integer",
      default_value: 1,
    }).then(({ external_id }) => api.update_metadata_field(external_id, metadata))
      .then((result) => {
        expect(result).not.to.be.empty();
        expect(result).to.include.keys(...mandatory_fields);
        expect(result.label).to.eql("width");
        expect(result.default_value).to.eql(metadata.default_value);
      });
  });
  it("should delete metadata field by external id", function () {
    return api.add_metadata_field({
      external_id: EXTERNAL_ID_8,
      label: "height",
      type: "integer",
      default_value: 6,
    }).then(({ external_id }) => api.delete_metadata_field(external_id))
      .then((result) => {
        expect(result).not.to.be.empty();
        expect(result.message).to.eql("ok");
      });
  });
  it("should update metadata field datasource by external id", function () {
    const new_datasource = {
      values: [
        { external_id: "color_1", value: "brown" },
        { external_id: "color_2", value: "black" },
      ],
    };
    return api.add_metadata_field({
      external_id: EXTERNAL_ID_9,
      label: "colors",
      type: "set",
      datasource: {
        values: [
          { external_id: "color_1", value: "red" },
          { external_id: "color_2", value: "blue" },
        ],
      },
    }).then(({ external_id }) => api.update_metadata_field_datasource(external_id, new_datasource))
      .then((result) => {
        expect(result).not.to.be.empty();
        expect(result.values).not.to.be.empty();
        result.values.forEach((item) => {
          let before_update_value = new_datasource.values.find(val => val.external_id === item.external_id);
          expect(item.value).to.eql(before_update_value.value);
        });
      });
  });
  it("should delete entries in metadata field datasource", function () {
    const metadata = {
      external_id: EXTERNAL_ID_10,
      label: "size",
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
    const external_ids = [metadata.datasource.values[0].external_id];
    return api.add_metadata_field(metadata)
      .then(({ external_id }) => api.delete_datasource_entries(external_id, external_ids))
      .then((result) => {
        expect(result).not.to.be.empty();
      });
  });
  it("should update metadata", function () {
    const metadata = {
      external_id: EXTERNAL_ID_11,
      label: "figure",
      type: "string",
    };
    const public_id = "sample";
    return api.add_metadata_field(metadata).then(({ external_id }) => api.update(public_id, {
      type: "upload",
      metadata: { [external_id]: "123456" },
    }))
      .then((result) => {
        expect(result).not.to.be.empty();
        expect(result.metadata[EXTERNAL_ID_11]).to.eql("123456");
      });
  });
  it("should update metadata via uploader", function () {
    const metadata = {
      external_id: EXTERNAL_ID_12,
      label: "subject",
      type: "string",
    };
    const public_id = "sample";
    return api.add_metadata_field(metadata).then(({ external_id }) => uploader.update_metadata({ [external_id]: "123456" }, [public_id]))
      .then((result) => {
        expect(result).not.to.be.empty();
        expect(result.public_ids[0]).to.eql(public_id);
      });
  });
  it("should upload image with metadata option", function () {
    const metadata = {
      external_id: EXTERNAL_ID_13,
      label: "input",
      type: "string",
    };
    return api.add_metadata_field(metadata).then(({ external_id }) => uploader.upload(IMAGE_FILE, {
      tags: 'metadata_sample',
      metadata: { [external_id]: "123456" },
    }))
      .then(function (result) {
        expect(result).not.to.be.empty();
        expect(result.metadata[EXTERNAL_ID_13]).to.eql("123456");
      });
  });
  it("should successfully call explicit api with metadata option", function () {
    const metadata = {
      external_id: EXTERNAL_ID_14,
      label: "field",
      type: "string",
    };
    return api.add_metadata_field(metadata).then(({ external_id }) => uploader.explicit("sample", {
      type: "upload",
      metadata: { [external_id]: "123456" },
    }))
      .then(function (result) {
        expect(result).not.to.be.empty();
        expect(result.metadata[EXTERNAL_ID_14]).to.eql("123456");
      });
  });
});
