const cloneDeep = require('lodash/cloneDeep');
const cloudinary = require('../../../cloudinary');

expect.Assertion.prototype.produceUrl = function (url) {
  var actual, actualOptions, options, public_id;
  [public_id, options] = this.obj;
  actualOptions = cloneDeep(options);
  actual = cloudinary.url(public_id, actualOptions);
  this.assert(actual.match(url), function () {
    return `expected '${public_id}' and ${JSON.stringify(options)} to produce '${url}' but got '${actual}'`;
  }, function () {
    return `expected '${public_id}' and ${JSON.stringify(options)} not to produce '${url}' but got '${actual}'`;
  });
  return this;
};
