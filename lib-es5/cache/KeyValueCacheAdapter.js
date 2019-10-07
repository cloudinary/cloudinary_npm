'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crypto = require('crypto');
var CacheAdapter = require('../cache').CacheAdapter;

/**
 *
 */

var KeyValueCacheAdapter = function (_CacheAdapter) {
  (0, _inherits3.default)(KeyValueCacheAdapter, _CacheAdapter);

  function KeyValueCacheAdapter(storage) {
    (0, _classCallCheck3.default)(this, KeyValueCacheAdapter);

    var _this = (0, _possibleConstructorReturn3.default)(this, (KeyValueCacheAdapter.__proto__ || (0, _getPrototypeOf2.default)(KeyValueCacheAdapter)).call(this));

    _this.storage = storage;
    return _this;
  }

  /** @inheritDoc */


  (0, _createClass3.default)(KeyValueCacheAdapter, [{
    key: 'get',
    value: function get(publicId, type, resourceType, transformation, format) {
      var key = KeyValueCacheAdapter.generateCacheKey(publicId, type, resourceType, transformation, format);
      return KeyValueCacheAdapter.extractData(this.storage.get(key));
    }

    /** @inheritDoc */

  }, {
    key: 'set',
    value: function set(publicId, type, resourceType, transformation, format, value) {
      var key = KeyValueCacheAdapter.generateCacheKey(publicId, type, resourceType, transformation, format);
      this.storage.set(key, KeyValueCacheAdapter.prepareData(publicId, type, resourceType, transformation, format, value));
    }

    /** @inheritDoc */

  }, {
    key: 'flushAll',
    value: function flushAll() {
      this.storage.clear();
    }

    /** @inheritDoc */

  }, {
    key: 'delete',
    value: function _delete(publicId, type, resourceType, transformation, format) {
      var key = KeyValueCacheAdapter.generateCacheKey(publicId, type, resourceType, transformation, format);
      return this.storage.delete(key);
    }
  }], [{
    key: 'generateCacheKey',
    value: function generateCacheKey(publicId, type, resourceType, transformation, format) {
      type = type || "upload";
      resourceType = resourceType || "image";
      var sha1 = crypto.createHash('sha1');
      return sha1.update([publicId, type, resourceType, transformation, format].filter(function (i) {
        return i;
      }).join('/')).digest('hex');
    }
  }, {
    key: 'prepareData',
    value: function prepareData(publicId, type, resourceType, transformation, format, data) {
      return { publicId, type, resourceType, transformation, format, breakpoints: data };
    }
  }, {
    key: 'extractData',
    value: function extractData(data) {
      return data ? data.breakpoints : null;
    }
  }]);
  return KeyValueCacheAdapter;
}(CacheAdapter);

module.exports = KeyValueCacheAdapter;