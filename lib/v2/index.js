(function() {
  var _, v1, v2;

  v1 = require('../../cloudinary.js');

  _ = require('lodash');

  v2 = _.clone(v1);

  v2.api = require('./api');

  v2.uploader = require('./uploader');

  v2.search = require('./search');

  module.exports = v2;

}).call(this);

//# sourceMappingURL=index.js.map
