'use strict';

var v1 = require('../cloudinary.js');
var clone = require('lodash/clone');
var v2 = clone(v1);
v2.api = require('./api');
v2.uploader = require('./uploader');
v2.search = require('./search');
module.exports = v2;