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

  describe('update_folder', () => {
    it('should send a request with correct parameters', () => {
      cloudinary.v2.api.update_folder('old/path', 'new/path');

      // sinon.assert.calledWith(xhr, sinon.match({
      //   pathname: sinon.match('old/path'),
      //   method: sinon.match('PUT')
      // }));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('to_folder', 'new/path')));
    });
  });
});
