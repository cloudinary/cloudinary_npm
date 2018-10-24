'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var rimraf = require('../utils/rimraf');

var FileKeyValueStorage = function () {
  function FileKeyValueStorage() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        baseFolder = _ref.baseFolder;

    _classCallCheck(this, FileKeyValueStorage);

    this.init(baseFolder);
  }

  _createClass(FileKeyValueStorage, [{
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
      fs.writeFileSync(this.getFilename(key), JSON.stringify(value));
    }
  }, {
    key: 'clear',
    value: function clear() {
      var files = fs.readdirSync(this.baseFolder);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var file = _step.value;

          fs.unlinkSync(path.join(this.baseFolder, file));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
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