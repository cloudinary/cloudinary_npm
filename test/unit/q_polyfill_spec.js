const expect = require('expect.js');
const sinon = require('sinon');

const cloudinary = require('../../cloudinary');
const utils = require('../../lib/utils');

describe('Q compatibility shim for native promises', function () {
  let nativeFinally;

  beforeEach(function () {
    nativeFinally = Promise.prototype.finally;
    // eslint-disable-next-line no-extend-native
    Promise.prototype.finally = undefined;
  });

  afterEach(function () {
    if (nativeFinally) {
      // eslint-disable-next-line no-extend-native
      Promise.prototype.finally = nativeFinally;
    } else {
      delete Promise.prototype.finally;
    }
  });

  it('adds finally/fin helpers and keeps chained promises patched', async function () {
    const deferred = utils.deferredPromise();
    const spy = sinon.spy();
    const chained = deferred.promise.finally(spy).then((value) => value);

    deferred.resolve('ok');

    const value = await chained;

    expect(value).to.be('ok');
    expect(spy.calledOnce).to.be(true);
    expect(chained.finally).to.be.a('function');
    expect(deferred.promise.fin).to.be.a('function');
  });

  it('adds fail as an alias of catch and allows chaining finally afterwards', async function () {
    const deferred = utils.deferredPromise();
    const fallback = sinon.stub().returns('fallback');
    const failed = deferred.promise.fail(fallback).finally(() => {});

    deferred.reject(new Error('boom'));

    const value = await failed;

    expect(value).to.be('fallback');
    expect(fallback.calledOnce).to.be(true);
    expect(failed.finally).to.be.a('function');
  });

  it('supports spread the same way as Q', async function () {
    const deferred = utils.deferredPromise();
    const spread = deferred.promise.spread((first, second) => first + second);

    deferred.resolve([2, 3]);

    const value = await spread;
    expect(value).to.be(5);
    expect(spread.finally).to.be.a('function');
  });

  it('supports nodeify callbacks for backwards compatibility', function (done) {
    const deferred = utils.deferredPromise();
    const returnValue = deferred.promise.nodeify((err, result) => {
      expect(err).to.be(null);
      expect(result).to.be('value');
      done();
    });

    deferred.resolve('value');

    expect(returnValue).to.be(deferred.promise);
  });

  it('passes nodeify errors to the callback', function (done) {
    const deferred = utils.deferredPromise();
    const error = new Error('kaput');

    deferred.promise.nodeify((err) => {
      expect(err).to.be(error);
      done();
    });

    deferred.reject(error);
  });

  it('exposes progress as a no-op and returns the same promise', function () {
    const deferred = utils.deferredPromise();
    const result = deferred.promise.progress(() => {});

    expect(result).to.be(deferred.promise);
  });

  it('surface unhandled rejections through done()', function (done) {
    const deferred = utils.deferredPromise();
    const error = new Error('done error');
    const timer = setTimeout(() => {
      restoreHandlers();
      done(new Error('done() did not rethrow the error'));
    }, 250);
    const existingHandlers = process.listeners('uncaughtException');
    const restoreHandlers = () => {
      process.removeAllListeners('uncaughtException');
      existingHandlers.forEach((listener) => process.on('uncaughtException', listener));
    };

    process.removeAllListeners('uncaughtException');
    process.once('uncaughtException', (err) => {
      clearTimeout(timer);
      restoreHandlers();
      expect(err).to.be(error);
      done();
    });

    deferred.promise.done();
    deferred.reject(error);
  });
});

const nodeMajorVersion = parseInt(process.versions.node.split('.')[0], 10);

if (nodeMajorVersion === 9) {
  describe('Node 9 compatibility regression test', function () {
    let uploadStub;

    beforeEach(function () {
      uploadStub = sinon.stub(cloudinary.v2.uploader, 'upload').callsFake(() => {
        const deferred = utils.deferredPromise();
        setTimeout(() => deferred.resolve({ secure_url: 'demo-image' }), 0);
        return deferred.promise;
      });
    });

    afterEach(function () {
      uploadStub.restore();
    });

    it('still exposes finally on uploader promises when the runtime lacks it', function () {
      expect(typeof Promise.prototype.finally).to.be('undefined');
      const spy = sinon.spy();
      const promise = cloudinary.v2.uploader.upload('https://example.com/demo.jpg');
      const chained = promise.finally(spy);

      return chained.then((result) => {
        expect(result.secure_url).to.be('demo-image');
        expect(spy.calledOnce).to.be(true);
      });
    });
  });
}
