'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var path = require('path');
var rimraf = require('../utils/rimraf');

var FileKeyValueStorage = function () {
  function FileKeyValueStorage() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        baseFolder = _ref.baseFolder;

    (0, _classCallCheck3.default)(this, FileKeyValueStorage);

    this.init(baseFolder);
  }

  (0, _createClass3.default)(FileKeyValueStorage, [{
    key: 'init',
    value: function init(baseFolder) {
      var _this = this;

      if (baseFolder) {
        fs.access(baseFolder, function (err, result) {
          if (err) throw err;
          _this.baseFolder = baseFolder;
        });
      } else {
        if (!fs.existsSync('test_cache')) {
          fs.mkdirSync('test_cache');
        }
        this.baseFolder = fs.mkdtempSync('test_cache/cloudinary_cache_');
        console.info("Created temporary cache folder at " + this.baseFolder);
      }
    }
  }, {
    key: 'get',
    value: function get(key) {
      var value = fs.readFileSync(this.getFilename(key));
      try {
        return JSON.parse(value);
      } catch (e) {
        throw "Cannot parse cache value";
      }
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      fs.writeFileSync(this.getFilename(key), (0, _stringify2.default)(value));
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _this2 = this;

      var files = fs.readdirSync(this.baseFolder);
      files.forEach(function (file) {
        return fs.unlinkSync(path.join(_this2.baseFolder, file));
      });
    }
  }, {
    key: 'deleteBaseFolder',
    value: function deleteBaseFolder() {
      rimraf(this.baseFolder);
    }
  }, {
    key: 'getFilename',
    value: function getFilename(key) {
      return path.format({ name: key, base: key, ext: '.json', dir: this.baseFolder });
    }
  }]);
  return FileKeyValueStorage;
}();

module.exports = FileKeyValueStorage;