const assert = require('assert');
const sinon = require('sinon');
const { Readable, Writable } = require('stream');
const https = require('https');

const cloudinary = require('../../cloudinary');
const createTestConfig = require('../testUtils/createTestConfig');

// Give each request a fake HTTP 500 response. No network call occurs.
function fakeErrorRequest(options, onResponse) {
  const request = new Writable({
    write(chunk, encoding, done) {
      done();
    }
  });
  request.setTimeout = () => request;
  request.abort = () => {};
  request.on('finish', () => {
    const response = new Readable({
      read() {}
    });
    response.statusCode = 500;
    response.headers = {};
    onResponse(response);
    response.push('{"error":{"message":"boom"}}');
    response.push(null);
  });
  return request;
}

describe('upload of a Blob', function () {
  let requestStub;

  before(function () {
    if (typeof Blob === 'undefined') {
      this.skip();
    }
  });

  beforeEach(function () {
    cloudinary.config(createTestConfig());
    requestStub = sinon.stub(https, 'request').callsFake(fakeErrorRequest);
  });

  afterEach(function () {
    requestStub.restore();
  });

  it('should call the callback one time when the upload fails', async function () {
    const callback = sinon.spy();
    const blob = new Blob(['sample'], { type: 'text/plain' });

    await assert.rejects(cloudinary.v2.uploader.upload(blob, callback), { message: 'boom' });

    sinon.assert.calledOnce(callback);
    sinon.assert.calledWith(callback, sinon.match({ message: 'boom', http_code: 500 }));
  });
});
