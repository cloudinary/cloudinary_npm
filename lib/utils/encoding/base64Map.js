const stringPad = require('../analytics/stringPad');

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
let num = 0;

/**
 * Map of six-bit binary codes to Base64 characters
 */
let base64Map = {};

[...chars].forEach((char) => {
  let key = num.toString(2);
  key = stringPad(key, 6, '0');
  base64Map[key] = char;
  num++;
});

module.exports = base64Map;
