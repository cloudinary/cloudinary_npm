const isEmpty = require("lodash/isEmpty");
const includes = require('lodash/includes');


const ERRORS = {
  MUST_CONTAIN_VALUES: `expected datasource to contain mandatory field: 'values'`,
  MUST_NOT_CONTAIN_VALUES: `expected datasource not to contain a 'values' field`,
  INNER_VALUE_MUST_BE_STRING: `expected datasource to contain item with mandatory field 'value' type string`,
  INNER_VALUE_MUST_NOT_BE_STRING: `expected datasource not to contain item with mandatory field 'value' type string`,
  EXTERNAL_ID_MUST_BE_STRING: `expected datasource field to contain item with mandatory field: 'value' type string`,
  EXTERNAL_ID_MUST_NOT_BE_STRING: `expected datasource not to contain item with mandatory field 'external_id' type string`,
  STATE_MUST_BE_ONE_OF: (states, state) => `expected datasource field state to be one of ${states}. Unknown state ${state} received`,
  STATE_MUST_NOT_BE_ONE_OF: states => `expected datasource field state not to be of ${states}`
};

/**
 * Asserts that a given object is a datasource.
 *
 * @returns {expect.Assertion}
 */
expect.Assertion.prototype.beADatasource = function () {
  let datasource;
  datasource = this.obj;
  this.assert('values' in datasource, function () {
    return ERRORS.MUST_CONTAIN_VALUES;
  }, function () {
    return ERRORS.MUST_NOT_CONTAIN_VALUES;
  });

  if (!isEmpty(datasource.values)) {
    datasource.values.forEach((value) => {
      this.assert(typeof value.value === 'string', function () {
        return ERRORS.INNER_VALUE_MUST_BE_STRING;
      }, function () {
        return ERRORS.INNER_VALUE_MUST_NOT_BE_STRING;
      });
      this.assert(typeof value.external_id === 'string', function () {
        return ERRORS.EXTERNAL_ID_MUST_BE_STRING;
      }, function () {
        return ERRORS.EXTERNAL_ID_MUST_NOT_BE_STRING;
      });
      if (!isEmpty(value.state)) {
        const states = ['active', 'inactive'];
        this.assert(includes(states, value.state), function () {
          return ERRORS.STATE_MUST_BE_ONE_OF(states.join(', '), value.state);
        }, function () {
          return ERRORS.STATE_MUST_NOT_BE_ONE_OF(states.join(', '));
        });
      }
    });
  }
  return this;
};
