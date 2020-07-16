const cloneDeep = require('lodash/cloneDeep');
const http = require('http');
const https = require('https');
const cloudinary = require('../../../cloudinary');


expect.Assertion.prototype.beServedByCloudinary = function (done) {
  var actual, actualOptions, callHttp, options, public_id;
  [public_id, options] = this.obj;
  actualOptions = cloneDeep(options);
  actual = cloudinary.url(public_id, actualOptions);
  if (actual.startsWith("https")) {
    callHttp = https;
  } else {
    callHttp = http;
  }
  callHttp.get(actual, (res) => {
    this.assert(res.statusCode === 200, function () {
      return `Expected to get ${actual} but server responded with "${res.statusCode}: ${res.headers['x-cld-error']}"`;
    }, function () {
      return `Expeted not to get ${actual}.`;
    });
    return done();
  });
  return this;
};
