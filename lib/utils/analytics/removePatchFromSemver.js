/**
 * @description Removes patch version from the semver if it exists
 *              Turns x.y.z OR x.y into x.y
 * @param {'x.y.z' || 'x.y' || string} semVerStr
 */
module.exports = (semVerStr) => {
  let parts = semVerStr.split('.');
  return `${parts[0]}.${parts[1]}`;
}
