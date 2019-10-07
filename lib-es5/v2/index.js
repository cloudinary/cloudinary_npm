'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var v1 = require('../cloudinary.js');
var api = require('./api');
var uploader = require('./uploader');
var search = require('./search');

var v2 = (0, _extends3.default)({}, v1, {
  api,
  uploader,
  search
});
module.exports = v2;