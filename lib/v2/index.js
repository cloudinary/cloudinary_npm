(function() {
  var clone, v1, v2;

  v1 = require('../../cloudinary.js');

  clone = require('lodash/clone');

  v2 = clone(v1);

  v2.api = require('./api');

  v2.uploader = require('./uploader');

  v2.search = require('./search');

  module.exports = v2;

}).call(this);

//# sourceMappingURL=index.js.map
