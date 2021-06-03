const sinon = require('sinon');
const cloudinary = require("../../../../cloudinary");
const helper = require("../../../spechelper");
const describe = require('../../../testUtils/suite');
const testConstants = require('../../../testUtils/testConstants');
const { PUBLIC_IDS } = testConstants;
const { PUBLIC_ID } = PUBLIC_IDS;

describe("oauth_token", function(){
  it("should send the oauth_token option to the server (admin_api)", function() {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.api.resource(PUBLIC_ID, { oauth_token: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4' });
      return sinon.assert.calledWith(requestSpy,
        sinon.match.has("headers",
          sinon.match.has("Authorization", "Bearer MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4")
        ));
    });
  });

  it("should send the oauth_token config to the server (admin_api)", function() {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.config({
        api_key: undefined,
        api_secret: undefined,
        oauth_token: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4'
      });
      cloudinary.v2.api.resource(PUBLIC_ID);
      return sinon.assert.calledWith(requestSpy,
        sinon.match.has("headers",
          sinon.match.has("Authorization", "Bearer MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4")
        ));
    });
  });

  it("should not fail when only providing api_key and secret (admin_api)", function() {
    cloudinary.config({
      api_key: "1234",
      api_secret: "1234",
      oauth_token: undefined
    });
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.api.resource(PUBLIC_ID);
      return sinon.assert.calledWith(requestSpy, sinon.match({ auth: "1234:1234" }));
    });
  });

  it("should fail when missing all credentials (admin_api)", function() {
    cloudinary.config({
      api_key: undefined,
      api_secret: undefined,
      oauth_token: undefined
    });
    expect(() => {
      cloudinary.v2.api.resource(PUBLIC_ID)
    }).to.throwError(/Must supply api_key/);
  });

  it("oauth_token as option should take priority with secret and key (admin_api)", function() {
    cloudinary.config({
      api_key: '1234',
      api_secret: '1234'
    });
    return cloudinary.v2.api.resource(PUBLIC_ID, {oauth_token: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4'})
      .then(
        () => expect().fail()
      ).catch(({ error }) => expect(error.message).to.contain("Invalid token"));
  });

  it("should send the oauth_token option to the server (upload_api)", function() {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.uploader.upload(PUBLIC_ID, { oauth_token: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4' });
      return sinon.assert.calledWith(requestSpy,
        sinon.match.has("headers",
          sinon.match.has("Authorization", "Bearer MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4")
        ));
    });
  });

  it("should send the oauth_token config to the server (upload_api)", function() {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.config({
        api_key: undefined,
        api_secret: undefined,
        oauth_token: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4'
      });
      cloudinary.v2.uploader.upload(PUBLIC_ID);
      return sinon.assert.calledWith(requestSpy,
        sinon.match.has("headers",
          sinon.match.has("Authorization", "Bearer MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI4")
        ));
    });
  });

  it("should not fail when only providing api_key and secret (upload_api)", function() {
    cloudinary.config({
      api_key: "1234",
      api_secret: "1234",
      oauth_token: undefined
    });
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.uploader.upload(PUBLIC_ID)
      return sinon.assert.calledWith(requestSpy, sinon.match({ auth: null }));
    });
  });

  it("should fail when missing all credentials (upload_api)", function() {
    cloudinary.config({
      api_key: undefined,
      api_secret: undefined,
      oauth_token: undefined
    });
    expect(() => {
      cloudinary.v2.uploader.upload(PUBLIC_ID)
    }).to.throwError(/Must supply api_key/);
  });

  it("should not need credentials for unsigned upload", function() {
    cloudinary.config({
      api_key: undefined,
      api_secret: undefined,
      oauth_token: undefined
    });
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      cloudinary.v2.uploader.unsigned_upload(PUBLIC_ID, 'preset')
      return sinon.assert.calledWith(requestSpy, sinon.match({ auth: null }));
    });
  });
});
