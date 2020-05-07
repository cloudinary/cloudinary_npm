'use strict';

/**
 * @description A semVer like string, x.y.z or x.y is allowed
 *              Reverses the version positions, x.y.z turns to z.y.x
 * @param {string} versionString
 * @return {string} in the form of zz.yy.xx (
 */
function reverseVersion(versionString) {
  if (versionString.split('.').length < 2) {
    throw new Error('invalid versionString, must have at least two segments');
  }

  // Split by '.', reverse, create new array with padded values and concat it together
  return versionString.split('.').reverse().map(function (segment) {
    return segment.padStart(2, '0');
  }).join('.');
}

module.exports = reverseVersion;