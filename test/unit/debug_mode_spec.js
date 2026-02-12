const expect = require('expect.js');
const sinon = require('sinon');
const https = require('https');
const { EventEmitter } = require('events');
const cloudinary = require('../../lib/cloudinary');
const createTestConfig = require('../testUtils/createTestConfig');

describe('debug mode', function () {
  let requestStub;
  let mockResponse;

  beforeEach(function () {
    cloudinary.config(createTestConfig());
    
    // Create a mock response that extends EventEmitter
    mockResponse = new EventEmitter();
    mockResponse.statusCode = 200;
    mockResponse.headers = {
      'x-request-id': 'test-request-id-12345678',
      'x-featureratelimit-limit': '500',
      'x-featureratelimit-reset': new Date().toUTCString(),
      'x-featureratelimit-remaining': '499'
    };

    // Stub the https.request method
    requestStub = sinon.stub(https, 'request').callsFake(function (options, callback) {
      // Call the callback with our mock response
      setTimeout(() => callback(mockResponse), 0);
      
      // Return a mock request object
      const mockRequest = new EventEmitter();
      mockRequest.write = sinon.stub();
      mockRequest.end = function () {
        // Simulate response data after end() is called
        setTimeout(() => {
          mockResponse.emit('data', JSON.stringify({ status: 'ok' }));
          mockResponse.emit('end');
        }, 10);
      };
      mockRequest.setTimeout = sinon.stub();
      
      return mockRequest;
    });
  });

  afterEach(function () {
    requestStub.restore();
  });

  describe('when debug mode is enabled', function () {
    beforeEach(function () {
      cloudinary.config({ debug: true });
    });

    it('should include request_id in successful responses', function (done) {
      cloudinary.v2.api.ping()
        .then((result) => {
          expect(result.request_id).to.be('test-request-id-12345678');
          expect(result.status).to.be('ok');
          done();
        })
        .catch(done);
    });

    it('should include request_id in error responses', function (done) {
      // Override the mock response to simulate an error
      mockResponse.statusCode = 404;
      requestStub.restore();
      
      requestStub = sinon.stub(https, 'request').callsFake(function (options, callback) {
        setTimeout(() => callback(mockResponse), 0);
        
        const mockRequest = new EventEmitter();
        mockRequest.write = sinon.stub();
        mockRequest.end = function () {
          setTimeout(() => {
            mockResponse.emit('data', JSON.stringify({
              error: {
                message: 'Resource not found'
              }
            }));
            mockResponse.emit('end');
          }, 10);
        };
        mockRequest.setTimeout = sinon.stub();
        
        return mockRequest;
      });

      cloudinary.v2.api.resource('nonexistent').catch((error) => {
        expect(error.error.request_id).to.be('test-request-id-12345678');
        expect(error.error.message).to.be('Resource not found');
        expect(error.error.http_code).to.be(404);
        done();
      });
    });

    it('should include request_id even when X-Request-Id header has different casing', function (done) {
      // Test case insensitivity (Node.js lowercases headers)
      mockResponse.headers = {
        'x-request-id': 'case-insensitive-id'
      };

      cloudinary.v2.api.ping()
        .then((result) => {
          expect(result.request_id).to.be('case-insensitive-id');
          done();
        })
        .catch(done);
    });
  });

  describe('when debug mode is disabled', function () {
    beforeEach(function () {
      cloudinary.config({ debug: false });
    });

    it('should NOT include request_id in successful responses', function (done) {
      cloudinary.v2.api.ping()
        .then((result) => {
          expect(result.request_id).to.be(undefined);
          expect(result.status).to.be('ok');
          done();
        })
        .catch(done);
    });

    it('should NOT include request_id in error responses', function (done) {
      mockResponse.statusCode = 404;
      requestStub.restore();
      
      requestStub = sinon.stub(https, 'request').callsFake(function (options, callback) {
        setTimeout(() => callback(mockResponse), 0);
        
        const mockRequest = new EventEmitter();
        mockRequest.write = sinon.stub();
        mockRequest.end = function () {
          setTimeout(() => {
            mockResponse.emit('data', JSON.stringify({
              error: {
                message: 'Resource not found'
              }
            }));
            mockResponse.emit('end');
          }, 10);
        };
        mockRequest.setTimeout = sinon.stub();
        
        return mockRequest;
      });

      cloudinary.v2.api.resource('nonexistent').catch((error) => {
        expect(error.error.request_id).to.be(undefined);
        expect(error.error.message).to.be('Resource not found');
        done();
      });
    });
  });

  describe('when X-Request-Id header is missing', function () {
    beforeEach(function () {
      cloudinary.config({ debug: true });
      // Remove the x-request-id header
      delete mockResponse.headers['x-request-id'];
    });

    it('should not break when request_id is missing from headers', function (done) {
      cloudinary.v2.api.ping()
        .then((result) => {
          expect(result.request_id).to.be(undefined);
          expect(result.status).to.be('ok');
          done();
        })
        .catch(done);
    });
  });

  describe('config option', function () {
    it('should accept debug option in config', function () {
      cloudinary.config({ debug: true });
      expect(cloudinary.config('debug')).to.be(true);
      
      cloudinary.config({ debug: false });
      expect(cloudinary.config('debug')).to.be(false);
    });

    it('should be undefined when not explicitly set', function () {
      const testConfig = createTestConfig();
      delete testConfig.debug; // Ensure debug is not in the config
      cloudinary.config(testConfig);
      // When not set, it should be undefined (falsy)
      expect(cloudinary.config('debug')).to.not.be.ok();
    });
  });
});
