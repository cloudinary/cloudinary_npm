'use strict';

var removePatchFromSemver = require('./removePatchFromSemver');
var encodeVersion = require('./encodeVersion');

/**
 * @description Gets the SDK signature by encoding the SDK version and tech version
 * @param {{
 *    [techVersion]:string,
 *    [sdkSemver]: string,
 *    [sdkCode]: string,
 *    [product]: string,
 *    [feature]: string
 * }} analyticsOptions
 * @return {string} sdkAnalyticsSignature
 */
function getSDKAnalyticsSignature() {
  var analyticsOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  try {
    var twoPartVersion = removePatchFromSemver(analyticsOptions.techVersion);
    var encodedSDKVersion = encodeVersion(analyticsOptions.sdkSemver);
    var encodedTechVersion = encodeVersion(twoPartVersion);
    var featureCode = analyticsOptions.feature;
    var SDKCode = analyticsOptions.sdkCode;
    var product = analyticsOptions.product;
    var algoVersion = 'B'; // The algo version is determined here, it should not be an argument

    return `${algoVersion}${product}${SDKCode}${encodedSDKVersion}${encodedTechVersion}${featureCode}`;
  } catch (e) {
    // Either SDK or Node versions were unparsable
    return 'E';
  }
}

/**
 * @description Gets the analyticsOptions from options - should include sdkSemver, techVersion, sdkCode, and feature
 * @param options
 * @returns {{sdkSemver: (string), sdkCode, product, feature: string, techVersion: (string)} || {}}
 */
function getAnalyticsOptions(options) {
  var analyticsOptions = {
    sdkSemver: options.sdkSemver,
    techVersion: options.techVersion,
    sdkCode: options.sdkCode,
    product: options.product,
    feature: '0'
  };
  if (options.urlAnalytics) {
    if (options.accessibility) {
      analyticsOptions.feature = 'D';
    }
    if (options.loading === 'lazy') {
      analyticsOptions.feature = 'C';
    }
    if (options.responsive) {
      analyticsOptions.feature = 'A';
    }
    if (options.placeholder) {
      analyticsOptions.feature = 'B';
    }
    return analyticsOptions;
  } else {
    return {};
  }
}

module.exports = {
  getSDKAnalyticsSignature,
  getAnalyticsOptions
};