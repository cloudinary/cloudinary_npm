const assert = require('assert');
const sinon = require('sinon');

const cloudinary = require('../../lib/cloudinary');
const createTestConfig = require('../testUtils/createTestConfig');
const helper = require('../spechelper');
const api_http = require("https");
const ClientRequest = require('_http_client').ClientRequest;

describe('api restore handlers', function () {
  const mocked = {};

  beforeEach(function () {
    cloudinary.config(createTestConfig());
    mocked.xhr = sinon.useFakeXMLHttpRequest();
    mocked.write = sinon.spy(ClientRequest.prototype, 'write');
    mocked.request = sinon.spy(api_http, 'request');
  });

  afterEach(function () {
    mocked.request.restore();
    mocked.write.restore();
    mocked.xhr.restore();
  });

  describe('.restore', function () {
    it('sends public_ids and versions with JSON payload', function () {
      const options = {
        resource_type: 'video',
        type: 'authenticated',
        versions: ['ver-1', 'ver-2']
      };

      cloudinary.v2.api.restore(['pub-1', 'pub-2'], options);

      sinon.assert.calledWith(mocked.request, sinon.match({
        pathname: sinon.match('resources/video/authenticated/restore'),
        method: sinon.match('POST')
      }));

      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('public_ids', ['pub-1', 'pub-2'])));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('versions', ['ver-1', 'ver-2'])));
    });
  });

  describe('.restore_by_asset_ids', function () {
    it('sends asset_ids and versions with JSON payload', function () {
      const options = { versions: ['ver-3'] };
      const assetIds = ['asset-1', 'asset-2'];

      cloudinary.v2.api.restore_by_asset_ids(assetIds, options);

      sinon.assert.calledWith(mocked.request, sinon.match({
        pathname: sinon.match('resources/restore'),
        method: sinon.match('POST')
      }));

      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('asset_ids', assetIds)));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('versions', ['ver-3'])));
    });

    it('wraps a single asset id into an array before calling the API', function () {
      cloudinary.v2.api.restore_by_asset_ids('single-asset-id');

      sinon.assert.calledWith(mocked.request, sinon.match({
        pathname: sinon.match('resources/restore'),
        method: sinon.match('POST')
      }));

      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('asset_ids', ['single-asset-id'])));
    });
  });
});
