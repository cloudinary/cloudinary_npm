const fs = require('fs');
const path = require('path');
const sdkCode = 'M'; // Constant per SDK

/**
 * @description Gets the relevant versions of the SDK(package version, node version and sdkCode)
 * @param {'default' | 'x.y.z' | 'x.y' | string} useSDKVersion Default uses package.json version
 * @param {'default' | 'x.y.z' | 'x.y' | string} useNodeVersion Default uses process.versions.node
 * @return {{sdkSemver:string, techVersion:string, sdkCode:string}} A map of relevant versions and codes
 */
function getSDKVersions(useSDKVersion = 'default', useNodeVersion = 'default') {
  const pkgJSONFile = fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf-8');

  // allow to pass a custom SDKVersion
  const sdkSemver = useSDKVersion === 'default' ? JSON.parse(pkgJSONFile).version : useSDKVersion;

  // allow to pass a custom techVersion (Node version)
  const techVersion = useNodeVersion === 'default' ? process.versions.node : useNodeVersion;

  const product = 'A';

  return {
    sdkSemver,
    techVersion,
    sdkCode,
    product
  };
}

module.exports = getSDKVersions;
