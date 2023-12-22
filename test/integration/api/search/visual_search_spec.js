const helper = require('../../../spechelper');
const cloudinary = require('../../../../cloudinary');
const {
  strictEqual,
  deepStrictEqual,
  throws
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

  it('should pass the image_asset_id parameter to the api call', () => {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.api.visual_search({image_asset_id: 'image-asset-id'});

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'GET');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search?image_asset_id=image-asset-id`);
    });
  });

  it('should pass the text parameter to the api call', () => {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.api.visual_search({text: 'visual-search-input'});

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'GET');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search?text=visual-search-input`);
    });
  });

  describe('with image_file', () => {
    it('should allow uploading the file to get search results', async () => {
      // todo: once migrated to DI, assert that image_file is passed, don't do actual http request
      const searchResult = await cloudinary.v2.api.visual_search({image_file: `${__dirname}/../../../.resources/sample.jpg`});
      deepStrictEqual(searchResult.statusCode, 200);
    });

    it('should throw an error if parameter is not a path or buffer', () => {
      try {
        cloudinary.v2.api.visual_search({image_file: 420})
      } catch (error) {
        strictEqual(error.message, 'image_file has to be either a path to file or a buffer');
      }
    });
  });
});
