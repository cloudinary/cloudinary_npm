"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Utilities
 * @module utils
 * @borrows module:auth_token as generate_auth_token
 */

var crypto = require("crypto");
var querystring = require("querystring");
var urlParse = require("url").parse;

// Functions used internally
var compact = require("lodash/compact");
var defaults = require("lodash/defaults");
var find = require("lodash/find");
var first = require("lodash/first");
var identity = require("lodash/identity");
var isFunction = require("lodash/isFunction");
var isPlainObject = require("lodash/isPlainObject");
var last = require("lodash/last");
var map = require("lodash/map");
var sortBy = require("lodash/sortBy");
var take = require("lodash/take");
var at = require("lodash/at");

// Exposed by the module
var clone = require("lodash/clone");
var extend = require("lodash/extend");
var filter = require("lodash/filter");
var includes = require("lodash/includes");
var isArray = require("lodash/isArray");
var isEmpty = require("lodash/isEmpty");
var isNumber = require("lodash/isNumber");
var isObject = require("lodash/isObject");
var isString = require("lodash/isString");
var isUndefined = require("lodash/isUndefined");
var keys = require("lodash/keys");
var merge = require("lodash/merge");

var config = require("../config");
var generate_token = require("../auth_token");
var utf8_encode = require('./utf8_encode');
var crc32 = require('./crc32');
var ensurePresenceOf = require('./ensurePresenceOf');
var ensureOption = require('./ensureOption').defaults(config());
var entries = require('./entries');

module.exports = {
  at,
  clone,
  extend,
  filter,
  includes,
  isArray,
  isEmpty,
  isNumber,
  isObject,
  isString,
  isUndefined,
  keys,
  merge,
  ensurePresenceOf
};
exports = module.exports;
var utils = module.exports;

exports.generate_auth_token = function generate_auth_token(options) {
  var token_options = Object.assign({}, config().auth_token, options);
  return generate_token(token_options);
};

exports.CF_SHARED_CDN = "d3jpl91pxevbkh.cloudfront.net";

exports.OLD_AKAMAI_SHARED_CDN = "cloudinary-a.akamaihd.net";

exports.AKAMAI_SHARED_CDN = "res.cloudinary.com";

exports.SHARED_CDN = exports.AKAMAI_SHARED_CDN;

try {
  exports.VERSION = require('../../package.json').version;
} catch (error) {}

exports.USER_AGENT = `CloudinaryNodeJS/${exports.VERSION}`;

// Add platform information to the USER_AGENT header
// This is intended for platform information and not individual applications!
exports.userPlatform = "";

exports.getUserAgent = function getUserAgent() {
  if (isEmpty(utils.userPlatform)) {
    return `${utils.USER_AGENT}`;
  } else {
    return `${utils.userPlatform} ${utils.USER_AGENT}`;
  }
};

var DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION = {
  width: "auto",
  crop: "limit"
};

exports.DEFAULT_POSTER_OPTIONS = {
  format: 'jpg',
  resource_type: 'video'
};

exports.DEFAULT_VIDEO_SOURCE_TYPES = ['webm', 'mp4', 'ogv'];

var CONDITIONAL_OPERATORS = {
  "=": 'eq',
  "!=": 'ne',
  "<": 'lt',
  ">": 'gt',
  "<=": 'lte',
  ">=": 'gte',
  "&&": 'and',
  "||": 'or',
  "*": "mul",
  "/": "div",
  "+": "add",
  "-": "sub"
};

var PREDEFINED_VARS = {
  "aspect_ratio": "ar",
  "aspectRatio": "ar",
  "current_page": "cp",
  "currentPage": "cp",
  "face_count": "fc",
  "faceCount": "fc",
  "height": "h",
  "initial_aspect_ratio": "iar",
  "initial_height": "ih",
  "initial_width": "iw",
  "initialAspectRatio": "iar",
  "initialHeight": "ih",
  "initialWidth": "iw",
  "page_count": "pc",
  "page_x": "px",
  "page_y": "py",
  "pageCount": "pc",
  "pageX": "px",
  "pageY": "py",
  "tags": "tags",
  "width": "w"
};

var LAYER_KEYWORD_PARAMS = {
  font_weight: "normal",
  font_style: "normal",
  text_decoration: "none",
  text_align: null,
  stroke: "none"
};

function textStyle(layer) {
  var font_family = layer["font_family"];
  var font_size = layer["font_size"];
  var keywords = [];
  for (var attr in LAYER_KEYWORD_PARAMS) {
    var default_value = LAYER_KEYWORD_PARAMS[attr];
    var attr_value = layer[attr] || default_value;
    if (attr_value !== default_value) {
      keywords.push(attr_value);
    }
  }
  var letter_spacing = layer["letter_spacing"];
  if (letter_spacing) {
    keywords.push(`letter_spacing_${letter_spacing}`);
  }
  var line_spacing = layer["line_spacing"];
  if (line_spacing) {
    keywords.push(`line_spacing_${line_spacing}`);
  }
  if (font_size || font_family || !isEmpty(keywords)) {
    if (!font_family) {
      throw "Must supply font_family for text in overlay/underlay";
    }
    if (!font_size) {
      throw "Must supply font_size for text in overlay/underlay";
    }
    keywords.unshift(font_size);
    keywords.unshift(font_family);
    return compact(keywords).join("_");
  }
}

/**
 * Normalize an offset value
 * @param {String} expression a decimal value which may have a 'p' or '%' postfix. E.g. '35%', '0.4p'
 * @return {Object|String} a normalized String of the input value if possible otherwise the value itself
 */
function normalize_expression(expression) {

  if (!isString(expression) || expression.length === 0 || expression.match(/^!.+!$/)) {
    return expression;
  }
  var operators = "\\|\\||>=|<=|&&|!=|>|=|<|/|-|\\+|\\*";
  var pattern = "((" + operators + ")(?=[ _])|" + Object.keys(PREDEFINED_VARS).join("|") + ")";
  var replaceRE = new RegExp(pattern, "g");
  expression = expression.replace(replaceRE, function (match) {
    return CONDITIONAL_OPERATORS[match] || PREDEFINED_VARS[match];
  });
  return expression.replace(/[ _]+/g, '_');
}

/**
 * Parse "if" parameter
 * Translates the condition if provided.
 * @private
 * @return {string} "if_" + ifValue
 */
function process_if(ifValue) {
  if (ifValue) {
    return "if_" + normalize_expression(ifValue);
  } else {
    return ifValue;
  }
}

/**
 * Parse layer options
 * @private
 * @param {object|*} layer The layer to parse.
 * @return {string} layer transformation string
 */
function process_layer(layer) {
  var result = '';
  if (isPlainObject(layer)) {
    if (layer["resource_type"] === "fetch" || layer["url"] != null) {
      result = `fetch:${base64EncodeURL(layer['url'])}`;
    } else {
      var public_id = layer["public_id"];
      var format = layer["format"];
      var resource_type = layer["resource_type"] || "image";
      var type = layer["type"] || "upload";
      var text = layer["text"];
      var style = null;
      var components = [];
      if (!isEmpty(public_id)) {
        public_id = public_id.replace(new RegExp("/", 'g'), ":");
        if (format != null) {
          public_id = `${public_id}.${format}`;
        }
      }
      if (isEmpty(text) && resource_type !== "text") {
        if (isEmpty(public_id)) {
          throw "Must supply public_id for resource_type layer_parameter";
        }
        if (resource_type === "subtitles") {
          style = textStyle(layer);
        }
      } else {
        resource_type = "text";
        type = null;
        // type is ignored for text layers
        style = textStyle(layer);
        if (!isEmpty(text)) {
          if (!(isEmpty(public_id) ^ isEmpty(style))) {
            throw "Must supply either style parameters or a public_id when providing text parameter in a text overlay/underlay";
          }
          var re = /\$\([a-zA-Z]\w*\)/g;
          var start = 0;
          var textSource = smart_escape(decodeURIComponent(text), /[,\/]/g);
          text = "";
          var res = void 0;
          while (res = re.exec(textSource)) {
            text += smart_escape(textSource.slice(start, res.index));
            text += res[0];
            start = res.index + res[0].length;
          }
          text += encodeURIComponent(textSource.slice(start));
        }
      }
      if (resource_type !== "image") {
        components.push(resource_type);
      }
      if (type !== "upload") {
        components.push(type);
      }
      components.push(style);
      components.push(public_id);
      components.push(text);
      result = compact(components).join(":");
    }
  } else if (/^fetch:.+/.test(layer)) {
    result = `fetch:${base64EncodeURL(layer.substr(6))}`;
  } else {
    result = layer;
  }
  return result;
}

function base64EncodeURL(url) {
  var ignore;
  try {
    url = decodeURI(url);
  } catch (error) {
    ignore = error;
  }
  url = encodeURI(url);
  return base64Encode(url);
}

function base64Encode(input) {
  if (!(input instanceof Buffer)) {
    input = new Buffer.from(String(input), 'binary');
  }
  return input.toString('base64');
}

exports.build_upload_params = function build_upload_params(options) {
  var params = {
    access_mode: options.access_mode,
    allowed_formats: options.allowed_formats && utils.build_array(options.allowed_formats).join(","),
    async: utils.as_safe_bool(options.async),
    backup: utils.as_safe_bool(options.backup),
    callback: options.callback,
    colors: utils.as_safe_bool(options.colors),
    discard_original_filename: utils.as_safe_bool(options.discard_original_filename),
    eager: utils.build_eager(options.eager),
    eager_async: utils.as_safe_bool(options.eager_async),
    eager_notification_url: options.eager_notification_url,
    exif: utils.as_safe_bool(options.exif),
    faces: utils.as_safe_bool(options.faces),
    folder: options.folder,
    format: options.format,
    image_metadata: utils.as_safe_bool(options.image_metadata),
    invalidate: utils.as_safe_bool(options.invalidate),
    moderation: options.moderation,
    notification_url: options.notification_url,
    overwrite: utils.as_safe_bool(options.overwrite),
    phash: utils.as_safe_bool(options.phash),
    proxy: options.proxy,
    public_id: options.public_id,
    responsive_breakpoints: utils.generate_responsive_breakpoints_string(options["responsive_breakpoints"]),
    return_delete_token: utils.as_safe_bool(options.return_delete_token),
    timestamp: exports.timestamp(),
    transformation: utils.generate_transformation_string(clone(options)),
    type: options.type,
    unique_filename: utils.as_safe_bool(options.unique_filename),
    upload_preset: options.upload_preset,
    use_filename: utils.as_safe_bool(options.use_filename)
  };
  return utils.updateable_resource_params(options, params);
};

exports.timestamp = function timestamp() {
  return Math.floor(new Date().getTime() / 1000);
};

/**
 * Deletes `option_name` from `options` and return the value if present.
 * If `options` doesn't contain `option_name` the default value is returned.
 * @param {Object} options a collection
 * @param {String} option_name the name (key) of the desired value
 * @param {*} [default_value] the value to return is option_name is missing
 */
exports.option_consume = function option_consume(options, option_name, default_value) {
  var result = options[option_name];
  delete options[option_name];
  if (result != null) {
    return result;
  } else {
    return default_value;
  }
};

exports.build_array = function build_array(arg) {
  if (arg == null) {
    return [];
  } else if (isArray(arg)) {
    return arg;
  } else {
    return [arg];
  }
};

exports.encode_double_array = function encode_double_array(array) {
  array = utils.build_array(array);
  if (array.length > 0 && isArray(array[0])) {
    return array.map(function (e) {
      return utils.build_array(e).join(",");
    }).join("|");
  } else {
    return array.join(",");
  }
};

exports.encode_key_value = function encode_key_value(arg) {
  if (isObject(arg)) {
    return entries(args).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];

      return `${k}=${v}`;
    }).join('|');
  } else {
    return arg;
  }
};

exports.encode_context = function encode_context(arg) {
  var k, pairs, v;
  if (isObject(arg)) {
    return entries(arg).map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          k = _ref4[0],
          v = _ref4[1];

      return `${k}=${v.replace(/([=|])/g, '\\$&')}`;
    }).join('|');
  } else {
    return arg;
  }
};

exports.build_eager = function build_eager(transformations) {
  return utils.build_array(transformations).map(function (transformation) {
    return [utils.generate_transformation_string(clone(transformation)), transformation.format].filter(utils.present).join('/');
  }).join('|');
};

/**
 * Build the custom headers for the request
 * @private
 * @param headers
 * @return {Array<string>|object|string} An object of name and value,
 *         an array of header strings, or a string of headers
 */
exports.build_custom_headers = function build_custom_headers(headers) {
  if (headers == null) {
    return void 0;
  } else if (isArray(headers)) {
    return headers.join("\n");
  } else if (isObject(headers)) {
    return entries(headers).map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          k = _ref6[0],
          v = _ref6[1];

      return `${k}:${v}`;
    }).join("\n");
  } else {
    return headers;
  }
};

var TRANSFORMATION_PARAMS = ['angle', 'aspect_ratio', 'audio_codec', 'audio_frequency', 'background', 'bit_rate', 'border', 'color', 'color_space', 'crop', 'default_image', 'delay', 'density', 'dpr', 'duration', 'effect', 'end_offset', 'fetch_format', 'flags', 'fps', 'gravity', 'height', 'if', 'keyframe_interval', 'offset', 'opacity', 'overlay', 'page', 'prefix', 'quality', 'radius', 'raw_transformation', 'responsive_width', 'size', 'start_offset', 'streaming_profile', 'transformation', 'underlay', 'variables', 'video_codec', 'video_sampling', 'width', 'x', 'y', 'zoom' // + any key that starts with '$'
];

exports.generate_transformation_string = function generate_transformation_string(options) {
  if (isArray(options)) {
    return options.map(function (t) {
      return utils.generate_transformation_string(clone(t));
    }).filter(utils.present).join('/');
  }
  var responsive_width = utils.option_consume(options, "responsive_width", config().responsive_width);
  var width = options["width"];
  var height = options["height"];
  var size = utils.option_consume(options, "size");
  if (size) {
    var _size$split, _size$split2;

    var _ref7 = (_size$split = size.split("x"), _size$split2 = _slicedToArray(_size$split, 2), width = _size$split2[0], height = _size$split2[1], _size$split);

    var _ref8 = _slicedToArray(_ref7, 2);

    options["width"] = _ref8[0];
    options["height"] = _ref8[1];
  }
  var has_layer = options.overlay || options.underlay;
  var crop = utils.option_consume(options, "crop");
  var angle = utils.build_array(utils.option_consume(options, "angle")).join(".");
  var no_html_sizes = has_layer || utils.present(angle) || crop === "fit" || crop === "limit" || responsive_width;
  if (width && (width.toString().indexOf("auto") === 0 || no_html_sizes || parseFloat(width) < 1)) {
    delete options["width"];
  }
  if (height && (no_html_sizes || parseFloat(height) < 1)) {
    delete options["height"];
  }
  var background = utils.option_consume(options, "background");
  background = background && background.replace(/^#/, "rgb:");
  var color = utils.option_consume(options, "color");
  color = color && color.replace(/^#/, "rgb:");
  var base_transformations = utils.build_array(utils.option_consume(options, "transformation", []));
  var named_transformation = [];
  if (base_transformations.length !== 0 && filter(base_transformations, isObject).length > 0) {
    base_transformations = map(base_transformations, function (base_transformation) {
      if (isObject(base_transformation)) {
        return utils.generate_transformation_string(clone(base_transformation));
      } else {
        return utils.generate_transformation_string({
          transformation: base_transformation
        });
      }
    });
  } else {
    named_transformation = base_transformations.join(".");
    base_transformations = [];
  }
  var effect = utils.option_consume(options, "effect");
  if (isArray(effect)) {
    effect = effect.join(":");
  } else if (isObject(effect)) {
    effect = entries(effect).map(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          key = _ref10[0],
          value = _ref10[1];

      return `${key}:${value}`;
    });
  }
  var border = utils.option_consume(options, "border");
  if (isObject(border)) {
    border = `${border.width != null ? border.width : 2}px_solid_${(border.color != null ? border.color : "black").replace(/^#/, 'rgb:')}`;
  } else if (/^\d+$/.exec(border)) {
    //fallback to html border attributes
    options.border = border;
    border = void 0;
  }
  var flags = utils.build_array(utils.option_consume(options, "flags")).join(".");
  var dpr = utils.option_consume(options, "dpr", config().dpr);
  if (options["offset"] != null) {
    var _split_range = split_range(utils.option_consume(options, "offset"));

    var _split_range2 = _slicedToArray(_split_range, 2);

    options["start_offset"] = _split_range2[0];
    options["end_offset"] = _split_range2[1];
  }
  var overlay = process_layer(utils.option_consume(options, "overlay"));
  var underlay = process_layer(utils.option_consume(options, "underlay"));
  var ifValue = process_if(utils.option_consume(options, "if"));
  var fps = utils.option_consume(options, 'fps');
  if (isArray(fps)) {
    fps = fps.join('-');
  }
  var params = {
    a: normalize_expression(angle),
    ar: normalize_expression(utils.option_consume(options, "aspect_ratio")),
    b: background,
    bo: border,
    c: crop,
    co: color,
    dpr: normalize_expression(dpr),
    e: normalize_expression(effect),
    fl: flags,
    fps: fps,
    h: normalize_expression(height),
    ki: normalize_expression(utils.option_consume(options, "keyframe_interval")),
    l: overlay,
    o: normalize_expression(utils.option_consume(options, "opacity")),
    q: normalize_expression(utils.option_consume(options, "quality")),
    r: normalize_expression(utils.option_consume(options, "radius")),
    t: named_transformation,
    u: underlay,
    w: normalize_expression(width),
    x: normalize_expression(utils.option_consume(options, "x")),
    y: normalize_expression(utils.option_consume(options, "y")),
    z: normalize_expression(utils.option_consume(options, "zoom"))
  };
  var simple_params = {
    audio_codec: "ac",
    audio_frequency: "af",
    bit_rate: 'br',
    color_space: "cs",
    default_image: "d",
    delay: "dl",
    density: "dn",
    duration: "du",
    end_offset: "eo",
    fetch_format: "f",
    gravity: "g",
    page: "pg",
    prefix: "p",
    start_offset: "so",
    streaming_profile: "sp",
    video_codec: "vc",
    video_sampling: "vs"
  };

  for (var param in simple_params) {
    var short = simple_params[param];
    var value = utils.option_consume(options, param);
    if (value !== undefined) {
      params[short] = value;
    }
  }
  if (params["vc"] != null) {
    params["vc"] = process_video_params(params["vc"]);
  }
  ["so", "eo", "du"].forEach(function (short) {
    if (params[short] !== undefined) {
      params[short] = norm_range_value(params[short]);
    }
  });

  var variablesParam = utils.option_consume(options, "variables", []);
  var variables = entries(options).filter(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
        key = _ref12[0],
        value = _ref12[1];

    return key.startsWith('$');
  }).map(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 2),
        key = _ref14[0],
        value = _ref14[1];

    delete options[key];
    return `${key}_${normalize_expression(value)}`;
  }).sort().concat(variablesParam.map(function (_ref15) {
    var _ref16 = _slicedToArray(_ref15, 2),
        name = _ref16[0],
        value = _ref16[1];

    return `${name}_${normalize_expression(value)}`;
  })).join(',');

  var transformations = entries(params).filter(function (_ref17) {
    var _ref18 = _slicedToArray(_ref17, 2),
        key = _ref18[0],
        value = _ref18[1];

    return utils.present(value);
  }).map(function (_ref19) {
    var _ref20 = _slicedToArray(_ref19, 2),
        key = _ref20[0],
        value = _ref20[1];

    return key + '_' + value;
  }).sort().join(',');

  var raw_transformation = utils.option_consume(options, 'raw_transformation');
  transformations = compact([ifValue, variables, transformations, raw_transformation]).join(",");
  base_transformations.push(transformations);
  transformations = base_transformations;
  if (responsive_width) {
    var responsive_width_transformation = config().responsive_width_transformation || DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION;
    transformations.push(utils.generate_transformation_string(clone(responsive_width_transformation)));
  }
  if (width != null && width.toString().indexOf("auto") === 0 || responsive_width) {
    options.responsive = true;
  }
  if (dpr === "auto") {
    options.hidpi = true;
  }
  return filter(transformations, utils.present).join("/");
};

exports.updateable_resource_params = function updateable_resource_params(options) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (options.access_control != null) {
    params.access_control = utils.jsonArrayParam(options.access_control);
  }
  if (options.auto_tagging != null) {
    params.auto_tagging = options.auto_tagging;
  }
  if (options.background_removal != null) {
    params.background_removal = options.background_removal;
  }
  if (options.categorization != null) {
    params.categorization = options.categorization;
  }
  if (options.context != null) {
    params.context = utils.encode_context(options.context);
  }
  if (options.custom_coordinates != null) {
    params.custom_coordinates = utils.encode_double_array(options.custom_coordinates);
  }
  if (options.detection != null) {
    params.detection = options.detection;
  }
  if (options.face_coordinates != null) {
    params.face_coordinates = utils.encode_double_array(options.face_coordinates);
  }
  if (options.headers != null) {
    params.headers = utils.build_custom_headers(options.headers);
  }
  if (options.notification_url != null) {
    params.notification_url = options.notification_url;
  }
  if (options.ocr != null) {
    params.ocr = options.ocr;
  }
  if (options.raw_convert != null) {
    params.raw_convert = options.raw_convert;
  }
  if (options.similarity_search != null) {
    params.similarity_search = options.similarity_search;
  }
  if (options.tags != null) {
    params.tags = utils.build_array(options.tags).join(",");
  }
  return params;
};

/**
 * A list of keys used by the url() function.
 * @private
 */
var URL_KEYS = ['api_secret', 'auth_token', 'cdn_subdomain', 'cloud_name', 'cname', 'format', 'private_cdn', 'resource_type', 'secure', 'secure_cdn_subdomain', 'secure_distribution', 'shorten', 'sign_url', 'ssl_detected', 'type', 'url_suffix', 'use_root_path', 'version'];

/**
 * Create a new object with only URL parameters
 * @param {object} options The source object
 * @return {Object} An object containing only URL parameters
 */
exports.extractUrlParams = function extractUrlParams(options) {
  return utils.only.apply(utils, [options].concat(URL_KEYS));
};

/**
 * Create a new object with only transformation parameters
 * @param {object} options The source object
 * @return {Object} An object containing only transformation parameters
 */
exports.extractTransformationParams = function extractTransformationParams(options) {
  return utils.only.apply(utils, [options].concat(TRANSFORMATION_PARAMS));
};

/**
 * Handle the format parameter for fetch urls
 * @private
 * @param options url and transformation options. This argument may be changed by the function!
 */
exports.patchFetchFormat = function patchFetchFormat() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (options.type === "fetch") {
    if (options.fetch_format == null) {
      options.fetch_format = utils.option_consume(options, "format");
    }
  }
};

exports.url = function url(public_id) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var signature = void 0,
      source_to_sign = void 0;
  utils.patchFetchFormat(options);
  var type = utils.option_consume(options, "type", null);
  var transformation = utils.generate_transformation_string(options);
  var resource_type = utils.option_consume(options, "resource_type", "image");
  var version = utils.option_consume(options, "version");
  var format = utils.option_consume(options, "format");
  var cloud_name = utils.option_consume(options, "cloud_name", config().cloud_name);
  if (!cloud_name) {
    throw "Unknown cloud_name";
  }
  var private_cdn = utils.option_consume(options, "private_cdn", config().private_cdn);
  var secure_distribution = utils.option_consume(options, "secure_distribution", config().secure_distribution);
  var secure = utils.option_consume(options, "secure", null);
  var ssl_detected = utils.option_consume(options, "ssl_detected", config().ssl_detected);
  if (secure === null) {
    secure = ssl_detected || config().secure;
  }
  var cdn_subdomain = utils.option_consume(options, "cdn_subdomain", config().cdn_subdomain);
  var secure_cdn_subdomain = utils.option_consume(options, "secure_cdn_subdomain", config().secure_cdn_subdomain);
  var cname = utils.option_consume(options, "cname", config().cname);
  var shorten = utils.option_consume(options, "shorten", config().shorten);
  var sign_url = utils.option_consume(options, "sign_url", config().sign_url);
  var api_secret = utils.option_consume(options, "api_secret", config().api_secret);
  var url_suffix = utils.option_consume(options, "url_suffix");
  var use_root_path = utils.option_consume(options, "use_root_path", config().use_root_path);
  var auth_token = utils.option_consume(options, "auth_token");
  if (auth_token !== false) {
    auth_token = exports.merge(config().auth_token, auth_token);
  }
  var preloaded = /^(image|raw)\/([a-z0-9_]+)\/v(\d+)\/([^#]+)$/.exec(public_id);
  if (preloaded) {
    resource_type = preloaded[1];
    type = preloaded[2];
    version = preloaded[3];
    public_id = preloaded[4];
  }
  var original_source = public_id;
  if (public_id == null) {
    return original_source;
  }
  public_id = public_id.toString();
  if (type === null && public_id.match(/^https?:\//i)) {
    return original_source;
  }

  var _finalize_resource_ty = finalize_resource_type(resource_type, type, url_suffix, use_root_path, shorten);

  var _finalize_resource_ty2 = _slicedToArray(_finalize_resource_ty, 2);

  resource_type = _finalize_resource_ty2[0];
  type = _finalize_resource_ty2[1];

  var _finalize_source = finalize_source(public_id, format, url_suffix);

  var _finalize_source2 = _slicedToArray(_finalize_source, 2);

  public_id = _finalize_source2[0];
  source_to_sign = _finalize_source2[1];

  if (source_to_sign.indexOf("/") > 0 && !source_to_sign.match(/^v[0-9]+/) && !source_to_sign.match(/^https?:\//)) {
    if (version == null) {
      version = 1;
    }
  }
  if (version != null) {
    version = `v${version}`;
  }
  transformation = transformation.replace(/([^:])\/\//g, '$1/');
  if (sign_url && isEmpty(auth_token)) {
    var to_sign = [transformation, source_to_sign].filter(function (part) {
      return part != null && part !== '';
    }).join('/');
    try {
      for (var i = 0; to_sign !== decodeURIComponent(to_sign) && i < 10; i++) {
        to_sign = decodeURIComponent(to_sign);
      }
    } catch (error) {}
    var shasum = crypto.createHash('sha1');
    shasum.update(utf8_encode(to_sign + api_secret), 'binary');
    signature = shasum.digest('base64').replace(/\//g, '_').replace(/\+/g, '-').substring(0, 8);
    signature = `s--${signature}--`;
  }
  var prefix = unsigned_url_prefix(public_id, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution);
  var resultUrl = [prefix, resource_type, type, signature, transformation, version, public_id].filter(function (part) {
    return part != null && part !== '';
  }).join('/');
  if (sign_url && !isEmpty(auth_token)) {
    auth_token.url = urlParse(resultUrl).path;
    var token = generate_token(auth_token);
    resultUrl += `?${token}`;
  }
  return resultUrl;
};

exports.video_url = function video_url(public_id, options) {
  options = extend({
    resource_type: 'video'
  }, options);
  return utils.url(public_id, options);
};

function finalize_source(source, format, url_suffix) {
  var source_to_sign;
  source = source.replace(/([^:])\/\//g, '$1/');
  if (source.match(/^https?:\//i)) {
    source = smart_escape(source);
    source_to_sign = source;
  } else {
    source = encodeURIComponent(decodeURIComponent(source)).replace(/%3A/g, ":").replace(/%2F/g, "/");
    source_to_sign = source;
    if (!!url_suffix) {
      if (url_suffix.match(/[\.\/]/)) {
        throw new Error('url_suffix should not include . or /');
      }
      source = source + '/' + url_suffix;
    }
    if (format != null) {
      source = source + '.' + format;
      source_to_sign = source_to_sign + '.' + format;
    }
  }
  return [source, source_to_sign];
}
exports.video_thumbnail_url = function video_thumbnail_url(public_id, options) {
  options = extend({}, exports.DEFAULT_POSTER_OPTIONS, options);
  return utils.url(public_id, options);
};

function finalize_resource_type(resource_type, type, url_suffix, use_root_path, shorten) {
  if (type == null) {
    type = 'upload';
  }
  if (url_suffix != null) {
    if (resource_type === 'image' && type === 'upload') {
      resource_type = "images";
      type = null;
    } else if (resource_type === 'image' && type === 'private') {
      resource_type = 'private_images';
      type = null;
    } else if (resource_type === 'image' && type === 'authenticated') {
      resource_type = 'authenticated_images';
      type = null;
    } else if (resource_type === 'raw' && type === 'upload') {
      resource_type = 'files';
      type = null;
    } else if (resource_type === 'video' && type === 'upload') {
      resource_type = 'videos';
      type = null;
    } else {
      throw new Error("URL Suffix only supported for image/upload, image/private, image/authenticated, video/upload and raw/upload");
    }
  }
  if (use_root_path) {
    if (resource_type === 'image' && type === 'upload' || resource_type === 'images' && type == null) {
      resource_type = null;
      type = null;
    } else {
      throw new Error("Root path only supported for image/upload");
    }
  }
  if (shorten && resource_type === 'image' && type === 'upload') {
    resource_type = 'iu';
    type = null;
  }
  return [resource_type, type];
}
// cdn_subdomain and secure_cdn_subdomain
// 1) Customers in shared distribution (e.g. res.cloudinary.com)
//   if cdn_domain is true uses res-[1-5].cloudinary.com for both http and https. Setting secure_cdn_subdomain to false disables this for https.
// 2) Customers with private cdn
//   if cdn_domain is true uses cloudname-res-[1-5].cloudinary.com for http
//   if secure_cdn_domain is true uses cloudname-res-[1-5].cloudinary.com for https (please contact support if you require this)
// 3) Customers with cname
//   if cdn_domain is true uses a[1-5].cname for http. For https, uses the same naming scheme as 1 for shared distribution and as 2 for private distribution.

function unsigned_url_prefix(source, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution) {
  var prefix = void 0;
  if (cloud_name.indexOf("/") === 0) {
    return '/res' + cloud_name;
  }
  var shared_domain = !private_cdn;
  if (secure) {
    if (secure_distribution == null || secure_distribution === exports.OLD_AKAMAI_SHARED_CDN) {
      secure_distribution = private_cdn ? cloud_name + "-res.cloudinary.com" : exports.SHARED_CDN;
    }
    if (shared_domain == null) {
      shared_domain = secure_distribution === exports.SHARED_CDN;
    }
    if (secure_cdn_subdomain == null && shared_domain) {
      secure_cdn_subdomain = cdn_subdomain;
    }
    if (secure_cdn_subdomain) {
      secure_distribution = secure_distribution.replace('res.cloudinary.com', 'res-' + (crc32(source) % 5 + 1 + '.cloudinary.com'));
    }
    prefix = 'https://' + secure_distribution;
  } else if (cname) {
    var subdomain = cdn_subdomain ? 'a' + (crc32(source) % 5 + 1) + '.' : '';
    prefix = 'http://' + subdomain + cname;
  } else {
    var cdn_part = private_cdn ? cloud_name + '-' : '';
    var subdomain_part = cdn_subdomain ? '-' + (crc32(source) % 5 + 1) : '';
    var host = [cdn_part, 'res', subdomain_part, '.cloudinary.com'].join('');
    prefix = 'http://' + host;
  }
  if (shared_domain) {
    prefix += '/' + cloud_name;
  }
  return prefix;
}
// Based on CGI::unescape. In addition does not escape / :
//smart_escape = (string)->
//  encodeURIComponent(string).replace(/%3A/g, ":").replace(/%2F/g, "/")
function smart_escape(string) {
  var unsafe = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : /([^a-zA-Z0-9_.\-\/:]+)/g;

  return string.replace(unsafe, function (match) {
    return match.split("").map(function (c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    }).join("");
  });
}
exports.api_url = function api_url() {
  var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'upload';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var cloudinary = ensureOption(options, "upload_prefix", "https://api.cloudinary.com");
  var cloud_name = ensureOption(options, "cloud_name");
  var resource_type = options["resource_type"] || "image";
  return [cloudinary, "v1_1", cloud_name, resource_type, action].join("/");
};

exports.random_public_id = function random_public_id() {
  return crypto.randomBytes(12).toString('base64').replace(/[^a-z0-9]/g, "");
};

exports.signed_preloaded_image = function signed_preloaded_image(result) {
  return `${result.resource_type}/upload/v${result.version}/${filter([result.public_id, result.format], utils.present).join(".")}#${result.signature}`;
};

exports.api_sign_request = function api_sign_request(params_to_sign, api_secret) {
  var to_sign = entries(params_to_sign).filter(function (_ref21) {
    var _ref22 = _slicedToArray(_ref21, 2),
        k = _ref22[0],
        v = _ref22[1];

    return utils.present(v);
  }).map(function (_ref23) {
    var _ref24 = _slicedToArray(_ref23, 2),
        k = _ref24[0],
        v = _ref24[1];

    return `${k}=${utils.build_array(v).join(",")}`;
  }).sort().join("&");
  var shasum = crypto.createHash('sha1');
  shasum.update(utf8_encode(to_sign + api_secret), 'binary');
  return shasum.digest('hex');
};

exports.clear_blank = function clear_blank(hash) {
  var filtered_hash = {};
  entries(hash).filter(function (_ref25) {
    var _ref26 = _slicedToArray(_ref25, 2),
        k = _ref26[0],
        v = _ref26[1];

    return utils.present(v);
  }).forEach(function (_ref27) {
    var _ref28 = _slicedToArray(_ref27, 2),
        k = _ref28[0],
        v = _ref28[1];

    filtered_hash[k] = v;
  });
  return filtered_hash;
};

exports.merge = function merge(hash1, hash2) {
  return _extends({}, hash1, hash2);
};

exports.sign_request = function sign_request(params) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var apiKey = ensureOption(options, 'api_key');
  var apiSecret = ensureOption(options, 'api_secret');
  params = exports.clear_blank(params);
  params.signature = exports.api_sign_request(params, apiSecret);
  params.api_key = apiKey;
  return params;
};

exports.webhook_signature = function webhook_signature(data, timestamp) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  ensurePresenceOf({ data, timestamp });

  var api_secret = ensureOption(options, 'api_secret');
  var shasum = crypto.createHash('sha1');
  shasum.update(data + timestamp + api_secret, 'binary');
  return shasum.digest('hex');
};

exports.process_request_params = function process_request_params(params, options) {
  if (options.unsigned != null && options.unsigned) {
    params = exports.clear_blank(params);
    delete params["timestamp"];
  } else {
    params = exports.sign_request(params, options);
  }
  return params;
};

exports.private_download_url = function private_download_url(public_id, format) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = exports.sign_request({
    timestamp: exports.timestamp(),
    public_id: public_id,
    format: format,
    type: options.type,
    attachment: options.attachment,
    expires_at: options.expires_at
  }, options);
  return exports.api_url("download", options) + "?" + querystring.stringify(params);
};

/**
 * Utility method that uses the deprecated ZIP download API.
 * @deprecated Replaced by {download_zip_url} that uses the more advanced and robust archive generation and download API
 */
exports.zip_download_url = function zip_download_url(tag) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var params = exports.sign_request({
    timestamp: exports.timestamp(),
    tag: tag,
    transformation: utils.generate_transformation_string(options)
  }, options);
  return exports.api_url("download_tag.zip", options) + "?" + hashToQuery(params);
};

/**
 * Returns a URL that when invokes creates an archive and returns it.
 * @param {object} options
 * @param {string} [options.resource_type="image"]  The resource type of files to include in the archive. Must be one of :image | :video | :raw
 * @param {string} [options.type="upload"] The specific file type of resources: :upload|:private|:authenticated
 * @param {string|Array} [options.tags] list of tags to include in the archive
 * @param {string|Array<string>} [options.public_ids] list of public_ids to include in the archive
 * @param {string|Array<string>} [options.prefixes]  list of prefixes of public IDs (e.g., folders).
 * @param {string|Array<string>} [options.transformations]  list of transformations.
 *   The derived images of the given transformations are included in the archive. Using the string representation of
 *   multiple chained transformations as we use for the 'eager' upload parameter.
 * @param {string} [options.mode="create"] return the generated archive file or to store it as a raw resource and
 *   return a JSON with URLs for accessing the archive. Possible values: :download, :create
 * @param {string} [options.target_format="zip"]
 * @param {string} [options.target_public_id]  public ID of the generated raw resource.
 *   Relevant only for the create mode. If not specified, random public ID is generated.
 * @param {boolean} [options.flatten_folders=false] If true, flatten public IDs with folders to be in the root of the archive.
 *   Add numeric counter to the file name in case of a name conflict.
 * @param {boolean} [options.flatten_transformations=false] If true, and multiple transformations are given,
 *   flatten the folder structure of derived images and store the transformation details on the file name instead.
 * @param {boolean} [options.use_original_filename] Use the original file name of included images (if available) instead of the public ID.
 * @param {boolean} [options.async=false] If true, return immediately and perform the archive creation in the background.
 *   Relevant only for the create mode.
 * @param {string} [options.notification_url]  URL to send an HTTP post request (webhook) when the archive creation is completed.
 * @param {string|Array<string>} [options.target_tags=]  array. Allows assigning one or more tag to the generated archive file (for later housekeeping via the admin API).
 * @param {string} [options.keep_derived=false] keep the derived images used for generating the archive
 * @return {String} archive url
 */
exports.download_archive_url = function download_archive_url() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var cloudinary_params = exports.sign_request(exports.archive_params(merge(options, {
    mode: "download"
  })), options);
  return exports.api_url("generate_archive", options) + "?" + hashToQuery(cloudinary_params);
};

/**
 * Returns a URL that when invokes creates an zip archive and returns it.
 * @see download_archive_url
 */
exports.download_zip_url = function download_zip_url() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return exports.download_archive_url(merge(options, {
    target_format: "zip"
  }));
};

/**
 * Render the key/value pair as an HTML tag attribute
 * @private
 * @param {string} key
 * @param {string|boolean|number} [value]
 * @return {string} A string representing the HTML attribute
 */
function join_pair(key, value) {
  if (!value) {
    return void 0;
  } else if (value === true) {
    return key;
  } else {
    return key + "='" + value + "'";
  }
}

/**
 *
 * @param attrs
 * @return {*}
 */
exports.html_attrs = function html_attrs(attrs) {
  return filter(map(attrs, function (value, key) {
    return join_pair(key, value);
  })).sort().join(" ");
};

var CLOUDINARY_JS_CONFIG_PARAMS = ['api_key', 'cloud_name', 'private_cdn', 'secure_distribution', 'cdn_subdomain'];

exports.cloudinary_js_config = function cloudinary_js_config() {
  var params = utils.only.apply(utils, [config()].concat(CLOUDINARY_JS_CONFIG_PARAMS));
  return `<script type='text/javascript'>\n$.cloudinary.config(${JSON.stringify(params)});\n</script>`;
};

function v1_result_adapter(callback) {
  if (callback != null) {
    return function (result) {
      if (result.error != null) {
        return callback(result.error);
      } else {
        return callback(void 0, result);
      }
    };
  } else {
    return undefined;
  }
}
function v1_adapter(name, num_pass_args, v1) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var pass_args = take(args, num_pass_args);
    var options = args[num_pass_args];
    var callback = args[num_pass_args + 1];
    if (callback == null && isFunction(options)) {
      callback = options;
      options = {};
    }
    callback = v1_result_adapter(callback);
    args = pass_args.concat([callback, options]);
    return v1[name].apply(this, args);
  };
}
exports.v1_adapters = function v1_adapters(exports, v1, mapping) {
  var name, num_pass_args, results;
  results = [];
  for (name in mapping) {
    num_pass_args = mapping[name];
    results.push(exports[name] = v1_adapter(name, num_pass_args, v1));
  }
  return results;
};

exports.as_safe_bool = function as_safe_bool(value) {
  if (value == null) {
    return void 0;
  }
  if (value === true || value === 'true' || value === '1') {
    value = 1;
  }
  if (value === false || value === 'false' || value === '0') {
    value = 0;
  }
  return value;
};

var NUMBER_PATTERN = "([0-9]*)\\.([0-9]+)|([0-9]+)";

var OFFSET_ANY_PATTERN = `(${NUMBER_PATTERN})([%pP])?`;
var RANGE_VALUE_RE = RegExp(`^${OFFSET_ANY_PATTERN}$`);
var OFFSET_ANY_PATTERN_RE = RegExp(`(${OFFSET_ANY_PATTERN})\\.\\.(${OFFSET_ANY_PATTERN})`);

// Split a range into the start and end values
function split_range(range) {
  // :nodoc:
  switch (range.constructor) {
    case String:
      if (OFFSET_ANY_PATTERN_RE.test(range)) {
        return range.split("..");
      }
      break;
    case Array:
      return [first(range), last(range)];
    default:
      return [null, null];
  }
}

function norm_range_value(value) {
  // :nodoc:
  var offset = String(value).match(RANGE_VALUE_RE);
  if (offset) {
    var modifier = offset[5] ? 'p' : '';
    value = `${offset[1] || offset[4]}${modifier}`;
  }
  return value;
}

/**
 * A video codec parameter can be either a String or a Hash.
 * @param {Object} param <code>vc_<codec>[ : <profile> : [<level>]]</code>
 *                       or <code>{ codec: 'h264', profile: 'basic', level: '3.1' }</code>
 * @return {String} <code><codec> : <profile> : [<level>]]</code> if a Hash was provided
 *                   or the param if a String was provided.
 *                   Returns null if param is not a Hash or String
 */
function process_video_params(param) {
  switch (param.constructor) {
    case Object:
      var video = "";
      if ('codec' in param) {
        video = param['codec'];
        if ('profile' in param) {
          video += ":" + param['profile'];
          if ('level' in param) {
            video += ":" + param['level'];
          }
        }
      }
      return video;
    case String:
      return param;
    default:
      return null;
  }
}
/**
 * Returns a Hash of parameters used to create an archive
 * @private
 * @param {object} options
 * @return {object} Archive API parameters
 */
exports.archive_params = function archive_params() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return {
    allow_missing: exports.as_safe_bool(options.allow_missing),
    async: exports.as_safe_bool(options.async),
    expires_at: options.expires_at,
    flatten_folders: exports.as_safe_bool(options.flatten_folders),
    flatten_transformations: exports.as_safe_bool(options.flatten_transformations),
    keep_derived: exports.as_safe_bool(options.keep_derived),
    mode: options.mode,
    notification_url: options.notification_url,
    prefixes: options.prefixes && exports.build_array(options.prefixes),
    public_ids: options.public_ids && exports.build_array(options.public_ids),
    skip_transformation_name: exports.as_safe_bool(options.skip_transformation_name),
    tags: options.tags && exports.build_array(options.tags),
    target_format: options.target_format,
    target_public_id: options.target_public_id,
    target_tags: options.target_tags && exports.build_array(options.target_tags),
    timestamp: options.timestamp ? options.timestamp : exports.timestamp(),
    transformations: utils.build_eager(options.transformations),
    type: options.type,
    use_original_filename: exports.as_safe_bool(options.use_original_filename)
  };
};

exports.build_explicit_api_params = function build_explicit_api_params(public_id) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return [exports.build_upload_params(extend({}, { public_id }, options))];
};

exports.generate_responsive_breakpoints_string = function generate_responsive_breakpoints_string(breakpoints) {
  if (breakpoints == null) {
    return;
  }
  breakpoints = clone(breakpoints);
  if (!isArray(breakpoints)) {
    breakpoints = [breakpoints];
  }
  for (var j = 0; j < breakpoints.length; j++) {
    var breakpoint_settings = breakpoints[j];
    if (breakpoint_settings != null) {
      if (breakpoint_settings.transformation) {
        breakpoint_settings.transformation = utils.generate_transformation_string(clone(breakpoint_settings.transformation));
      }
    }
  }
  return JSON.stringify(breakpoints);
};

exports.build_streaming_profiles_param = function build_streaming_profiles_param() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var params = utils.only(options, "display_name", "representations");
  if (isArray(params["representations"])) {
    params["representations"] = JSON.stringify(params["representations"].map(function (r) {
      return {
        transformation: utils.generate_transformation_string(r.transformation)
      };
    }));
  }
  return params;
};

/**
 * Convert a hash of values to a URI query string.
 * Array values are spread as individual parameters.
 * @param {object} hash Key-value parameters
 * @return {string} A URI query string.
 */
function hashToQuery(hash) {
  return entries(hash).reduce(function (entries, _ref29) {
    var _ref30 = _slicedToArray(_ref29, 2),
        key = _ref30[0],
        value = _ref30[1];

    if (isArray(value)) {
      key = key.endsWith('[]') ? key : key + '[]';
      var items = value.map(function (v) {
        return [key, v];
      });
      entries = entries.concat(items);
    } else {
      entries.push([key, value]);
    }
    return entries;
  }, []).map(function (_ref31) {
    var _ref32 = _slicedToArray(_ref31, 2),
        key = _ref32[0],
        value = _ref32[1];

    return `${querystring.escape(key)}=${querystring.escape(value)}`;
  }).join('&');
}

/**
 * Verify that the parameter `value` is defined and it's string value is not zero.
 * <br>This function should not be confused with `isEmpty()`.
 * @private
 * @param {string|number} value The value to check.
 * @return {boolean} True if the value is defined and not empty.
 */
exports.present = function present(value) {
  return value != null && ("" + value).length > 0;
};

/**
 * Returns a new object with key values from source based on the keys.
 * `null` or `undefined` values are not copied.
 * @private
 * @param {object} source The object to pick values from.
 * @param {...string} keys One or more keys to copy from source.
 * @return {object} A new object with the required keys and values.
 */
exports.only = function only(source) {
  var result = {};
  if (source) {
    for (var _len2 = arguments.length, keys = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      keys[_key2 - 1] = arguments[_key2];
    }

    for (var j = 0; j < keys.length; j++) {
      var key = keys[j];
      if (source[key] != null) {
        result[key] = source[key];
      }
    }
  }
  return result;
};

/**
 * Returns a JSON array as String.
 * Yields the array before it is converted to JSON format
 * @private
 * @param {object|String|Array<object>} data
 * @param {function(*):*} [modifier] called with the array before the array is stringified
 * @return {String|null} a JSON array string or `null` if data is `null`
 */
exports.jsonArrayParam = function jsonArrayParam(data, modifier) {
  if (!data) {
    return null;
  }
  if (isString(data)) {
    data = JSON.parse(data);
  }
  if (!isArray(data)) {
    data = [data];
  }
  if (isFunction(modifier)) {
    data = modifier(data);
  }
  return JSON.stringify(data);
};

/**
 * Empty function - do nothing
 *
 */
exports.NOP = function () {};