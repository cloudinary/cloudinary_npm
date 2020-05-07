'use strict';

var fs = require('fs');
var path = require('path');
var encodeVersion = require('./encodeVersion');
var getSDKFeatureCode = require('./getSDKFeatureCode');
var SDKCode = 'M'; // Constant per SDK


/**
 * @description Removes patch version from the semver if it exists
 *              Turns x.y.z OR x.y into x.y
 * @param {'x.y.z' || 'x.y' || string} semVerStr
 */
function removePatchFromSemver(semVerStr) {
  var parts = semVerStr.split('.');

  return `${parts[0]}.${parts[1]}`;
}

/**
 * @description Gets the SDK signature by encoding the SDK version and node version
 * @param {{responsive:boolean}} features
 * @param {'default' | 'x.y.z' | 'x.y' | string} useSDKVersion Default uses package.json version
 * @param {'default' | 'x.y.z' | 'x.y' | string} useNodeVersion Default uses process.versions.node
 * @return {string} encodedSDK sdkVersionID
 */
function getSDKVersionID() {
  var features = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var useSDKVersion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';
  var useNodeVersion = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'default';

  try {
    // allow to pass a custom SDKVersion
    var pkgJSONFile = fs.readFileSync(path.join(__dirname, '../../../../package.json'), 'utf-8');

    var sdkVersion = useSDKVersion === 'default' ? JSON.parse(pkgJSONFile).version : useSDKVersion;

    // allow to pass a custom nodeVersion
    var nodeVersion = useNodeVersion === 'default' ? process.versions.node : useNodeVersion;

    // Node version should always be in x.y format
    var twoPartNodeVersion = removePatchFromSemver(nodeVersion);
    var encodedSDKVersion = encodeVersion(sdkVersion);
    var encodedNodeVersion = encodeVersion(twoPartNodeVersion);
    var featureCode = getSDKFeatureCode(features);

    return `${SDKCode}${encodedSDKVersion}${encodedNodeVersion}${featureCode}`;
  } catch (e) {
    // Either SDK or Node versions were unparsable
    return 'E';
  }
}

module.exports = getSDKVersionID;