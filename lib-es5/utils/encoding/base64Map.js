'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var stringPad = require('../analytics/stringPad');

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var num = 0;

/**
 * Map of six-bit binary codes to Base64 characters
 */
var base64Map = {};

[].concat(_toConsumableArray(chars)).forEach(function (char) {
  var key = num.toString(2);
  key = stringPad(key, 6, '0');
  base64Map[key] = char;
  num++;
});

module.exports = base64Map;