const glob = require('glob');
const path = require('path');

// Import all assertion extensions in /test/testUtils/assertions
glob.sync(`${__dirname}/assertions/*.js`).forEach(function (file) {
  require(path.resolve(file));
});
