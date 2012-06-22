exports.config = require("./lib/config");
exports.utils = require("./lib/utils");
exports.uploader = require("./lib/uploader");
exports.url = function(public_id, options) {
  options = _.extend({}, options);
  return exports.utils.url(public_id, options);    
};    

