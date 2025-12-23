const scheduleCompatCallback = typeof setImmediate === 'function'
  ? (fn) => setImmediate(fn)
  : (fn) => setTimeout(fn, 0);

function qFinally(onFinally) {
  const handler = typeof onFinally === 'function' ? onFinally : () => onFinally;
  const PromiseCtor = typeof this.constructor === 'function' && typeof this.constructor.resolve === 'function'
    ? this.constructor
    : Promise;
  return this.then(
    (value) => PromiseCtor.resolve(handler()).then(() => value),
    (reason) => PromiseCtor.resolve(handler()).then(() => {
      throw reason;
    })
  );
}

function qFin(handler) {
  return this.finally(handler);
}

function qDone(onFulfilled, onRejected) {
  this.then(onFulfilled, onRejected).catch((err) => {
    scheduleCompatCallback(() => {
      throw err;
    });
  });
}

function qNodeify(callback) {
  if (typeof callback !== 'function') {
    return this;
  }

  this.then(
    (value) => scheduleCompatCallback(() => callback(null, value)),
    (error) => scheduleCompatCallback(() => callback(error))
  );

  return this;
}

function qFail(onRejected) {
  return this.catch(onRejected);
}

function qProgress() {
  return this;
}

function qSpread(onFulfilled, onRejected) {
  return this.then(
    (values) => {
      if (typeof onFulfilled !== 'function') {
        return values;
      }
      if (Array.isArray(values)) {
        // eslint-disable-next-line prefer-spread
        return onFulfilled.apply(void 0, values);
      }
      return onFulfilled(values);
    },
    onRejected
  );
}

function applyQCompat(promise) {
  if (!promise || (typeof promise !== 'object' && typeof promise !== 'function')) {
    return promise;
  }

  if (promise.__cloudinaryQCompatApplied) {
    return promise;
  }

  Object.defineProperty(promise, '__cloudinaryQCompatApplied', {
    value: true,
    enumerable: false
  });

  const nativeThen = promise.then;
  if (typeof nativeThen === 'function') {
    promise.then = function (...args) {
      return applyQCompat(nativeThen.apply(this, args));
    };
  }

  const nativeCatch = promise.catch;
  if (typeof nativeCatch === 'function') {
    promise.catch = function (...args) {
      return applyQCompat(nativeCatch.apply(this, args));
    };
  }

  const nativeFinally = promise.finally;
  if (typeof nativeFinally === 'function') {
    promise.finally = function (...args) {
      return applyQCompat(nativeFinally.apply(this, args));
    };
  } else {
    promise.finally = qFinally;
  }

  if (typeof promise.fin !== 'function') {
    promise.fin = qFin;
  }

  if (typeof promise.done !== 'function') {
    promise.done = qDone;
  }

  if (typeof promise.nodeify !== 'function') {
    promise.nodeify = qNodeify;
  }

  if (typeof promise.fail !== 'function') {
    promise.fail = qFail;
  }

  if (typeof promise.progress !== 'function') {
    promise.progress = qProgress;
  }

  if (typeof promise.spread !== 'function') {
    promise.spread = qSpread;
  }

  return promise;
}

module.exports = applyQCompat;
