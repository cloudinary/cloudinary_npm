const defaultConfigOptions = {
  analytics: false
};

/**
 * @description Creates a default config for testing, add properties to defaultConfigOptions to
 *              make them global across all tests
 * @param {{}} [confOptions] Cloudinary's config options
 * @return {{} & {analytics: false} & any}
 */
function createTestConfig(confOptions = {}) {
  return Object.assign({}, defaultConfigOptions, confOptions);
}

module.exports = createTestConfig;
