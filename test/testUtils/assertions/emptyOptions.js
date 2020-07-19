const isEmpty = require("lodash/isEmpty");
const cloneDeep = require('lodash/cloneDeep');
const utils = require('../../../cloudinary').utils;

expect.Assertion.prototype.emptyOptions = function () {
  var actual, options, public_id;
  [public_id, options] = this.obj;
  actual = cloneDeep(options);
  utils.url(public_id, actual);
  this.assert(isEmpty(actual), function () {
    return `expected '${public_id}' and ${JSON.stringify(options)} to produce empty options but got ${JSON.stringify(actual)}`;
  }, function () {
    return `expected '${public_id}' and ${JSON.stringify(options)} not to produce empty options`;
  });
  return this;
};
