const sinon = require('sinon');

const cloudinary = require('../../../../lib/cloudinary');
const api_http = require("https");
const { NOP } = require('../../../../lib/utils');
const ClientRequest = require('_http_client').ClientRequest;

describe('Admin API - Config', () => {
  const mocked = {};

  beforeEach(function () {
    mocked.xhr = sinon.useFakeXMLHttpRequest();
    mocked.write = sinon.spy(ClientRequest.prototype, 'write');
    mocked.request = sinon.spy(api_http, 'request');
  });

  afterEach(function () {
    mocked.request.restore();
    mocked.write.restore();
    mocked.xhr.restore();
  });

  describe('config', () => {
    it('should send a request to config endpoint', async () => {
      await cloudinary.v2.api.config().catch(NOP);

      sinon.assert.calledWith(mocked.request, sinon.match({
        pathname: sinon.match('config'),
        method: sinon.match('GET'),
        query: sinon.match('')
      }));
    });

    it('should send a request to config endpoint with optional parameters', async () => {
      await cloudinary.v2.api.config({ settings: true }).catch(NOP);

      sinon.assert.calledWith(mocked.request, sinon.match({
        pathname: sinon.match('config'),
        method: sinon.match('GET'),
        query: sinon.match('settings=true')
      }));
    });
  });
});
