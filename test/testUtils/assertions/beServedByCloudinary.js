const cloneDeep = require('lodash/cloneDeep');
const http = require('http');
const https = require('https');
const cloudinary = require('../../../cloudinary');
const { REQ_TIMEOUT_IN_TEST } = require('../constants');


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
  const req = callHttp.get(actual, (res) => {
    res.on('data', () => { });
    res.on('end', () => {
      this.assert(res.statusCode === 200, function () {
        return `Expected to get ${actual} but server responded with "${res.statusCode}: ${res.headers['x-cld-error']}"`;
      }, function () {
        return `Expeted not to get ${actual}.`;
      });
      return done();
    });
    res.on('error', (e) => done(e));
    res.resume();
  });

  req.setTimeout(REQ_TIMEOUT_IN_TEST, () => {
    req.destroy(new Error(`Request timed out after ${REQ_TIMEOUT_IN_TEST}ms: ${actual}`));
  });

  req.on('error', (e) => done(e));

  return this;
};
