function getSDKFeatureCode(features = {}) {
  let defaultCode = '0';

  if (features.responsive) {
    return 'A';
  }

  return defaultCode;
}

module.exports = getSDKFeatureCode;
