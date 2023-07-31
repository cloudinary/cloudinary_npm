const helper = require('../../../spechelper');
const cloudinary = require('../../../../cloudinary');
const {
  strictEqual,
  deepStrictEqual
} = require('assert');
const {TEST_CLOUD_NAME} = require('../../../testUtils/testConstants');

describe('Visual search', () => {
  it('should pass the image_url parameter to the api call', () => {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.api.visual_search({image_url: 'test-image-url'});

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'GET');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search?image_url=test-image-url`);
    });
  });

  it('should pass the image_url parameter to the api call', () => {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.api.visual_search({image_asset_id: 'image-asset-id'});

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'GET');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search?image_asset_id=image-asset-id`);
    });
  });

  it('should pass the image_url parameter to the api call', () => {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.api.visual_search({text: 'visual-search-input'});

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'GET');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search?text=visual-search-input`);
    });
  });
});
