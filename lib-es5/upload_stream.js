"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Transform = require("stream").Transform;

var UploadStream = function (_Transform) {
  (0, _inherits3.default)(UploadStream, _Transform);

  function UploadStream(options) {
    (0, _classCallCheck3.default)(this, UploadStream);

    var _this = (0, _possibleConstructorReturn3.default)(this, (UploadStream.__proto__ || (0, _getPrototypeOf2.default)(UploadStream)).call(this));

    _this.boundary = options.boundary;
    return _this;
  }

  (0, _createClass3.default)(UploadStream, [{
    key: "_transform",
    value: function _transform(data, encoding, next) {
      var buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, encoding);
      this.push(buffer);
      next();
    }
  }, {
    key: "_flush",
    value: function _flush(next) {
      this.push(Buffer.from("\r\n", 'ascii'));
      this.push(Buffer.from("--" + this.boundary + "--", 'ascii'));
      return next();
    }
  }]);
  return UploadStream;
}(Transform);

module.exports = UploadStream;