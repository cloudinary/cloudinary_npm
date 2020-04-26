let base64Map = require('./base64Map');
let reverseVersion = require('./revereseVersion');

/**
 * @description Encodes a semVer-like version string according to SDK logic.
 * @param {string} semVer Input can be either x.y.z or x.y
 * @return {string}
 */
function encodeVersion(semVer) {
  let strResult = '';

  // support x.y or x.y.z
  let parts = semVer.split('.').length;
  let paddedStringLength = parts * 6; // we pad to either 12 or 18 characters

  // reverse (but don't mirror) the version. 1.5.15 -> 15.5.1
  let reversed = reverseVersion(semVer);
  // Pad to doubles, 15.5.1 -> 15.05.01
  let paddedReversed = reversed.padStart(paddedStringLength, '0');
  // Cast to number 15.05.01 -> 150,501(number)
  let num = parseInt(paddedReversed);
  // Represent as binary, add left padding to 12 or 18 characters. 15.05.01 -> 150,501(number)
  let paddedBinary = num.toString(2).padStart(paddedStringLength, '0');


  // turn every 6 bits into a character using the base64Map
  // Support x.y.z
  if (parts === 3) {
    let [first, second, third] = paddedBinary.match(/.{1,6}/g);
    strResult = `${base64Map[first]}${base64Map[second]}${base64Map[third]}`;
  }

  // Support x.y
  if (parts === 2) {
    let [first, second] = paddedBinary.match(/.{1,6}/g);

    strResult = `${base64Map[first]}${base64Map[second]}`;
  }

  return strResult;
}

module.exports = encodeVersion;
