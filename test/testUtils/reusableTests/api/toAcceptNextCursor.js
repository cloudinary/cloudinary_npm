const registerReusableTest = require('../reusableTests').registerReusableTest;
const sinon = require('sinon');
const helper = require("../../../spechelper");

registerReusableTest("accepts next_cursor", function (testFunc, ...args) {
  it("Has a next cursor", function () {
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
      testFunc(...args, {
        next_cursor: 23452342
      });

      // TODO Why aren't we sure what's called here?
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
