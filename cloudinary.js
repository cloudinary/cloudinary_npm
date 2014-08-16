require('coffee-script/register');
var _ = require('underscore');

exports.config = require("./lib/config");
exports.utils = require("./lib/utils");
exports.uploader = require("./lib/uploader");
exports.api = require("./lib/api");
exports.PreloadedFile = require("./lib/preloaded_file");

exports.url = function(public_id, options) {
  options = _.extend({}, options);
  return exports.utils.url(public_id, options);    
};    
exports.image = function(source, options) {
  options = options || {};
  source = exports.utils.url(source, options);
  if ("html_width" in options) options["width"] = exports.utils.option_consume(options, "html_width");
  if ("html_height" in options) options["height"] = exports.utils.option_consume(options, "html_height");

  var responsive = exports.utils.option_consume(options, "responsive");
  var hidpi = exports.utils.option_consume(options, "hidpi");
  if (responsive || hidpi) {
      options["data-src"] = source;
      classes = [responsive ? "cld-responsive" : "cld-hidpi"];
      current_class = exports.utils.option_consume(options, "class");
      if (current_class) classes.push(current_class);
      options["class"] = classes.join(" ");
      source = exports.utils.option_consume(options, "responsive_placeholder", exports.config().responsive_placeholder);
      if (source == "blank") {
          source = exports.BLANK;
      }
  }
  html = "<img ";
  if (source) html += "src='" + source + "' ";
  html += exports.utils.html_attrs(options) + "/>";
  return html;  	
}
exports.cloudinary_js_config = exports.utils.cloudinary_js_config;

exports.CF_SHARED_CDN = exports.utils.CF_SHARED_CDN;
exports.AKAMAI_SHARED_CDN = exports.utils.AKAMAI_SHARED_CDN;
exports.SHARED_CDN = exports.utils.SHARED_CDN;
exports.BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
exports.v2 = require('./lib/v2');
