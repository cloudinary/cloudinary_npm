"use strict";

var _getOwnPropertySymbols = require("babel-runtime/core-js/object/get-own-property-symbols");

var _getOwnPropertySymbols2 = _interopRequireDefault(_getOwnPropertySymbols);

var _freeze = require("babel-runtime/core-js/object/freeze");

var _freeze2 = _interopRequireDefault(_freeze);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _for = require("babel-runtime/core-js/symbol/for");

var _for2 = _interopRequireDefault(_for);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable class-methods-use-this */

var CACHE = (0, _for2.default)("com.cloudinary.cache");
var CACHE_ADAPTER = (0, _for2.default)("com.cloudinary.cacheAdapter");

var _require = require('./utils'),
    ensurePresenceOf = _require.ensurePresenceOf,
    generate_transformation_string = _require.generate_transformation_string;

/**
 * The adapter used to communicate with the underlying cache storage
 */


var CacheAdapter = function () {
  function CacheAdapter() {
    (0, _classCallCheck3.default)(this, CacheAdapter);
  }

  (0, _createClass3.default)(CacheAdapter, [{
    key: "get",

    /**
     * Get a value from the cache
     * @param {string} publicId
     * @param {string} type
     * @param {string} resourceType
     * @param {string} transformation
     * @param {string} format
     * @return {*} the value associated with the provided arguments
     */
    value: function get(publicId, type, resourceType, transformation, format) {}

    /**
     * Set a new value in the cache
     * @param {string} publicId
     * @param {string} type
     * @param {string} resourceType
     * @param {string} transformation
     * @param {string} format
     * @param {*} value
     */

  }, {
    key: "set",
    value: function set(publicId, type, resourceType, transformation, format, value) {}

    /**
     * Delete all values in the cache
     */

  }, {
    key: "flushAll",
    value: function flushAll() {}
  }]);
  return CacheAdapter;
}();
/**
 * @class Cache
 * Stores and retrieves values identified by publicId / options pairs
 */


var Cache = {
  /**
   * The adapter interface. Extend this class to implement a specific adapter.
   * @type CacheAdapter
   */
  CacheAdapter,
  /**
   * Set the cache adapter
   * @param {CacheAdapter} adapter The cache adapter
   */
  setAdapter(adapter) {
    if (this.adapter) {
      console.warn("Overriding existing cache adapter");
    }
    this.adapter = adapter;
  },
  /**
   * Get the adapter the Cache is using
   * @return {CacheAdapter} the current cache adapter
   */
  getAdapter() {
    return this.adapter;
  },
  /**
   * Get an item from the cache
   * @param {string} publicId
   * @param {object} options
   * @return {*}
   */
  get(publicId, options) {
    if (!this.adapter) {
      return undefined;
    }
    ensurePresenceOf({ publicId });
    var transformation = generate_transformation_string((0, _extends3.default)({}, options));
    return this.adapter.get(publicId, options.type || 'upload', options.resource_type || 'image', transformation, options.format);
  },
  /**
   * Set a new value in the cache
   * @param {string} publicId
   * @param {object} options
   * @param {*} value
   * @return {*}
   */
  set(publicId, options, value) {
    if (!this.adapter) {
      return undefined;
    }
    ensurePresenceOf({ publicId, value });
    var transformation = generate_transformation_string((0, _extends3.default)({}, options));
    return this.adapter.set(publicId, options.type || 'upload', options.resource_type || 'image', transformation, options.format, value);
  },
  /**
   * Clear all items in the cache
   * @return {*} Returns the value from the adapter's flushAll() method
   */
  flushAll() {
    if (!this.adapter) {
      return undefined;
    }
    return this.adapter.flushAll();
  }

};

// Define singleton property
Object.defineProperty(Cache, "instance", {
  get() {
    return global[CACHE];
  }
});
Object.defineProperty(Cache, "adapter", {
  /**
   *
   * @return {CacheAdapter} The current cache adapter
   */
  get() {
    return global[CACHE_ADAPTER];
  },
  /**
   * Set the cache adapter to be used by Cache
   * @param {CacheAdapter} adapter Cache adapter
   */
  set(adapter) {
    global[CACHE_ADAPTER] = adapter;
  }
});
(0, _freeze2.default)(Cache);

// Instantiate the singleton
var symbols = (0, _getOwnPropertySymbols2.default)(global);
if (symbols.indexOf(CACHE) < 0) {
  global[CACHE] = Cache;
}

/**
 * Store key value pairs

 */
module.exports = Cache;