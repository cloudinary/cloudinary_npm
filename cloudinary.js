module.exports = process.versions.node[0] === '4' ? require('./lib-node4/cloudinary') : require('./lib/cloudinary');
