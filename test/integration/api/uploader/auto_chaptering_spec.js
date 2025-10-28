const assert = require('assert');
const sinon = require('sinon');

const cloudinary = require('../../../../lib/cloudinary');
const createTestConfig = require('../../../testUtils/createTestConfig');
const helper = require('../../../spechelper');
const { NOP } = require('../../../../lib/utils');
const ClientRequest = require('_http_client').ClientRequest;

describe('Uploader', () => {
  let spy;
  let xhr;

  before(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    spy = sinon.spy(ClientRequest.prototype, 'write');
  });

  after(() => {
    spy.restore();
    xhr.restore();
  });

  describe('upload', () => {
    it('should send a request with auto_chaptering set to true if requested', async () => {
      await cloudinary.v2.uploader.upload('irrelevant', { auto_chaptering: true }).catch(NOP);
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('auto_chaptering', '1')));
    });
  });

  describe('explicit', () => {
    it('should send a request with auto_chaptering set to true if requested', async () => {
      await cloudinary.v2.uploader.explicit('irrelevant', { auto_chaptering: true }).catch(NOP);
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('auto_chaptering', '1')));
    });
  });
});
