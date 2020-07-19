const includes = require('lodash/includes');

/**
 * Asserts that a given object is a metadata field.
 * Optionally tests the values in the metadata field for equality
 *
 * @param {string} type The type of metadata field we expect
 * @returns {expect.Assertion}
 */
expect.Assertion.prototype.beAMetadataField = function (type = '') {
  let metadataField, expectedValues;
  if (Array.isArray(this.obj)) {
    [metadataField, expectedValues] = this.obj;
  } else {
    metadataField = this.obj;
  }
  // Check that all mandatory keys exist
  const mandatoryKeys = ['type', 'external_id', 'label', 'mandatory', 'default_value', 'validation'];
  mandatoryKeys.forEach((key) => {
    this.assert(key in metadataField, function () {
      return `expected metadata field to contain mandatory field: ${key}`;
    }, function () {
      return `expected metadata field not to contain a ${key} field`;
    });
  });

  // If type is enum or set test it
  if (includes(['enum', 'set'], metadataField.type)) {
    this.assert('datasource' in metadataField, function () {
      return `expected metadata field of type ${metadataField.type} to contain a datasource field`;
    }, function () {
      return `expected metadata field of type ${metadataField.type} not to contain a datasource field`;
    });
    expect(metadataField.datasource).to.beADatasource();
  }

  // Make sure type is acceptable
  if (type) {
    this.assert(type === metadataField.type, function () {
      return `expected metadata field type to equal ${type}`;
    }, function () {
      return `expected metadata field type ${metadataField.type} not to equal ${type}`;
    });
  } else {
    const acceptableTypes = ['string', 'integer', 'date', 'enum', 'set'];
    this.assert(includes(acceptableTypes, metadataField.type), function () {
      return `expected metadata field type to be one of ${acceptableTypes.join(', ')}. Unknown field type ${metadataField.type} received`;
    }, function () {
      return `expected metadata field not to be of a certain type`;
    });
  }
  // Verify object values
  if (expectedValues) {
    Object.entries(expectedValues).forEach(([key, value]) => {
      this.assert(metadataField[key] === value, function () {
        return `expected metadata field's ${key} to equal ${value} but got ${metadataField[key]} instead`;
      }, function () {
        return `expected metadata field's ${key} not to equal ${value}`;
      });
    });
  }

  return this;
};
