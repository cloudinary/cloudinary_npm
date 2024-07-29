const fs = require('fs');
const path = require('path');
const sdkCode = 'M'; // Constant per SDK

function readSdkSemver() {
  const pkgJsonPath = path.join(__dirname, '../../../package.json');
  try {
    const pkgJSONFile = fs.readFileSync(pkgJsonPath, 'utf-8');
    return JSON.parse(pkgJSONFile).version
  } catch (e) {
    if (e.code === 'ENOENT') {
      return '0.0.0'
    }
    return 'n/a';
  }
}

/**
 * @description Gets the relevant versions of the SDK(package version, node version and sdkCode)
 * @param {'default' | 'x.y.z' | 'x.y' | string} useSDKVersion Default uses package.json version
 * @param {'default' | 'x.y.z' | 'x.y' | string} useNodeVersion Default uses process.versions.node
 * @return {{sdkSemver:string, techVersion:string, sdkCode:string}} A map of relevant versions and codes
 */
function getSDKVersions(useSDKVersion = 'default', useNodeVersion = 'default') {
  // allow to pass a custom SDKVersion
  const sdkSemver = useSDKVersion === 'default' ? readSdkSemver() : useSDKVersion;

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
