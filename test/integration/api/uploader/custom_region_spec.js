const assert = require('assert');
const sinon = require('sinon');

const cloudinary = require('../../../../lib/cloudinary');
const createTestConfig = require('../../../testUtils/createTestConfig');
const helper = require('../../../spechelper');

describe('Uploader', () => {
  beforeEach(function () {
    cloudinary.config(true);
    cloudinary.config(createTestConfig());
  });

  it('should upload with custom region gravity that represents a box', () => {
    const boxRegionGravityEncoded = '{box_1}1,2,3,4|{box_2}5,6,7,8';

    return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
      helper.uploadImage({
        regions: {
          'box_1': [[1, 2], [3, 4]],
          'box_2': [[5, 6], [7, 8]]
        }
      });

      sinon.assert.calledWith(requestSpy, sinon.match({
        method: sinon.match('POST')
      }));

      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('regions', boxRegionGravityEncoded)));
    });
  });

  it('should upload with custom region gravity that represents a custom shape', () => {
    const customRegionGravityEncoded = '{custom_1}1,2,3,4,5,6,7,8|{custom_2}10,11,12,13,14,15';

    return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
      helper.uploadImage({
        regions: {
          'custom_1': [[1, 2], [3, 4], [5, 6], [7, 8]],
          'custom_2': [[10, 11], [12, 13], [14, 15]]
        }
      });

      sinon.assert.calledWith(requestSpy, sinon.match({
        method: sinon.match('POST')
      }));

      sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('regions', customRegionGravityEncoded)));
    });
  });

  it('should not upload with insufficient custom region gravity details', () => {
    assert.throws(() => {
      cloudinary.v2.uploader.upload('irrelevant', {
        regions: {
          'error_1': [[1, 2]]
        }
      });
    }, {
      name: 'TypeError',
      message: 'Regions should contain at least two arrays with two coordinates'
    });
  });
});
