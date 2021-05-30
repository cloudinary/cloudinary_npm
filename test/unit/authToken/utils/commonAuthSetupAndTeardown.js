const cloudinary = require("../../../../cloudinary");
const createTestConfig = require('../../../testUtils/createTestConfig');

const AUTH_KEY_1 = "00112233FF99";

/**
 *
 */
function commonAuthSetupAndTeardown(config = {}) {
  let urlBackup = '';

  before(() => {
    urlBackup = process.env.CLOUDINARY_URL;
  });

  after(function () {
    process.env.CLOUDINARY_URL = urlBackup;
    cloudinary.config(true);
  });

  beforeEach(function () {
    // Reset the configuration to a known state before each test
    process.env.CLOUDINARY_URL = "cloudinary://a:b@test123";

    cloudinary.config(true); // reset
    cloudinary.config(createTestConfig(Object.assign({}, {
      auth_token: {
        key: AUTH_KEY_1,
        duration: 300,
        start_time: 11111111
      }
    }, config)));
  });
}

module.exports = commonAuthSetupAndTeardown;
