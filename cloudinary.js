if (Number(process.versions.node.split('.')[0]) < 8) {
  console.warn('DEPRECATION NOTICE - Node 6 has been scheduled for removal from the Cloudinary SDK')
  module.exports = require('./lib-es5/cloudinary');
} else {
  module.exports = require('./lib/cloudinary');
}
