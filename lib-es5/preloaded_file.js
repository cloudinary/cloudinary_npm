"use strict";

var _getOwnPropertyNames = require("babel-runtime/core-js/object/get-own-property-names");

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PRELOADED_CLOUDINARY_PATH, config, utils;

utils = require("./utils");

config = require("./config");

PRELOADED_CLOUDINARY_PATH = /^([^\/]+)\/([^\/]+)\/v(\d+)\/([^#]+)#([^\/]+)$/;

var PreloadedFile = function () {
  function PreloadedFile(file_info) {
    (0, _classCallCheck3.default)(this, PreloadedFile);

    var matches, public_id_and_format;
    matches = file_info.match(PRELOADED_CLOUDINARY_PATH);
    if (!matches) {
      throw "Invalid preloaded file info";
    }
    this.resource_type = matches[1];
    this.type = matches[2];
    this.version = matches[3];
    this.filename = matches[4];
    this.signature = matches[5];
    public_id_and_format = PreloadedFile.split_format(this.filename);
    this.public_id = public_id_and_format[0];
    this.format = public_id_and_format[1];
  }

  (0, _createClass3.default)(PreloadedFile, [{
    key: "is_valid",
    value: function is_valid() {
      var expected_signature;
      expected_signature = utils.api_sign_request({
        public_id: this.public_id,
        version: this.version
      }, config().api_secret);
      return this.signature === expected_signature;
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return `v${this.version}/${this.filename}`;
    }
  }, {
    key: "toString",
    value: function toString() {
      return `${this.resource_type}/${this.type}/v${this.version}/${this.filename}#${this.signature}`;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var _this = this;

      var result = {};
      (0, _getOwnPropertyNames2.default)(this).forEach(function (key) {
        var val = _this[key];
        if (typeof val !== 'function') {
          result[key] = val;
        }
      });
      return result;
    }
  }], [{
    key: "split_format",
    value: function split_format(identifier) {
      var format, last_dot, public_id;
      last_dot = identifier.lastIndexOf(".");
      if (last_dot === -1) {
        return [identifier, null];
      }
      public_id = identifier.substr(0, last_dot);
      format = identifier.substr(last_dot + 1);
      return [public_id, format];
    }
  }]);
  return PreloadedFile;
}();

module.exports = PreloadedFile;