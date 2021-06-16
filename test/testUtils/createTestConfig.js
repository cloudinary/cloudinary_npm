const defaultConfigOptions = {
  urlAnalytics: false
};

/**
 * @description Creates a default config for testing, add properties to defaultConfigOptions to
 *              make them global across all tests
 * @param {{}} [confOptions] Cloudinary's config options
 * @return {{} & {urlAnalytics: false} & any}
 */
function createTestConfig(confOptions = {}) {
  return Object.assign({}, defaultConfigOptions, confOptions);
}

module.exports = createTestConfig;
