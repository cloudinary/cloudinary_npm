const expect = require('expect.js');
const sinon = require('sinon');
const https = require('https');
const querystring = require('querystring');
const { EventEmitter } = require('events');
const cloudinary = require('../../lib/cloudinary');
const createTestConfig = require('../testUtils/createTestConfig');

describe('api.delete_derived_resources', function () {
  let requestStub;
  let writtenBody;

  beforeEach(function () {
    cloudinary.config(createTestConfig());
    writtenBody = '';

    // Replace https.request so no network call is made; capture the request body instead
    requestStub = sinon.stub(https, 'request').callsFake(function (options, callback) {
      const mockResponse = new EventEmitter();
      mockResponse.statusCode = 200;
      mockResponse.headers = {};

      const mockRequest = new EventEmitter();
      mockRequest.setTimeout = sinon.stub();
      mockRequest.write = function (chunk) {
        writtenBody += chunk;
      };
      mockRequest.end = function () {
        setTimeout(() => {
          callback(mockResponse);
          mockResponse.emit('data', JSON.stringify({ deleted: {} }));
          mockResponse.emit('end');
        }, 0);
      };

      return mockRequest;
    });
  });

  afterEach(function () {
    requestStub.restore();
  });

  it('sends a DELETE request to the derived_resources endpoint', async function () {
    await cloudinary.v2.api.delete_derived_resources(['derived-1']);

    sinon.assert.calledOnce(requestStub);
    const requestOptions = requestStub.firstCall.args[0];
    expect(requestOptions.method).to.be('DELETE');
    expect(requestOptions.pathname).to.match(/\/derived_resources$/);
  });

  it('sends derived_resource_ids[] in the request body', async function () {
    await cloudinary.v2.api.delete_derived_resources(['derived-1', 'derived-2']);

    const body = querystring.parse(writtenBody);
    expect(body['derived_resource_ids[]']).to.eql(['derived-1', 'derived-2']);
  });

  it('sends invalidate=true in the request body when passed in options', async function () {
    await cloudinary.v2.api.delete_derived_resources(['derived-1', 'derived-2'], { invalidate: true });

    const body = querystring.parse(writtenBody);
    expect(body.invalidate).to.be('true');
    expect(body['derived_resource_ids[]']).to.eql(['derived-1', 'derived-2']);
  });

  it('sends invalidate=false in the request body when explicitly set to false', async function () {
    await cloudinary.v2.api.delete_derived_resources(['derived-1'], { invalidate: false });

    const body = querystring.parse(writtenBody);
    expect(body.invalidate).to.be('false');
  });

  it('does not send invalidate when it is not passed', async function () {
    await cloudinary.v2.api.delete_derived_resources(['derived-1']);

    const body = querystring.parse(writtenBody);
    expect(body).not.to.have.key('invalidate');
  });

  it('does not send SDK configuration options such as timeout in the request body', async function () {
    await cloudinary.v2.api.delete_derived_resources(['derived-1'], { invalidate: true, timeout: 5000 });

    const body = querystring.parse(writtenBody);
    expect(body).not.to.have.key('timeout');
  });
});
