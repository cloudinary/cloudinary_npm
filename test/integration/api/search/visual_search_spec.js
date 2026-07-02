const sinon = require('sinon');
const helper = require('../../../spechelper');
const cloudinary = require('../../../../cloudinary');
const {
  strictEqual,
  deepStrictEqual
} = require('assert');
const {TEST_CLOUD_NAME} = require('../../../testUtils/testConstants');

function multipartFilePartMatcher(name, filename) {
  const expected = `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: application/octet-stream`;
  return (arg) => {
    const str = Buffer.isBuffer(arg) ? arg.toString('binary') : String(arg);
    return str.includes(expected);
  };
}

describe('Visual search', () => {
  it('should pass the image_url parameter to the api call', () => {
    return helper.provideMockObjects(async (mockXHR, writeSpy, requestSpy) => {
      await cloudinary.v2.api.visual_search({image_url: 'test-image-url'}).catch(helper.ignoreApiFailure);

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'POST');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search`);
      sinon.assert.calledWith(writeSpy, sinon.match(helper.apiParamMatcher('image_url', 'test-image-url')));
    });
  });

  it('should pass the image_asset_id parameter to the api call', () => {
    return helper.provideMockObjects(async (mockXHR, writeSpy, requestSpy) => {
      await cloudinary.v2.api.visual_search({image_asset_id: 'image-asset-id'}).catch(helper.ignoreApiFailure);

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'POST');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search`);
      sinon.assert.calledWith(writeSpy, sinon.match(helper.apiParamMatcher('image_asset_id', 'image-asset-id')));
    });
  });

  it('should pass the text parameter to the api call', () => {
    return helper.provideMockObjects(async (mockXHR, writeSpy, requestSpy) => {
      await cloudinary.v2.api.visual_search({text: 'visual-search-input'}).catch(helper.ignoreApiFailure);

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'POST');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search`);
      sinon.assert.calledWith(writeSpy, sinon.match(helper.apiParamMatcher('text', 'visual-search-input')));
    });
  });

  it('should send a local image_file as a multipart request', () => {
    return helper.provideMockObjects(async (mockXHR, writeSpy, requestSpy) => {
      await cloudinary.v2.api.visual_search({image_file: helper.IMAGE_FILE}).catch(helper.ignoreApiFailure);

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'POST');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search`);
      strictEqual(calledWithUrl.headers['Content-Type'].startsWith('multipart/form-data'), true);
      sinon.assert.calledWith(writeSpy, sinon.match(multipartFilePartMatcher('image_file', 'logo.png')));
    });
  });

  it('should pass a remote image_file url as a plain parameter', () => {
    return helper.provideMockObjects(async (mockXHR, writeSpy, requestSpy) => {
      await cloudinary.v2.api.visual_search({image_file: helper.IMAGE_URL}).catch(helper.ignoreApiFailure);

      const [calledWithUrl] = requestSpy.firstCall.args;
      strictEqual(calledWithUrl.method, 'POST');
      strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/visual_search`);
      strictEqual(calledWithUrl.headers['Content-Type'], 'application/x-www-form-urlencoded');
      sinon.assert.calledWith(writeSpy, sinon.match(helper.apiParamMatcher('image_file', helper.IMAGE_URL)));
    });
  });
});
