const registerReusableTest = require('../reusableTests').registerReusableTest;
const sinon = require('sinon');
const helper = require("../../../spechelper");
const { NOP } = require('../../../../lib/utils');

registerReusableTest("a list with a cursor", function (testFunc, ...args) {
  it("Cursor has max results", function () {
    return helper.provideMockObjects(async function (mockXHR, writeSpy, requestSpy) {
      await testFunc(...args, {
        max_results: 10
      }).catch(NOP);

      // TODO why don't we know what is used?
      if (writeSpy.called) {
        sinon.assert.calledWith(writeSpy, sinon.match(/max_results=10/));
      } else {
        sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(/max_results=10/)
        }));
      }
    });
  });
  it("Cursor has next cursor", function () {
    return helper.provideMockObjects(async function (mockXHR, writeSpy, requestSpy) {
      await testFunc(...args, {
        next_cursor: 23452342
      }).catch(NOP);

      // TODO why don't we know what is used?
      if (writeSpy.called) {
        sinon.assert.calledWith(writeSpy, sinon.match(/next_cursor=23452342/));
      } else {
        sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(/next_cursor=23452342/)
        }));
      }
    });
  });
});

