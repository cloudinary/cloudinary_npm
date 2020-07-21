const glob = require('glob');
const path = require('path');

// Import all assertion extensions in /test/testUtils/assertions
glob.sync(`${__dirname}/assertions/*.js`).forEach(function (file) {
  require(path.resolve(file));
});

// Import all reusable tests so they can be used with a name
glob.sync(`${__dirname}/reusableTests/**/*.js`).forEach(function (file) {
  require(path.resolve(file));
});
