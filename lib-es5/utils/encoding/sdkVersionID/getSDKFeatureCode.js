'use strict';

function getSDKFeatureCode() {
  var features = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var defaultCode = '0';

  if (features.responsive) {
    return 'A';
  }

  return defaultCode;
}

module.exports = getSDKFeatureCode;