let fs = require('fs');
let path = require('path');
let encodeVersion = require('./encodeVersion');
let getSDKFeatureCode = require('./getSDKFeatureCode');
let SDKCode = 'M'; // Constant per SDK


/**
 * @description Removes patch version from the semver if it exists
 *              Turns x.y.z OR x.y into x.y
 * @param {'x.y.z' || 'x.y' || string} semVerStr
 */
function removePatchFromSemver(semVerStr) {
  let parts = semVerStr.split('.');

  return `${parts[0]}.${parts[1]}`;
}

/**
 * @description Gets the SDK signature by encoding the SDK version and node version
 * @param {{responsive:boolean}} features
 * @param {'default' | 'x.y.z' | 'x.y' | string} useSDKVersion Default uses package.json version
 * @param {'default' | 'x.y.z' | 'x.y' | string} useNodeVersion Default uses process.versions.node
 * @return {string} encodedSDK sdkVersionID
 */
function getSDKVersionID(features = {}, useSDKVersion = 'default', useNodeVersion = 'default') {
  try {
    // allow to pass a custom SDKVersion
    let pkgJSONFile = fs.readFileSync(path.join(__dirname, '../../../../package.json'), 'utf-8');

    let sdkVersion = useSDKVersion === 'default' ? JSON.parse(pkgJSONFile).version : useSDKVersion;

    // allow to pass a custom nodeVersion
    let nodeVersion = useNodeVersion === 'default' ? process.versions.node : useNodeVersion;

    // Node version should always be in x.y format
    let twoPartNodeVersion = removePatchFromSemver(nodeVersion);
    let encodedSDKVersion = encodeVersion(sdkVersion);
    let encodedNodeVersion = encodeVersion(twoPartNodeVersion);
    let featureCode = getSDKFeatureCode(features);

    return `${SDKCode}${encodedSDKVersion}${encodedNodeVersion}${featureCode}`;
  } catch (e) {
    // Either SDK or Node versions were unparsable
    return 'E';
  }
}

module.exports = getSDKVersionID;
