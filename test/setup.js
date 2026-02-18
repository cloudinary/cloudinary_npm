const dotenv = require('dotenv');
const dotenvInit = typeof dotenv.config === 'function' ? dotenv.config : dotenv.load;
dotenvInit({
  silent: true
});

if (!process.env.CLOUDINARY_URL) {
  throw 'Could not start tests - Cloudinary URL is undefined'
}

global.expect = require('expect.js');
require('./testUtils/testBootstrap');
