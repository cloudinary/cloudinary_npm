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
      const boxRegionGravityEncoded = '{box_1}1,2,3,4|{box_2}5,6,7,8';

      cloudinary.v2.uploader.upload('irrelevant', {
        regions: {
          'box_1': [[1, 2], [3, 4]],
          'box_2': [[5, 6], [7, 8]]
        }
      });

      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('regions', boxRegionGravityEncoded)));
    });

    it('should send a request with encoded custom region gravity that represents a custom shape', () => {
      const customRegionGravityEncoded = '{custom_1}1,2,3,4,5,6,7,8|{custom_2}10,11,12,13,14,15';

      cloudinary.v2.uploader.upload('irrelevant', {
        regions: {
          'custom_1': [[1, 2], [3, 4], [5, 6], [7, 8]],
          'custom_2': [[10, 11], [12, 13], [14, 15]]
        }
      });

      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('regions', customRegionGravityEncoded)));
    });

    it('should throw an error when insufficient custom region gravity details', () => {
      assert.throws(() => {
        cloudinary.v2.uploader.upload('irrelevant', {
          regions: {
            'error_1': [[1, 2]]
          }
        })
      }, {
        name: 'TypeError',
        message: 'Regions should contain at least two arrays with two coordinates'
      });
    });
  });

  describe('explicit', () => {
    it('should send a request with encoded custom region gravity that represents a box', () => {
      const boxRegionGravityEncoded = '{box_1}1,2,3,4|{box_2}5,6,7,8';

      cloudinary.v2.uploader.explicit('irrelevant', {
        regions: {
          'box_1': [[1, 2], [3, 4]],
          'box_2': [[5, 6], [7, 8]]
        }
      });

      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('regions', boxRegionGravityEncoded)));
    });

    it('should send a request with encoded custom region gravity that represents a custom shape', () => {
      const customRegionGravityEncoded = '{custom_1}1,2,3,4,5,6,7,8|{custom_2}10,11,12,13,14,15';

      cloudinary.v2.uploader.explicit('irrelevant', {
        regions: {
          'custom_1': [[1, 2], [3, 4], [5, 6], [7, 8]],
          'custom_2': [[10, 11], [12, 13], [14, 15]]
        }
      });

      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('regions', customRegionGravityEncoded)));
    });

    it('should throw an error when insufficient custom region gravity details', () => {
      assert.throws(() => {
        cloudinary.v2.uploader.upload('irrelevant', {
          regions: {
            'error_1': [[1, 2]]
          }
        })
      }, {
        name: 'TypeError',
        message: 'Regions should contain at least two arrays with two coordinates'
      });
    });
  });
});
