const sinon = require('sinon');
const cloudinary = require('../../../../lib/cloudinary');
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
    it('should send a request with auto_transcription set to true if requested', () => {
      cloudinary.v2.uploader.upload('irrelevant', { auto_transcription: true });
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('auto_transcription', '1')));
    });

    it('should send a request with auto_transcription config if requested', () => {
      cloudinary.v2.uploader.upload('irrelevant', { auto_transcription: { translate: ['pl'] } });
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('auto_transcription', '{"translate":["pl"]}')));
    });
  });

  describe('explicit', () => {
    it('should send a request with auto_transcription set to true if requested', () => {
      cloudinary.v2.uploader.explicit('irrelevant', { auto_transcription: true });
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('auto_transcription', '1')));
    });

    it('should send a request with auto_transcription config if requested', () => {
      cloudinary.v2.uploader.explicit('irrelevant', { auto_transcription: { translate: ['pl'] } });
      sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('auto_transcription', '{"translate":["pl"]}')));
    });
  });
});
