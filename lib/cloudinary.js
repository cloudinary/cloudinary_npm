const _ = require('lodash');
const cloudinary = module.exports;
exports.config = require("./config");
exports.utils = require("./utils");
exports.uploader = require("./uploader");
exports.api = require("./api");
exports.PreloadedFile = require("./preloaded_file");
exports.Cache = require('./cache');

const optionConsume = cloudinary.utils.option_consume;
const ensureOption = require('./utils/ensureOption').defaults(cloudinary.config());

exports.url = function url(public_id, options) {
  options = _.extend({}, options);
  return cloudinary.utils.url(public_id, options);
};

const {generateImageResponsiveAttributes, generateMediaAttr} = require('./utils/srcsetUtils');

/**
 * Helper function, allows chaining transformation to the end of transformation list
 *
 * @private
 * @param {object} options Original options
 * @param {object|object[]} transformation Transformations to chain at the end
 *
 * @return {object} Resulting options
 */
function chainTransformations(options, transformation=[])
{
  // preserve url options
  let urlOptions = cloudinary.utils.extractUrlParams(options);
  let currentTransformation = cloudinary.utils.extractTransformationParams(options);
  transformation = cloudinary.utils.build_array(transformation);
  urlOptions["transformation"] = [currentTransformation, ...transformation];
  return urlOptions;
}

/**
 * @type {typeof Common.image}
 */
exports.image = function image(source, options) {
  let localOptions = _.extend({}, options);
  let srcsetParam = optionConsume(localOptions, 'srcset');
  let attributes = optionConsume(localOptions, 'attributes', {});
  let src = cloudinary.utils.url(source, localOptions);
  if ("html_width" in localOptions) localOptions["width"] = optionConsume(localOptions, "html_width");
  if ("html_height" in localOptions) localOptions["height"] = optionConsume(localOptions, "html_height");

  let client_hints = optionConsume(localOptions, "client_hints", cloudinary.config().client_hints);
  let responsive = optionConsume(localOptions, "responsive");
  let hidpi = optionConsume(localOptions, "hidpi");

  if ((responsive || hidpi) && !client_hints) {
    localOptions["data-src"] = src;
    let classes = [responsive ? "cld-responsive" : "cld-hidpi"];
    let current_class = optionConsume(localOptions, "class");
    if (current_class) classes.push(current_class);
    localOptions["class"] = classes.join(" ");
    src = optionConsume(localOptions, "responsive_placeholder", cloudinary.config().responsive_placeholder);
    if (src === "blank") {
      src = cloudinary.BLANK;
    }
  }
  let html = "<img ";
  if (src) html += "src='" + src + "' ";
  let responsiveAttributes = {};
  if (cloudinary.utils.isString(srcsetParam)) {
    responsiveAttributes.srcset = srcsetParam
  } else {
    responsiveAttributes = generateImageResponsiveAttributes(source, attributes, srcsetParam, options);
  }
  if(!cloudinary.utils.isEmpty(responsiveAttributes)) {
    delete localOptions.width;
    delete localOptions.height;
  }
  html += cloudinary.utils.html_attrs(_.extend(localOptions, responsiveAttributes, attributes)) + "/>";
  return html;
};

/**
 * @type {typeof Common.video}
 */
exports.video = function video(public_id, options) {
  options = _.extend({}, options);
  public_id = public_id.replace(/\.(mp4|ogv|webm)$/, '');
  let source_types = optionConsume(options, 'source_types', []);
  let source_transformation = optionConsume(options, 'source_transformation', {});
  let fallback = optionConsume(options, 'fallback_content', '');

  if (source_types.length === 0) source_types = cloudinary.utils.DEFAULT_VIDEO_SOURCE_TYPES;
  let video_options = _.cloneDeep(options);

  if (video_options.hasOwnProperty('poster')) {
    if (_.isPlainObject(video_options.poster)) {
      if (video_options.poster.hasOwnProperty('public_id')) {
        video_options.poster = cloudinary.utils.url(video_options.poster.public_id, video_options.poster);
      } else {
        video_options.poster = cloudinary.utils.url(public_id, _.extend({}, cloudinary.utils.DEFAULT_POSTER_OPTIONS, video_options.poster));
      }
    }
  } else {
    video_options.poster = cloudinary.utils.url(public_id, _.extend({}, cloudinary.utils.DEFAULT_POSTER_OPTIONS, options));
  }

  if (!video_options.poster) delete video_options.poster;

  let html = '<video ';

  if (!video_options.hasOwnProperty('resource_type')) video_options.resource_type = 'video';
  let multi_source = _.isArray(source_types) && source_types.length > 1;
  let source = public_id;
  if (!multi_source) {
    source = source + '.' + cloudinary.utils.build_array(source_types)[0];
  }
  let src = cloudinary.utils.url(source, video_options);
  if (!multi_source) video_options.src = src;
  if (video_options.hasOwnProperty("html_width")) video_options.width = optionConsume(video_options, 'html_width');
  if (video_options.hasOwnProperty("html_height")) video_options.height = optionConsume(video_options, 'html_height');
  html = html + cloudinary.utils.html_attrs(video_options) + '>';
  if (multi_source) {
    html += source_types.map(source_type => {
      let transformation = source_transformation[source_type] || {};
      let src = cloudinary.utils.url(source + "." + source_type, _.extend({resource_type: 'video'}, _.cloneDeep(options), _.cloneDeep(transformation)));
      let video_type = source_type === 'ogv' ? 'ogg' : source_type;
      let type = "video/" + video_type;
      return `<source ${cloudinary.utils.html_attrs({src, type})}>`;
    }).join('');
  }

  html = html + fallback;
  html = html + '</video>';
  return html;
};

/**
 * @type {typeof Common.source}
 */
exports.source = function source(public_id, options={}){
  let srcsetParam = cloudinary.utils.extend({}, options.srcset, cloudinary.config().srcset);
  let attributes = options.attributes || {};

  cloudinary.utils.extend(attributes, generateImageResponsiveAttributes(public_id, attributes, srcsetParam, options));
  if(!attributes.srcset){
    attributes.srcset = cloudinary.url(public_id, options);
  }
  if(!attributes.media && options.media){
    attributes.media = generateMediaAttr(options.media);
  }
  return `<source ${cloudinary.utils.html_attrs(attributes)}>`;
};

/**
 * @type {typeof Common.picture}
 */
exports.picture = function picture(public_id, options={}){
  let sources = options.sources || [];
  options = cloudinary.utils.clone(options);
  delete options.sources;
  cloudinary.utils.patchFetchFormat(options);
  return "<picture>" +
    sources.map(source=> {
      let sourceOptions = chainTransformations(options, source.transformation);
      sourceOptions.media = source;
      return cloudinary.source(public_id, sourceOptions);
    }).join('') +
    cloudinary.image(public_id, options) +
    "</picture>";
};

exports.cloudinary_js_config = cloudinary.utils.cloudinary_js_config;
exports.CF_SHARED_CDN = cloudinary.utils.CF_SHARED_CDN;
exports.AKAMAI_SHARED_CDN = cloudinary.utils.AKAMAI_SHARED_CDN;
exports.SHARED_CDN = cloudinary.utils.SHARED_CDN;
exports.BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
exports.v2 = require('./v2');
