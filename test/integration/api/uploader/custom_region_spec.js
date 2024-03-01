const assert = require('assert');
const sinon = require('sinon');

const cloudinary = require('../../../../lib/cloudinary');
const createTestConfig = require('../../../testUtils/createTestConfig');
const helper = require('../../../spechelper');
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
    it('should send a request with encoded custom region gravity that represents a box', () => {
      cloudinary.v2.uploader.upload('irrelevant', {
        regions: {
          'box_1': [[1, 2], [3, 4]],
          'box_2': [[5, 6], [7, 8]]
        }
      });

      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('regions', JSON.stringify({
        'box_1': [[1, 2], [3, 4]],
        'box_2': [[5, 6], [7, 8]]
      }))));
    });

    it('should send a request with encoded custom region gravity that represents a custom shape', () => {
      cloudinary.v2.uploader.upload('irrelevant', {
        regions: {
          'custom_1': [[1, 2], [3, 4], [5, 6], [7, 8]],
          'custom_2': [[10, 11], [12, 13], [14, 15]]
        }
      });

      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('regions', JSON.stringify({
        'custom_1': [[1, 2], [3, 4], [5, 6], [7, 8]],
        'custom_2': [[10, 11], [12, 13], [14, 15]]
      }))));
    });
  });

  describe('explicit', () => {
    it('should send a request with encoded custom region gravity that represents a box', () => {
      cloudinary.v2.uploader.explicit('irrelevant', {
        regions: {
          'box_1': [[1, 2], [3, 4]],
          'box_2': [[5, 6], [7, 8]]
        }
      });

      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('regions', JSON.stringify({
        'box_1': [[1, 2], [3, 4]],
        'box_2': [[5, 6], [7, 8]]
      }))));
    });

    it('should send a request with encoded custom region gravity that represents a custom shape', () => {
      cloudinary.v2.uploader.explicit('irrelevant', {
        regions: {
          'custom_1': [[1, 2], [3, 4], [5, 6], [7, 8]],
          'custom_2': [[10, 11], [12, 13], [14, 15]]
        }
      });

      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('regions', JSON.stringify({
        'custom_1': [[1, 2], [3, 4], [5, 6], [7, 8]],
        'custom_2': [[10, 11], [12, 13], [14, 15]]
      }))));
    });
  });
});
