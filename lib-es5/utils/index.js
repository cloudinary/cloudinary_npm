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
var first = require("lodash/first");
var isFunction = require("lodash/isFunction");
var isPlainObject = require("lodash/isPlainObject");
var last = require("lodash/last");
var map = require("lodash/map");
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
var smart_escape = require("./smart_escape").smart_escape;

var config = require("../config");
var generate_token = require("../auth_token");
var utf8_encode = require('./utf8_encode');
var crc32 = require('./crc32');
var ensurePresenceOf = require('./ensurePresenceOf');
var ensureOption = require('./ensureOption').defaults(config());
var entries = require('./entries');
var isRemoteUrl = require('./isRemoteUrl');

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
  isRemoteUrl,
  isString,
  isUndefined,
  keys: function keys(source) {
    return Object.keys(source);
  },
  ensurePresenceOf
};
exports = module.exports;
var utils = module.exports;

try {
  // eslint-disable-next-line global-require
  utils.VERSION = require('../../package.json').version;
} catch (error) {
  utils.VERSION = '';
}

function generate_auth_token(options) {
  var token_options = Object.assign({}, config().auth_token, options);
  return generate_token(token_options);
}

exports.CF_SHARED_CDN = "d3jpl91pxevbkh.cloudfront.net";

exports.OLD_AKAMAI_SHARED_CDN = "cloudinary-a.akamaihd.net";

exports.AKAMAI_SHARED_CDN = "res.cloudinary.com";

exports.SHARED_CDN = exports.AKAMAI_SHARED_CDN;

exports.USER_AGENT = `CloudinaryNodeJS/${exports.VERSION}`;

// Add platform information to the USER_AGENT header
// This is intended for platform information and not individual applications!
exports.userPlatform = "";

function getUserAgent() {
  return isEmpty(utils.userPlatform) ? `${utils.USER_AGENT}` : `${utils.userPlatform} ${utils.USER_AGENT}`;
}

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
  "duration": "du",
  "face_count": "fc",
  "faceCount": "fc",
  "height": "h",
  "initial_aspect_ratio": "iar",
  "initial_height": "ih",
  "initial_width": "iw",
  "initialAspectRatio": "iar",
  "initialHeight": "ih",
  "initialWidth": "iw",
  "initial_duration": "idu",
  "initialDuration": "idu",
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
  var keywords = [];
  var style = "";
  Object.keys(LAYER_KEYWORD_PARAMS).forEach(function (attr) {
    var default_value = LAYER_KEYWORD_PARAMS[attr];
    var attr_value = layer[attr] || default_value;
    if (attr_value !== default_value) {
      keywords.push(attr_value);
    }
  });

  Object.keys(layer).forEach(function (attr) {
    if (attr === "letter_spacing" || attr === "line_spacing") {
      keywords.push(`${attr}_${layer[attr]}`);
    }
    if (attr === "font_hinting") {
      keywords.push(`${attr.split("_").pop()}_${layer[attr]}`);
    }
    if (attr === "font_antialiasing") {
      keywords.push(`antialias_${layer[attr]}`);
    }
  });

  if (layer.hasOwnProperty("font_size" || "font_family") || !isEmpty(keywords)) {
    if (!layer.font_size) throw `Must supply font_size for text in overlay/underlay`;
    if (!layer.font_family) throw `Must supply font_family for text in overlay/underlay`;
    keywords.unshift(layer.font_size);
    keywords.unshift(layer.font_family);
    style = compact(keywords).join("_");
  }
  return style;
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
 * Parse custom_function options
 * @private
 * @param {object|*} customFunction a custom function object containing function_type and source values
 * @return {string|*} custom_function transformation string
 */
function process_custom_function(customFunction) {
  if (!isObject(customFunction)) {
    return customFunction;
  }
  if (customFunction.function_type === "remote") {
    return [customFunction.function_type, base64EncodeURL(customFunction.source)].join(":");
  }
  return [customFunction.function_type, customFunction.source].join(":");
}

/**
 * Parse custom_pre_function options
 * @private
 * @param {object|*} customPreFunction a custom function object containing function_type and source values
 * @return {string|*} custom_pre_function transformation string
 */
function process_custom_pre_function(customPreFunction) {
  var result = process_custom_function(customPreFunction);
  return utils.isString(result) ? `pre:${result}` : null;
}

/**
 * Parse "if" parameter
 * Translates the condition if provided.
 * @private
 * @return {string} "if_" + ifValue
 */
function process_if(ifValue) {
  return ifValue ? "if_" + normalize_expression(ifValue) : ifValue;
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
    if (layer.resource_type === "fetch" || layer.url != null) {
      result = `fetch:${base64EncodeURL(layer.url)}`;
    } else {
      var public_id = layer.public_id;
      var format = layer.format;
      var resource_type = layer.resource_type || "image";
      var type = layer.type || "upload";
      var text = layer.text;
      var style = null;
      var components = [];
      var noPublicId = isEmpty(public_id);
      if (!noPublicId) {
        public_id = public_id.replace(new RegExp("/", 'g'), ":");
        if (format != null) {
          public_id = `${public_id}.${format}`;
        }
      }
      if (isEmpty(text) && resource_type !== "text") {
        if (noPublicId) {
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
          var noStyle = isEmpty(style);
          if (!(noPublicId || noStyle) || noPublicId && noStyle) {
            throw "Must supply either style parameters or a public_id when providing text parameter in a text overlay/underlay";
          }
          var re = /\$\([a-zA-Z]\w*\)/g;
          var start = 0;
          var textSource = smart_escape(decodeURIComponent(text), /[,\/]/g);
          text = "";
          for (var res = re.exec(textSource); res; res = re.exec(textSource)) {
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

/**
 * Parse radius options
 * @private
 * @param {Array<string|number>|string|number} radius The radius to parse
 * @return {string} radius transformation string
 */
function process_radius(radius) {
  if (!radius) {
    return radius;
  }
  if (!isArray(radius)) {
    radius = [radius];
  }
  if (radius.length === 0 || radius.length > 4) {
    throw new Error("Radius array should contain between 1 and 4 values");
  }
  if (radius.findIndex(function (x) {
    return x === null;
  }) >= 0) {
    throw new Error("Corner: Cannot be null");
  }
  return radius.map(normalize_expression).join(':');
}

function base64EncodeURL(sourceUrl) {
  try {
    sourceUrl = decodeURI(sourceUrl);
  } catch (error) {
    // ignore errors
  }
  sourceUrl = encodeURI(sourceUrl);
  return base64Encode(sourceUrl);
}

function base64Encode(input) {
  if (!(input instanceof Buffer)) {
    input = Buffer.from(String(input), 'binary');
  }
  return input.toString('base64');
}

function build_upload_params(options) {
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
    quality_analysis: utils.as_safe_bool(options.quality_analysis),
    responsive_breakpoints: utils.generate_responsive_breakpoints_string(options.responsive_breakpoints),
    return_delete_token: utils.as_safe_bool(options.return_delete_token),
    timestamp: options.timestamp || exports.timestamp(),
    transformation: utils.generate_transformation_string(clone(options)),
    type: options.type,
    unique_filename: utils.as_safe_bool(options.unique_filename),
    upload_preset: options.upload_preset,
    use_filename: utils.as_safe_bool(options.use_filename)
  };
  return utils.updateable_resource_params(options, params);
}

/**
 * Deletes `option_name` from `options` and return the value if present.
 * If `options` doesn't contain `option_name` the default value is returned.
 * @param {Object} options a collection
 * @param {String} option_name the name (key) of the desired value
 * @param {*} [default_value] the value to return is option_name is missing
 */

function option_consume(options, option_name, default_value) {
  var result = options[option_name];
  delete options[option_name];
  return result != null ? result : default_value;
}

function build_array(arg) {
  switch (true) {
    case arg == null:
      return [];
    case isArray(arg):
      return arg;
    default:
      return [arg];
  }
}

/**
 * Serialize an array of arrays into a string
 * @param {[]|[[]]} array - An array of arrays.
 *                          If the first element is not an array the argument is wrapped in an array.
 * @returns {string} A string representation of the arrays.
 */

function encode_double_array(array) {
  array = utils.build_array(array);
  if (!isArray(array[0])) {
    array = [array];
  }
  return array.map(function (e) {
    return utils.build_array(e).join(",");
  }).join("|");
}
function encode_key_value(arg) {
  if (!isObject(arg)) {
    return arg;
  }
  return entries(arg).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];

    return `${k}=${v}`;
  }).join('|');
}

function encode_context(arg) {
  if (!isObject(arg)) {
    return arg;
  }
  return entries(arg).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        k = _ref4[0],
        v = _ref4[1];

    return `${k}=${v.replace(/([=|])/g, '\\$&')}`;
  }).join('|');
}

function build_eager(transformations) {
  return utils.build_array(transformations).map(function (transformation) {
    var transformationString = utils.generate_transformation_string(clone(transformation));
    var format = transformation.format;
    return format == null ? transformationString : `${transformationString}/${format}`;
  }).join('|');
}
/**
 * Build the custom headers for the request
 * @private
 * @param headers
 * @return {Array<string>|object|string} An object of name and value,
 *         an array of header strings, or a string of headers
 */
function build_custom_headers(headers) {
  switch (true) {
    case headers == null:
      return void 0;
    case isArray(headers):
      return headers.join("\n");
    case isObject(headers):
      return entries(headers).map(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            k = _ref6[0],
            v = _ref6[1];

        return `${k}:${v}`;
      }).join("\n");
    default:
      return headers;
  }
}
var TRANSFORMATION_PARAMS = ['angle', 'aspect_ratio', 'audio_codec', 'audio_frequency', 'background', 'bit_rate', 'border', 'color', 'color_space', 'crop', 'default_image', 'delay', 'density', 'dpr', 'duration', 'effect', 'end_offset', 'fetch_format', 'flags', 'fps', 'gravity', 'height', 'if', 'keyframe_interval', 'offset', 'opacity', 'overlay', 'page', 'prefix', 'quality', 'radius', 'raw_transformation', 'responsive_width', 'size', 'start_offset', 'streaming_profile', 'transformation', 'underlay', 'variables', 'video_codec', 'video_sampling', 'width', 'x', 'y', 'zoom'];

function generate_transformation_string(options) {
  if (utils.isString(options)) {
    return options;
  }
  if (isArray(options)) {
    return options.map(function (t) {
      return utils.generate_transformation_string(clone(t));
    }).filter(utils.present).join('/');
  }
  var responsive_width = utils.option_consume(options, "responsive_width", config().responsive_width);
  var width = options.width;
  var height = options.height;
  var size = utils.option_consume(options, "size");
  if (size) {
    var _size$split = size.split("x");

    var _size$split2 = _slicedToArray(_size$split, 2);

    width = _size$split2[0];
    height = _size$split2[1];
    var _ref7 = [width, height];
    options.width = _ref7[0];
    options.height = _ref7[1];
  }
  var has_layer = options.overlay || options.underlay;
  var crop = utils.option_consume(options, "crop");
  var angle = utils.build_array(utils.option_consume(options, "angle")).join(".");
  var no_html_sizes = has_layer || utils.present(angle) || crop === "fit" || crop === "limit" || responsive_width;
  if (width && (width.toString().indexOf("auto") === 0 || no_html_sizes || parseFloat(width) < 1)) {
    delete options.width;
  }
  if (height && (no_html_sizes || parseFloat(height) < 1)) {
    delete options.height;
  }
  var background = utils.option_consume(options, "background");
  background = background && background.replace(/^#/, "rgb:");
  var color = utils.option_consume(options, "color");
  color = color && color.replace(/^#/, "rgb:");
  var base_transformations = utils.build_array(utils.option_consume(options, "transformation", []));
  var named_transformation = [];
  if (base_transformations.some(isObject)) {
    base_transformations = base_transformations.map(function (tr) {
      return utils.generate_transformation_string(isObject(tr) ? clone(tr) : { transformation: tr });
    });
  } else {
    named_transformation = base_transformations.join(".");
    base_transformations = [];
  }
  var effect = utils.option_consume(options, "effect");
  if (isArray(effect)) {
    effect = effect.join(":");
  } else if (isObject(effect)) {
    effect = entries(effect).map(function (_ref8) {
      var _ref9 = _slicedToArray(_ref8, 2),
          key = _ref9[0],
          value = _ref9[1];

      return `${key}:${value}`;
    });
  }
  var border = utils.option_consume(options, "border");
  if (isObject(border)) {
    border = `${border.width != null ? border.width : 2}px_solid_${(border.color != null ? border.color : "black").replace(/^#/, 'rgb:')}`;
  } else if (/^\d+$/.exec(border)) {
    // fallback to html border attributes
    options.border = border;
    border = void 0;
  }
  var flags = utils.build_array(utils.option_consume(options, "flags")).join(".");
  var dpr = utils.option_consume(options, "dpr", config().dpr);
  if (options.offset != null) {
    var _split_range = split_range(utils.option_consume(options, "offset"));

    var _split_range2 = _slicedToArray(_split_range, 2);

    options.start_offset = _split_range2[0];
    options.end_offset = _split_range2[1];
  }
  var overlay = process_layer(utils.option_consume(options, "overlay"));
  var radius = process_radius(utils.option_consume(options, "radius"));
  var underlay = process_layer(utils.option_consume(options, "underlay"));
  var ifValue = process_if(utils.option_consume(options, "if"));
  var custom_function = process_custom_function(utils.option_consume(options, "custom_function"));
  var custom_pre_function = process_custom_pre_function(utils.option_consume(options, "custom_pre_function"));
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
    fn: custom_function || custom_pre_function,
    fps: fps,
    h: normalize_expression(height),
    ki: normalize_expression(utils.option_consume(options, "keyframe_interval")),
    l: overlay,
    o: normalize_expression(utils.option_consume(options, "opacity")),
    q: normalize_expression(utils.option_consume(options, "quality")),
    r: radius,
    t: named_transformation,
    u: underlay,
    w: normalize_expression(width),
    x: normalize_expression(utils.option_consume(options, "x")),
    y: normalize_expression(utils.option_consume(options, "y")),
    z: normalize_expression(utils.option_consume(options, "zoom"))
  };
  var simple_params = [["audio_codec", "ac"], ["audio_frequency", "af"], ["bit_rate", 'br'], ["color_space", "cs"], ["default_image", "d"], ["delay", "dl"], ["density", "dn"], ["duration", "du"], ["end_offset", "eo"], ["fetch_format", "f"], ["gravity", "g"], ["page", "pg"], ["prefix", "p"], ["start_offset", "so"], ["streaming_profile", "sp"], ["video_codec", "vc"], ["video_sampling", "vs"]];

  simple_params.forEach(function (_ref10) {
    var _ref11 = _slicedToArray(_ref10, 2),
        name = _ref11[0],
        short = _ref11[1];

    var value = utils.option_consume(options, name);
    if (value !== undefined) {
      params[short] = value;
    }
  });
  if (params.vc != null) {
    params.vc = process_video_params(params.vc);
  }
  ["so", "eo", "du"].forEach(function (short) {
    if (params[short] !== undefined) {
      params[short] = norm_range_value(params[short]);
    }
  });

  var variablesParam = utils.option_consume(options, "variables", []);
  var variables = entries(options).filter(function (_ref12) {
    var _ref13 = _slicedToArray(_ref12, 2),
        key = _ref13[0],
        value = _ref13[1];

    return key.startsWith('$');
  }).map(function (_ref14) {
    var _ref15 = _slicedToArray(_ref14, 2),
        key = _ref15[0],
        value = _ref15[1];

    delete options[key];
    return `${key}_${normalize_expression(value)}`;
  }).sort().concat(variablesParam.map(function (_ref16) {
    var _ref17 = _slicedToArray(_ref16, 2),
        name = _ref17[0],
        value = _ref17[1];

    return `${name}_${normalize_expression(value)}`;
  })).join(',');

  var transformations = entries(params).filter(function (_ref18) {
    var _ref19 = _slicedToArray(_ref18, 2),
        key = _ref19[0],
        value = _ref19[1];

    return utils.present(value);
  }).map(function (_ref20) {
    var _ref21 = _slicedToArray(_ref20, 2),
        key = _ref21[0],
        value = _ref21[1];

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
  if (String(width).startsWith("auto") || responsive_width) {
    options.responsive = true;
  }
  if (dpr === "auto") {
    options.hidpi = true;
  }
  return filter(transformations, utils.present).join("/");
}

function updateable_resource_params(options) {
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
  if (options.metadata != null) {
    params.metadata = utils.encode_context(options.metadata);
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
}

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

function extractUrlParams(options) {
  return utils.only.apply(utils, [options].concat(URL_KEYS));
}

/**
 * Create a new object with only transformation parameters
 * @param {object} options The source object
 * @return {Object} An object containing only transformation parameters
 */

function extractTransformationParams(options) {
  return utils.only.apply(utils, [options].concat(TRANSFORMATION_PARAMS));
}

/**
 * Handle the format parameter for fetch urls
 * @private
 * @param options url and transformation options. This argument may be changed by the function!
 */

function patchFetchFormat() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (options.type === "fetch") {
    if (options.fetch_format == null) {
      options.fetch_format = utils.option_consume(options, "format");
    }
  }
}

function url(public_id) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var signature = void 0,
      source_to_sign = void 0;
  utils.patchFetchFormat(options);
  var type = utils.option_consume(options, "type", null);
  var transformation = utils.generate_transformation_string(options);
  var resource_type = utils.option_consume(options, "resource_type", "image");
  var version = utils.option_consume(options, "version");
  var force_version = utils.option_consume(options, "force_version", config().force_version);
  if (force_version == null) {
    force_version = true;
  }
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


  if (version == null && force_version && source_to_sign.indexOf("/") >= 0 && !source_to_sign.match(/^v[0-9]+/) && !source_to_sign.match(/^https?:\//)) {
    version = 1;
  }
  if (version != null) {
    version = `v${version}`;
  } else {
    version = null;
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
      // eslint-disable-next-line no-empty
    } catch (error) {}
    var shasum = crypto.createHash('sha1');
    shasum.update(utf8_encode(to_sign + api_secret), 'binary');
    signature = shasum.digest('base64').replace(/\//g, '_').replace(/\+/g, '-').substring(0, 8);
    signature = `s--${signature}--`;
  }
  var prefix = unsigned_url_prefix(public_id, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution);
  var resultUrl = [prefix, resource_type, type, signature, transformation, version, public_id].filter(function (part) {
    return part != null && part !== '';
  }).join('/').replace(' ', '%20');
  if (sign_url && !isEmpty(auth_token)) {
    auth_token.url = urlParse(resultUrl).path;
    var token = generate_token(auth_token);
    resultUrl += `?${token}`;
  }
  return resultUrl;
}

function video_url(public_id, options) {
  options = extend({
    resource_type: 'video'
  }, options);
  return utils.url(public_id, options);
}

function finalize_source(source, format, url_suffix) {
  var source_to_sign;
  source = source.replace(/([^:])\/\//g, '$1/');
  if (source.match(/^https?:\//i)) {
    source = smart_escape(source);
    source_to_sign = source;
  } else {
    source = encodeURIComponent(decodeURIComponent(source)).replace(/%3A/g, ":").replace(/%2F/g, "/");
    source_to_sign = source;
    if (url_suffix) {
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

function video_thumbnail_url(public_id, options) {
  options = extend({}, exports.DEFAULT_POSTER_OPTIONS, options);
  return utils.url(public_id, options);
}

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
//    if cdn_domain is true uses res-[1-5].cloudinary.com for both http and https.
//    Setting secure_cdn_subdomain to false disables this for https.
// 2) Customers with private cdn
//    if cdn_domain is true uses cloudname-res-[1-5].cloudinary.com for http
//    if secure_cdn_domain is true uses cloudname-res-[1-5].cloudinary.com for https
//      (please contact support if you require this)
// 3) Customers with cname
//    if cdn_domain is true uses a[1-5].cname for http.
//    For https, uses the same naming scheme as 1 for shared distribution and as 2 for private distribution.

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

function api_url() {
  var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'upload';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var cloudinary = ensureOption(options, "upload_prefix", "https://api.cloudinary.com");
  var cloud_name = ensureOption(options, "cloud_name");
  var resource_type = options.resource_type || "image";
  return [cloudinary, "v1_1", cloud_name, resource_type, action].join("/");
}

function random_public_id() {
  return crypto.randomBytes(12).toString('base64').replace(/[^a-z0-9]/g, "");
}

function signed_preloaded_image(result) {
  return `${result.resource_type}/upload/v${result.version}/${filter([result.public_id, result.format], utils.present).join(".")}#${result.signature}`;
}

function api_sign_request(params_to_sign, api_secret) {
  var to_sign = entries(params_to_sign).filter(function (_ref22) {
    var _ref23 = _slicedToArray(_ref22, 2),
        k = _ref23[0],
        v = _ref23[1];

    return utils.present(v);
  }).map(function (_ref24) {
    var _ref25 = _slicedToArray(_ref24, 2),
        k = _ref25[0],
        v = _ref25[1];

    return `${k}=${utils.build_array(v).join(",")}`;
  }).sort().join("&");
  var shasum = crypto.createHash('sha1');
  shasum.update(utf8_encode(to_sign + api_secret), 'binary');
  return shasum.digest('hex');
}

function clear_blank(hash) {
  var filtered_hash = {};
  entries(hash).filter(function (_ref26) {
    var _ref27 = _slicedToArray(_ref26, 2),
        k = _ref27[0],
        v = _ref27[1];

    return utils.present(v);
  }).forEach(function (_ref28) {
    var _ref29 = _slicedToArray(_ref28, 2),
        k = _ref29[0],
        v = _ref29[1];

    filtered_hash[k] = v;
  });
  return filtered_hash;
}

function merge(hash1, hash2) {
  return _extends({}, hash1, hash2);
}

function sign_request(params) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var apiKey = ensureOption(options, 'api_key');
  var apiSecret = ensureOption(options, 'api_secret');
  params = exports.clear_blank(params);
  params.signature = exports.api_sign_request(params, apiSecret);
  params.api_key = apiKey;
  return params;
}

function webhook_signature(data, timestamp) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  ensurePresenceOf({ data, timestamp });

  var api_secret = ensureOption(options, 'api_secret');
  var shasum = crypto.createHash('sha1');
  shasum.update(data + timestamp + api_secret, 'binary');
  return shasum.digest('hex');
}

/**
 * Verifies the authenticity of a notification signature
 *
 * @param {string} body JSON of the request's body
 * @param {number} timestamp Unix timestamp. Can be retrieved from the X-Cld-Timestamp header
 * @param {string} signature Actual signature. Can be retrieved from the X-Cld-Signature header
 * @param {number} [valid_for=7200] The desired time in seconds for considering the request valid
 *
 * @return {boolean}
 */
function verifyNotificationSignature(body, timestamp, signature) {
  var valid_for = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 7200;

  // verify that signature is valid for the given timestamp
  if (timestamp < Date.now() - valid_for) {
    return false;
  }
  var payload_hash = utils.webhook_signature(body, timestamp, { api_secret: config().api_secret });
  return signature === payload_hash;
}

function process_request_params(params, options) {
  if (options.unsigned != null && options.unsigned) {
    params = exports.clear_blank(params);
    delete params.timestamp;
  } else if (options.signature) {
    params = exports.clear_blank(options);
  } else {
    params = exports.sign_request(params, options);
  }
  return params;
}

function private_download_url(public_id, format) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var params = exports.sign_request({
    timestamp: options.timestamp || exports.timestamp(),
    public_id: public_id,
    format: format,
    type: options.type,
    attachment: options.attachment,
    expires_at: options.expires_at
  }, options);
  return exports.api_url("download", options) + "?" + querystring.stringify(params);
}

/**
 * Utility method that uses the deprecated ZIP download API.
 * @deprecated Replaced by {download_zip_url} that uses the more advanced and robust archive generation and download API
 */

function zip_download_url(tag) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var params = exports.sign_request({
    timestamp: options.timestamp || exports.timestamp(),
    tag: tag,
    transformation: utils.generate_transformation_string(options)
  }, options);
  return exports.api_url("download_tag.zip", options) + "?" + hashToQuery(params);
}

/**
 * Returns a URL that when invokes creates an archive and returns it.
 * @param {object} options
 * @param {string} [options.resource_type="image"] The resource type of files to include in the archive.
 *   Must be one of :image | :video | :raw
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
 * @param {boolean} [options.flatten_folders=false] If true, flatten public IDs with folders to be in the root
 *   of the archive. Add numeric counter to the file name in case of a name conflict.
 * @param {boolean} [options.flatten_transformations=false] If true, and multiple transformations are given,
 *   flatten the folder structure of derived images and store the transformation details on the file name instead.
 * @param {boolean} [options.use_original_filename] Use the original file name of included images
 *   (if available) instead of the public ID.
 * @param {boolean} [options.async=false] If true, return immediately and perform archive creation in the background.
 *   Relevant only for the create mode.
 * @param {string} [options.notification_url] URL to send an HTTP post request (webhook) to when the
 *   archive creation is completed.
 * @param {string|Array<string>} [options.target_tags=] Allows assigning one or more tags to the generated archive file
 *   (for later housekeeping via the admin API).
 * @param {string} [options.keep_derived=false] keep the derived images used for generating the archive
 * @return {String} archive url
 */
function download_archive_url() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var cloudinary_params = exports.sign_request(exports.archive_params(merge(options, {
    mode: "download"
  })), options);
  return exports.api_url("generate_archive", options) + "?" + hashToQuery(cloudinary_params);
}

/**
 * Returns a URL that when invokes creates an zip archive and returns it.
 * @see download_archive_url
 */

function download_zip_url() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return exports.download_archive_url(merge(options, {
    target_format: "zip"
  }));
}

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
  }
  return value === true ? key : key + "='" + value + "'";
}

/**
 * If the given value is a string, replaces single or double quotes with character entities
 * @private
 * @param {*} value The string to encode quotes in
 * @return {*} Encoded string or original value if not a string
 */
function escapeQuotes(value) {
  return isString(value) ? value.replace('"', '&#34;').replace("'", '&#39;') : value;
}

/**
 *
 * @param attrs
 * @return {*}
 */
exports.html_attrs = function html_attrs(attrs) {
  return filter(map(attrs, function (value, key) {
    return join_pair(key, escapeQuotes(value));
  })).sort().join(" ");
};

var CLOUDINARY_JS_CONFIG_PARAMS = ['api_key', 'cloud_name', 'private_cdn', 'secure_distribution', 'cdn_subdomain'];

function cloudinary_js_config() {
  var params = utils.only.apply(utils, [config()].concat(CLOUDINARY_JS_CONFIG_PARAMS));
  return `<script type='text/javascript'>\n$.cloudinary.config(${JSON.stringify(params)});\n</script>`;
}

function v1_result_adapter(callback) {
  if (callback == null) {
    return undefined;
  }
  return function (result) {
    if (result.error != null) {
      return callback(result.error);
    }
    return callback(void 0, result);
  };
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

function v1_adapters(exports, v1, mapping) {
  return Object.keys(mapping).map(function (name) {
    var num_pass_args = mapping[name];
    exports[name] = v1_adapter(name, num_pass_args, v1);
    return exports[name];
  });
}

function as_safe_bool(value) {
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
}

var NUMBER_PATTERN = "([0-9]*)\\.([0-9]+)|([0-9]+)";

var OFFSET_ANY_PATTERN = `(${NUMBER_PATTERN})([%pP])?`;
var RANGE_VALUE_RE = RegExp(`^${OFFSET_ANY_PATTERN}$`);
var OFFSET_ANY_PATTERN_RE = RegExp(`(${OFFSET_ANY_PATTERN})\\.\\.(${OFFSET_ANY_PATTERN})`);

// Split a range into the start and end values
function split_range(range) {
  // :nodoc:
  switch (range.constructor) {
    case String:
      if (!OFFSET_ANY_PATTERN_RE.test(range)) {
        return range;
      }
      return range.split("..");
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
      {
        var video = "";
        if ('codec' in param) {
          video = param.codec;
          if ('profile' in param) {
            video += ":" + param.profile;
            if ('level' in param) {
              video += ":" + param.level;
            }
          }
        }
        return video;
      }
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

function archive_params() {
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
    timestamp: options.timestamp || exports.timestamp(),
    transformations: utils.build_eager(options.transformations),
    type: options.type,
    use_original_filename: exports.as_safe_bool(options.use_original_filename)
  };
}

function build_explicit_api_params(public_id) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return [exports.build_upload_params(extend({}, { public_id }, options))];
}

function generate_responsive_breakpoints_string(breakpoints) {
  if (breakpoints == null) {
    return null;
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
}

function build_streaming_profiles_param() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var params = utils.only(options, "display_name", "representations");
  if (isArray(params.representations)) {
    params.representations = JSON.stringify(params.representations.map(function (r) {
      return {
        transformation: utils.generate_transformation_string(r.transformation)
      };
    }));
  }
  return params;
}

function hashToParameters(hash) {
  return entries(hash).reduce(function (parameters, _ref30) {
    var _ref31 = _slicedToArray(_ref30, 2),
        key = _ref31[0],
        value = _ref31[1];

    if (isArray(value)) {
      key = key.endsWith('[]') ? key : key + '[]';
      var items = value.map(function (v) {
        return [key, v];
      });
      parameters = parameters.concat(items);
    } else {
      parameters.push([key, value]);
    }
    return parameters;
  }, []);
}

/**
 * Convert a hash of values to a URI query string.
 * Array values are spread as individual parameters.
 * @param {object} hash Key-value parameters
 * @return {string} A URI query string.
 */
function hashToQuery(hash) {
  return hashToParameters(hash).map(function (_ref32) {
    var _ref33 = _slicedToArray(_ref32, 2),
        key = _ref33[0],
        value = _ref33[1];

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

function present(value) {
  return value != null && ("" + value).length > 0;
}

/**
 * Returns a new object with key values from source based on the keys.
 * `null` or `undefined` values are not copied.
 * @private
 * @param {object} source The object to pick values from.
 * @param {...string} keys One or more keys to copy from source.
 * @return {object} A new object with the required keys and values.
 */

function only(source) {
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
}

/**
 * Returns a JSON array as String.
 * Yields the array before it is converted to JSON format
 * @private
 * @param {object|String|Array<object>} data
 * @param {function(*):*} [modifier] called with the array before the array is stringified
 * @return {String|null} a JSON array string or `null` if data is `null`
 */

function jsonArrayParam(data, modifier) {
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
}

/**
 * Empty function - do nothing
 *
 */
exports.NOP = function () {};
exports.generate_auth_token = generate_auth_token;
exports.getUserAgent = getUserAgent;
exports.build_upload_params = build_upload_params;
exports.timestamp = function () {
  return Math.floor(new Date().getTime() / 1000);
};
exports.option_consume = option_consume;
exports.build_array = build_array;
exports.encode_double_array = encode_double_array;
exports.encode_key_value = encode_key_value;
exports.encode_context = encode_context;
exports.build_eager = build_eager;
exports.build_custom_headers = build_custom_headers;
exports.generate_transformation_string = generate_transformation_string;
exports.updateable_resource_params = updateable_resource_params;
exports.extractUrlParams = extractUrlParams;
exports.extractTransformationParams = extractTransformationParams;
exports.patchFetchFormat = patchFetchFormat;
exports.url = url;
exports.video_url = video_url;
exports.video_thumbnail_url = video_thumbnail_url;
exports.api_url = api_url;
exports.random_public_id = random_public_id;
exports.signed_preloaded_image = signed_preloaded_image;
exports.api_sign_request = api_sign_request;
exports.clear_blank = clear_blank;
exports.merge = merge;
exports.sign_request = sign_request;
exports.webhook_signature = webhook_signature;
exports.verifyNotificationSignature = verifyNotificationSignature;
exports.process_request_params = process_request_params;
exports.private_download_url = private_download_url;
exports.zip_download_url = zip_download_url;
exports.download_archive_url = download_archive_url;
exports.download_zip_url = download_zip_url;
exports.cloudinary_js_config = cloudinary_js_config;
exports.v1_adapters = v1_adapters;
exports.as_safe_bool = as_safe_bool;
exports.archive_params = archive_params;
exports.build_explicit_api_params = build_explicit_api_params;
exports.generate_responsive_breakpoints_string = generate_responsive_breakpoints_string;
exports.build_streaming_profiles_param = build_streaming_profiles_param;
exports.hashToParameters = hashToParameters;
exports.present = present;
exports.only = only;
exports.jsonArrayParam = jsonArrayParam;