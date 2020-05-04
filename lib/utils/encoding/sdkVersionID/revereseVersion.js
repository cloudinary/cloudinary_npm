/**
 * @description A semVer like string, x.y.z or x.y is allowed
 *              Reverses the version positions, x.y.z turns to z.y.x
 * @param {string} versionString
 * @return {string}
 */
function reverseVersion(versionString) {
  let [major, minor, patch] = versionString.split('.');
  let reversed = '';

  if (patch) {
    reversed = `${patch.padStart(2, '0')}${minor.padStart(2, '0')}${major.padStart(2, '0')}`;
  } else {
    reversed = `${minor.padStart(2, '0')}${major.padStart(2, '0')}`;
  }

  return reversed;
}

module.exports = reverseVersion;
