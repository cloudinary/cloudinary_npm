module.exports = Number(process.versions.node[0]) < 8 ? require('./lib-es5/cloudinary') : require('./lib/cloudinary');
