const assert = require('assert');
const sinon = require('sinon');
const ClientRequest = require('_http_client').ClientRequest;
const api_http = require('https');

const cloudinary = require('../../../../cloudinary');
const helper = require('../../../spechelper');

describe('Analyze API', () => {
  describe('uri analysis', () => {
    const mocked = {};
    const config = {};

    beforeEach(function () {
      mocked.xhr = sinon.useFakeXMLHttpRequest();
      mocked.write = sinon.spy(ClientRequest.prototype, 'write');
      mocked.request = sinon.spy(api_http, 'request');

      config.cloud_name = cloudinary.config().cloud_name;
    });

    afterEach(function () {
      mocked.request.restore();
      mocked.write.restore();
      mocked.xhr.restore();
    });

    it('should call analyze endpoint with non-custom analysis_type', () => {
      cloudinary.analysis.analyze_uri('https://example.com', 'captioning');

      sinon.assert.calledWith(mocked.request, sinon.match({
        pathname: sinon.match(new RegExp(`/v2/${config.cloud_name}/analysis/analyze/uri`)),
        method: sinon.match('POST')
      }));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('uri', 'https://example.com')));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('analysis_type', 'captioning')));
    });

    it('should call analyze endpoint with custom analysis_type', () => {
      cloudinary.analysis.analyze_uri('https://example.com', 'custom', {
        model_name: 'my_model',
        model_version: 1
      });

      sinon.assert.calledWith(mocked.request, sinon.match({
        pathname: sinon.match(new RegExp(`/v2/${config.cloud_name}/analysis/analyze/uri`)),
        method: sinon.match('POST')
      }));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('uri', 'https://example.com')));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('analysis_type', 'custom')));
      sinon.assert.calledWith(mocked.write, sinon.match(helper.apiJsonParamMatcher('parameters', {
        custom: {
          model_name: 'my_model',
          model_version: 1
        }
      })));
    });

    it('should not allow calling analyze endpoint with incorrect custom analysis parameters', () => {
      assert.throws(() => {
        cloudinary.analysis.analyze_uri('https://example.com', 'custom');
      }, {
        message: 'Setting analysis_type to "custom" requires additional params: "model_name" and "model_version"'
      });
    });
  });
});
