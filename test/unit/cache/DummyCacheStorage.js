/**
 * In-memory cache storage used in the cache tests.
 */
class DummyCacheStorage {
  constructor() {
    this.dummyCache = {};
  }

  get(key) {
    return this.dummyCache[key];
  }

  set(key, value) {
    this.dummyCache[key] = value;
  }

  delete(key) {
    delete this.dummyCache[key];
  }

  clear() {
    this.dummyCache = {};
  }
}

module.exports = DummyCacheStorage;
