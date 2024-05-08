const assert = require('assert');
const sinon = require('sinon');

const cloudinary = require('../../../../lib/cloudinary');
const createTestConfig = require('../../../testUtils/createTestConfig');
const helper = require('../../../spechelper');
const api_http = require("https");
const ClientRequest = require('_http_client').ClientRequest;

describe('Admin API - Folders', () => {
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

  describe('rename_folder', () => {
    it('should send a request to update folder endpoint with correct parameters', () => {
      cloudinary.v2.api.rename_folder('old/path', 'new/path');

      sinon.assert.calledWith(mocked.request, sinon.match({
        pathname: sinon.match('old%2Fpath'),
        method: sinon.match('PUT')
      }));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('to_folder', 'new/path')));
    });
  });
});
