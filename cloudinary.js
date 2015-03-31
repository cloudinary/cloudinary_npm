var _ = require('lodash');
var cloudinary = module.exports;
exports.config = require("./lib/config");
exports.utils = require("./lib/utils");
exports.uploader = require("./lib/uploader");
exports.api = require("./lib/api");
exports.PreloadedFile = require("./lib/preloaded_file");

exports.url = function(public_id, options) {
  options = _.extend({}, options);
  return cloudinary.utils.url(public_id, options);
};    
exports.image = function(source, options) {
  options = options || {};
  source = cloudinary.utils.url(source, options);
  if ("html_width" in options) options["width"] = cloudinary.utils.option_consume(options, "html_width");
  if ("html_height" in options) options["height"] = cloudinary.utils.option_consume(options, "html_height");

  var responsive = cloudinary.utils.option_consume(options, "responsive");
  var hidpi = cloudinary.utils.option_consume(options, "hidpi");
  if (responsive || hidpi) {
      options["data-src"] = source;
      classes = [responsive ? "cld-responsive" : "cld-hidpi"];
      current_class = cloudinary.utils.option_consume(options, "class");
      if (current_class) classes.push(current_class);
      options["class"] = classes.join(" ");
      source = cloudinary.utils.option_consume(options, "responsive_placeholder", cloudinary.config().responsive_placeholder);
      if (source == "blank") {
          source = cloudinary.BLANK;
      }
  }
  html = "<img ";
  if (source) html += "src='" + source + "' ";
  html += cloudinary.utils.html_attrs(options) + "/>";
  return html;  	
}
exports.cloudinary_js_config =cloudinary.utils.cloudinary_js_config;

exports.CF_SHARED_CDN =cloudinary.utils.CF_SHARED_CDN;
exports.AKAMAI_SHARED_CDN =cloudinary.utils.AKAMAI_SHARED_CDN;
exports.SHARED_CDN =cloudinary.utils.SHARED_CDN;
exports.BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
exports.v2 = require('./lib/v2');
