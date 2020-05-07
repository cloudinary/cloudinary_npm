'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var num = 0;
var map = {};

[].concat(_toConsumableArray(chars)).forEach(function (char) {
  var key = num.toString(2).padStart(6, '0');
  map[key] = char;
  num++;
});

/**
 * Map of six-bit binary codes to Base64 characters
 */
module.exports = map;