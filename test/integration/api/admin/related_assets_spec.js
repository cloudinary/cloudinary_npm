const helper = require('../../../spechelper');
const cloudinary = require('../../../../cloudinary');
const {
  strictEqual,
  deepStrictEqual
} = require('assert');
const {TEST_CLOUD_NAME} = require('../../../testUtils/testConstants');

describe('Asset relations API', () => {
  const testPublicId = 'test-public-id';
  const testAssetId = 'test-asset-id';
  const singleRelatedPublicId = 'related-public-id';
  const multipleRelatedPublicId = ['related-public-id-1', 'related-public-id-2'];

  describe('when creating new relation', () => {
    describe('using public id', () => {
      it('should allow passing a single public id to create a relation', () => {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.v2.api.add_related_assets(testPublicId, singleRelatedPublicId);

          const [calledWithUrl] = requestSpy.firstCall.args;
          strictEqual(calledWithUrl.method, 'POST');
          strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/related_assets/image/upload/test-public-id`);
          const callApiArguments = writeSpy.firstCall.args;
          deepStrictEqual(callApiArguments, ["{\"assets_to_relate\":[\"related-public-id\"]}"]);
        });
      });

      it('should allow passing multiple public ids to create a relation', () => {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.v2.api.add_related_assets(testPublicId, multipleRelatedPublicId);

          const [calledWithUrl] = requestSpy.firstCall.args;
          strictEqual(calledWithUrl.method, 'POST');
          strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/related_assets/image/upload/${testPublicId}`);
          const callApiArguments = writeSpy.firstCall.args;
          deepStrictEqual(callApiArguments, ["{\"assets_to_relate\":[\"related-public-id-1\",\"related-public-id-2\"]}"]);
        });
      });
    });

    describe('using asset id', () => {
      it('should allow passing a single public id to create a relation', () => {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.v2.api.add_related_assets_by_asset_id(testAssetId, singleRelatedPublicId);

          const [calledWithUrl] = requestSpy.firstCall.args;
          strictEqual(calledWithUrl.method, 'POST');
          strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/related_assets/test-asset-id`);
          const callApiArguments = writeSpy.firstCall.args;
          deepStrictEqual(callApiArguments, ["{\"assets_to_relate\":[\"related-public-id\"]}"]);
        });
      });

      it('should allow passing multiple public ids to create a relation', () => {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.v2.api.add_related_assets_by_asset_id(testAssetId, multipleRelatedPublicId);

          const [calledWithUrl] = requestSpy.firstCall.args;
          strictEqual(calledWithUrl.method, 'POST');
          strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/related_assets/test-asset-id`);
          const callApiArguments = writeSpy.firstCall.args;
          deepStrictEqual(callApiArguments, ["{\"assets_to_relate\":[\"related-public-id-1\",\"related-public-id-2\"]}"]);
        });
      });
    });
  });

  describe('when deleting existing relation', () => {
    describe('using public id', () => {
      it('should allow passing a single public id to delete a relation', () => {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.v2.api.delete_related_assets(testPublicId, singleRelatedPublicId);

          const [calledWithUrl] = requestSpy.firstCall.args;
          strictEqual(calledWithUrl.method, 'DELETE');
          strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/related_assets/image/upload/test-public-id`);
          const callApiArguments = writeSpy.firstCall.args;
          deepStrictEqual(callApiArguments, ["{\"assets_to_unrelate\":[\"related-public-id\"]}"]);
        });
      });

      it('should allow passing multiple public ids to delete a relation', () => {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.v2.api.delete_related_assets(testPublicId, multipleRelatedPublicId);

          const [calledWithUrl] = requestSpy.firstCall.args;
          strictEqual(calledWithUrl.method, 'DELETE');
          strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/related_assets/image/upload/test-public-id`);
          const callApiArguments = writeSpy.firstCall.args;
          deepStrictEqual(callApiArguments, ["{\"assets_to_unrelate\":[\"related-public-id-1\",\"related-public-id-2\"]}"]);
        });
      });
    });

    describe('and using asset id', () => {
      it('should allow passing a single public id to delete a relation', () => {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.v2.api.delete_related_assets_by_asset_id(testAssetId, singleRelatedPublicId);

          const [calledWithUrl] = requestSpy.firstCall.args;
          strictEqual(calledWithUrl.method, 'DELETE');
          strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/related_assets/test-asset-id`);
          const callApiArguments = writeSpy.firstCall.args;
          deepStrictEqual(callApiArguments, ["{\"assets_to_unrelate\":[\"related-public-id\"]}"]);
        });
      });

      it('should allow passing multiple public ids to delete a relation', () => {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.v2.api.delete_related_assets_by_asset_id(testAssetId, multipleRelatedPublicId);

          const [calledWithUrl] = requestSpy.firstCall.args;
          strictEqual(calledWithUrl.method, 'DELETE');
          strictEqual(calledWithUrl.path, `/v1_1/${TEST_CLOUD_NAME}/resources/related_assets/test-asset-id`);
          const callApiArguments = writeSpy.firstCall.args;
          deepStrictEqual(callApiArguments, ["{\"assets_to_unrelate\":[\"related-public-id-1\",\"related-public-id-2\"]}"]);
        });
      });
    });
  });
});
