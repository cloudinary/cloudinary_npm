const v1 = require('../cloudinary.js');
const clone = require('lodash/clone');
const v2 = clone(v1);
v2.api = require('./api');
v2.uploader = require('./uploader');
v2.search = require('./search');
module.exports = v2;
