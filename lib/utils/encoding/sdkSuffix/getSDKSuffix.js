let fs = require('fs');
let path = require('path');
let encodeVersion = require('./encodeVersion');

let nodeSDKValue = 'M'; // Constant per SDK


/**
 * @description Turns x.y.z into x.y
 * @param {string} semVerStr
 */
function removePatchFromSemver(semVerStr) {
  let parts = semVerStr.split('.');

  return `${parts[0]}.${parts[1]}`;
}

/**
 * @description Gets the SDK signature by encoding the SDK version and node version
 * @param {'default' | 'x.y.z' | 'x.y' | string} useSDKVersion Default uses package.json version
 * @param {'default' | 'x.y.z' | 'x.y' | string} useNodeVersion Default uses process.versions.node
 * @return {string} encodedSDK Suffix
 */
function getSDKSuffix(useSDKVersion = 'default', useNodeVersion = 'default') {
  try {
    // allow to pass a custom SDKVersion
    let pkgJSONFile = fs.readFileSync(path.join(__dirname, '../../../../package.json'), 'utf-8');

    let sdkVersion = useSDKVersion === 'default' ? JSON.parse(pkgJSONFile).version : useSDKVersion;

    // allow to pass a custom nodeVersion
    let nodeVersion = useNodeVersion === 'default' ? process.versions.node : useNodeVersion;

    // SDK version should always be in x.y format
    let twoPartNodeVersion = removePatchFromSemver(nodeVersion);
    let encodedSDKVersion = encodeVersion(sdkVersion);
    let encodedNodeVErsion = encodeVersion(twoPartNodeVersion);

    return `${nodeSDKValue}${encodedSDKVersion}${encodedNodeVErsion}`;
  } catch (e) {
    // Either SDK or Node versions were unparsable
    return 'E';
  }
}

module.exports = getSDKSuffix;
