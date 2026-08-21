const expect = require('expect.js');
const sinon = require('sinon');
const https = require('https');
const { EventEmitter } = require('events');
const cloudinary = require('../../../../cloudinary');
const uploader = require('../../../../lib/uploader');
const createTestConfig = require('../../../testUtils/createTestConfig');

const CLOUD_NAME = 'test-cloud';
const SECURE_URL = 'https://res.cloudinary.com/test-cloud/image/upload/generated.png';

describe('uploader generate', function () {
  let requestStub;
  let uploadStub;
  let capturedOptions;
  let capturedBody;

  beforeEach(function () {
    cloudinary.config(createTestConfig({
      cloud_name: CLOUD_NAME,
      api_key: 'test-key',
      api_secret: 'test-secret'
    }));
    capturedOptions = null;
    capturedBody = null;
  });

  afterEach(function () {
    if (requestStub && requestStub.restore) {
      requestStub.restore();
    }
    if (uploadStub && uploadStub.restore) {
      uploadStub.restore();
    }
    requestStub = null;
    uploadStub = null;
  });

  // Stub https.request to emit a JSON response with the given status code and body.
  function stubGenerateRequest(statusCode, responseBody) {
    const mockResponse = new EventEmitter();
    mockResponse.statusCode = statusCode;
    mockResponse.headers = {};

    requestStub = sinon.stub(https, 'request').callsFake(function (options, callback) {
      capturedOptions = options;
      setTimeout(() => callback(mockResponse), 0);

      const mockRequest = new EventEmitter();
      mockRequest.write = sinon.stub().callsFake((data) => {
        capturedBody = data;
      });
      mockRequest.end = function () {
        setTimeout(() => {
          mockResponse.emit('data', JSON.stringify(responseBody));
          mockResponse.emit('end');
        }, 10);
      };
      mockRequest.setTimeout = sinon.stub();

      return mockRequest;
    });
  }

  function generateSuccessBody(secure_url = SECURE_URL) {
    return {
      data: {
        assets: [
          {
            secure_url,
            format: 'png',
            width: 1024,
            height: 768,
            bytes: 2048576,
            model: { family: 'flux', tier: 'premium', model_id: 'flux-2-pro' },
            created_at: '2026-04-21T14:30:00Z'
          }
        ]
      },
      request_id: 'test-request-id'
    };
  }

  it('should call the generate endpoint with the generation params as a JSON body', function () {
    stubGenerateRequest(200, generateSuccessBody());
    // Prevent the upload step from issuing a real request.
    uploadStub = sinon.stub(uploader, 'upload').resolves({ secure_url: SECURE_URL });

    return cloudinary.v2.uploader.generate({ prompt: 'A man with a hat', model_family: 'flux' }).then(() => {
      sinon.assert.calledWith(requestStub, sinon.match({
        pathname: sinon.match(new RegExp(`/v2/processing/${CLOUD_NAME}/generate/image`)),
        method: sinon.match('POST')
      }));
      expect(capturedOptions.headers['Content-Type']).to.eql('application/json');
      const body = JSON.parse(capturedBody);
      expect(body.prompt).to.eql('A man with a hat');
      expect(body.model_family).to.eql('flux');
    });
  });

  it('should upload the generated image and resolve with the upload result', function () {
    stubGenerateRequest(200, generateSuccessBody());
    const uploadResult = { public_id: 'generated', secure_url: SECURE_URL };
    uploadStub = sinon.stub(uploader, 'upload').resolves(uploadResult);

    const options = { upload_preset: 'my_preset', tags: ['generated'] };
    return cloudinary.v2.uploader.generate({ prompt: 'A man with a hat' }, options).then((result) => {
      sinon.assert.calledWith(uploadStub, SECURE_URL);
      // Options are forwarded to the upload step.
      const forwardedOptions = uploadStub.firstCall.args[2];
      expect(forwardedOptions.upload_preset).to.eql('my_preset');
      expect(result).to.eql(uploadResult);
    });
  });

  it('should forward the callback to the upload step on success', function (done) {
    stubGenerateRequest(200, generateSuccessBody());
    const uploadResult = { public_id: 'generated', secure_url: SECURE_URL };
    // Mimic the real upload by invoking the callback it receives.
    uploadStub = sinon.stub(uploader, 'upload').callsFake((file, callback) => {
      if (typeof callback === 'function') {
        callback(uploadResult);
      }
      return Promise.resolve(uploadResult);
    });

    cloudinary.v2.uploader.generate({ prompt: 'A man with a hat' }, function (error, result) {
      try {
        expect(error).to.be(undefined);
        expect(result).to.eql(uploadResult);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not call upload and should reject when generation fails', function () {
    stubGenerateRequest(400, { error: { message: 'missing parameters' } });
    uploadStub = sinon.stub(uploader, 'upload').resolves({});

    return cloudinary.v2.uploader.generate({ prompt: '' }).then(() => {
      throw new Error('Expected generate to reject');
    }, (error) => {
      sinon.assert.notCalled(uploadStub);
      expect(error).to.be.ok();
    });
  });

  it('should invoke the callback with the error when generation fails', function (done) {
    stubGenerateRequest(400, { error: { message: 'missing parameters' } });
    uploadStub = sinon.stub(uploader, 'upload').resolves({});

    cloudinary.v2.uploader.generate({ prompt: '' }, function (error, result) {
      try {
        expect(error).to.be.ok();
        expect(error.message).to.eql('missing parameters');
        expect(result).to.be(undefined);
        sinon.assert.notCalled(uploadStub);
        done();
      } catch (e) {
        done(e);
      }
    }).catch(() => {
      // Swallow the rejected promise; assertions are made in the callback.
    });
  });
});
