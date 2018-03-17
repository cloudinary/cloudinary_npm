
/**
  * Utilities
  * @module utils
  * @borrows module:auth_token as generate_auth_token
 */

(function() {
  var CLOUDINARY_JS_CONFIG_PARAMS, CONDITIONAL_OPERATORS, DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION, LAYER_KEYWORD_PARAMS, PREDEFINED_VARS, at, build_custom_headers, build_eager, clone, compact, config, crc32, crypto, defaults, extend, filter, finalize_resource_type, finalize_source, find, first, generate_token, hashToQuery, identity, includes, isArray, isEmpty, isFunction, isNumber, isObject, isPlainObject, isString, isUndefined, join_pair, jsonArrayParam, keys, last, map, merge, norm_range_value, normalize_expression, number_pattern, offset_any_pattern, offset_any_pattern_re, process_if, process_layer, process_video_params, querystring, smart_escape, sortBy, split_range, take, textStyle, unsigned_url_prefix, url, utf8_encode, utils, v1_adapter, v1_result_adapter,
    slice = [].slice;

  utils = exports;

  config = require("./config");

  crypto = require('crypto');

  querystring = require('querystring');

  url = require('url');

  compact = require('lodash/compact');

  defaults = require('lodash/defaults');

  find = require('lodash/find');

  first = require('lodash/first');

  identity = require('lodash/identity');

  isFunction = require('lodash/isFunction');

  isPlainObject = require('lodash/isPlainObject');

  last = require('lodash/last');

  map = require('lodash/map');

  sortBy = require('lodash/sortBy');

  take = require('lodash/take');

  utils.at = at = require('lodash/at');

  utils.clone = clone = require('lodash/clone');

  utils.extend = extend = require('lodash/extend');

  utils.filter = filter = require('lodash/filter');

  utils.includes = includes = require('lodash/includes');

  utils.isArray = isArray = require('lodash/isArray');

  utils.isEmpty = isEmpty = require('lodash/isEmpty');

  utils.isNumber = isNumber = require('lodash/isNumber');

  utils.isObject = isObject = require('lodash/isObject');

  utils.isString = isString = require('lodash/isString');

  utils.isUndefined = isUndefined = require('lodash/isUndefined');

  utils.keys = keys = require('lodash/keys');

  utils.merge = merge = require('lodash/merge');

  generate_token = require("./auth_token");

  exports.generate_auth_token = function(options) {
    var token_options;
    token_options = Object.assign({}, config().auth_token, options);
    return generate_token(token_options);
  };

  exports.CF_SHARED_CDN = "d3jpl91pxevbkh.cloudfront.net";

  exports.OLD_AKAMAI_SHARED_CDN = "cloudinary-a.akamaihd.net";

  exports.AKAMAI_SHARED_CDN = "res.cloudinary.com";

  exports.SHARED_CDN = exports.AKAMAI_SHARED_CDN;

  try {
    exports.VERSION = require('../package.json').version;
  } catch (error) {

  }

  exports.USER_AGENT = "CloudinaryNodeJS/" + exports.VERSION;

  exports.userPlatform = "";

  exports.getUserAgent = function() {
    if (isEmpty(utils.userPlatform)) {
      return "" + utils.USER_AGENT;
    } else {
      return utils.userPlatform + " " + utils.USER_AGENT;
    }
  };

  DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION = {
    width: "auto",
    crop: "limit"
  };

  exports.DEFAULT_POSTER_OPTIONS = {
    format: 'jpg',
    resource_type: 'video'
  };

  exports.DEFAULT_VIDEO_SOURCE_TYPES = ['webm', 'mp4', 'ogv'];

  CONDITIONAL_OPERATORS = {
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

  PREDEFINED_VARS = {
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

  LAYER_KEYWORD_PARAMS = {
    font_weight: "normal",
    font_style: "normal",
    text_decoration: "none",
    text_align: null,
    stroke: "none"
  };

  textStyle = function(layer) {
    var attr, attr_value, default_value, font_family, font_size, keywords, letter_spacing, line_spacing;
    font_family = layer["font_family"];
    font_size = layer["font_size"];
    keywords = [];
    for (attr in LAYER_KEYWORD_PARAMS) {
      default_value = LAYER_KEYWORD_PARAMS[attr];
      attr_value = layer[attr] || default_value;
      if (attr_value !== default_value) {
        keywords.push(attr_value);
      }
    }
    letter_spacing = layer["letter_spacing"];
    if (letter_spacing) {
      keywords.push("letter_spacing_" + letter_spacing);
    }
    line_spacing = layer["line_spacing"];
    if (line_spacing) {
      keywords.push("line_spacing_" + line_spacing);
    }
    if (font_size || font_family || !isEmpty(keywords)) {
      if (!font_family) {
        raise(CloudinaryException, "Must supply font_family for text in overlay/underlay");
      }
      if (!font_size) {
        raise(CloudinaryException, "Must supply font_size for text in overlay/underlay");
      }
      keywords.unshift(font_size);
      keywords.unshift(font_family);
      return compact(keywords).join("_");
    }
  };


  /**
    * Parse "if" parameter
    * Translates the condition if provided.
    * @return [string] "if_" + ifValue
    * @private
   */

  normalize_expression = function(expression) {
    var operators, pattern, replaceRE;
    if (!isString(expression) || expression.length === 0 || expression.match(/^!.+!$/)) {
      return expression;
    }
    operators = "\\|\\||>=|<=|&&|!=|>|=|<|/|-|\\+|\\*";
    pattern = "((" + operators + ")(?=[ _])|" + Object.keys(PREDEFINED_VARS).join("|") + ")";
    replaceRE = new RegExp(pattern, "g");
    expression = expression.replace(replaceRE, function(match) {
      return CONDITIONAL_OPERATORS[match] || PREDEFINED_VARS[match];
    });
    return expression.replace(/[ _]+/g, '_');
  };

  process_if = function(ifValue) {
    if (ifValue) {
      return "if_" + normalize_expression(ifValue);
    } else {
      return ifValue;
    }
  };


  /**
    * Parse layer options
    * @return [string] layer transformation string
    * @private
   */

  process_layer = function(layer) {
    var components, format, public_id, re, res, resource_type, start, style, text, textSource, type;
    if (isPlainObject(layer)) {
      public_id = layer["public_id"];
      format = layer["format"];
      resource_type = layer["resource_type"] || "image";
      type = layer["type"] || "upload";
      text = layer["text"];
      style = null;
      components = [];
      if (!isEmpty(public_id)) {
        public_id = public_id.replace(new RegExp("/", 'g'), ":");
        if (format != null) {
          public_id = public_id + "." + format;
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
        style = textStyle(layer);
        if (!isEmpty(text)) {
          if (!(isEmpty(public_id) ^ isEmpty(style))) {
            throw "Must supply either style parameters or a public_id when providing text parameter in a text overlay/underlay";
          }
          re = /\$\([a-zA-Z]\w*\)/g;
          start = 0;
          textSource = smart_escape(decodeURIComponent(text), /[,\/]/g);
          text = "";
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
      layer = compact(components).join(":");
    }
    return layer;
  };

  exports.build_upload_params = function(options) {
    var params;
    params = {
      access_mode: options.access_mode,
      allowed_formats: options.allowed_formats && utils.build_array(options.allowed_formats).join(","),
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

  exports.timestamp = function() {
    return Math.floor(new Date().getTime() / 1000);
  };


  /**
   * Deletes `option_name` from `options` and return the value if present.
   * If `options` doesn't contain `option_name` the default value is returned.
   * @param {Object} options a collection
   * @param {String} option_name the name (key) of the desired value
   * @param [default_value] the value to return is option_name is missing
   */

  exports.option_consume = function(options, option_name, default_value) {
    var result;
    result = options[option_name];
    delete options[option_name];
    if (result != null) {
      return result;
    } else {
      return default_value;
    }
  };

  exports.build_array = function(arg) {
    if (arg == null) {
      return [];
    } else if (isArray(arg)) {
      return arg;
    } else {
      return [arg];
    }
  };

  exports.encode_double_array = function(array) {
    array = utils.build_array(array);
    if (array.length > 0 && isArray(array[0])) {
      return array.map(function(e) {
        return utils.build_array(e).join(",");
      }).join("|");
    } else {
      return array.join(",");
    }
  };

  exports.encode_key_value = function(arg) {
    var k, pairs, v;
    if (isObject(arg)) {
      pairs = (function() {
        var results;
        results = [];
        for (k in arg) {
          v = arg[k];
          results.push(k + "=" + v);
        }
        return results;
      })();
      return pairs.join("|");
    } else {
      return arg;
    }
  };

  exports.encode_context = function(arg) {
    var k, pairs, v;
    if (isObject(arg)) {
      pairs = (function() {
        var results;
        results = [];
        for (k in arg) {
          v = arg[k];
          v = v.replace(/([=|])/g, function(match) {
            return "\\" + match;
          });
          results.push(k + "=" + v);
        }
        return results;
      })();
      return pairs.join("|");
    } else {
      return arg;
    }
  };

  exports.build_eager = function(transformations) {
    var transformation;
    return ((function() {
      var j, len, ref, results;
      ref = utils.build_array(transformations);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        transformation = ref[j];
        transformation = clone(transformation);
        results.push(filter([utils.generate_transformation_string(transformation), transformation.format], utils.present).join("/"));
      }
      return results;
    })()).join("|");
  };

  exports.build_custom_headers = function(headers) {
    var k, v;
    switch (false) {
      case !(headers == null):
        return void 0;
      case !isArray(headers):
        return headers.join("\n");
      case !isObject(headers):
        return [
          (function() {
            var results;
            results = [];
            for (k in headers) {
              v = headers[k];
              results.push(k + ": " + v);
            }
            return results;
          })()
        ].join("\n");
      default:
        return headers;
    }
  };

  exports.present = function(value) {
    return !isUndefined(value) && ("" + value).length > 0;
  };

  exports.generate_transformation_string = function(options) {
    var angle, background, base_transformation, base_transformations, border, color, crop, dpr, effect, flags, has_layer, height, ifValue, j, key, l, len, len1, name, named_transformation, no_html_sizes, overlay, param, params, range_value, raw_transformation, ref, ref1, ref2, ref3, ref4, ref5, ref6, responsive_width, responsive_width_transformation, result, short, simple_params, size, sortedParams, transformations, underlay, value, var_params, variables, width;
    if (isArray(options)) {
      result = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = options.length; j < len; j++) {
          base_transformation = options[j];
          results.push(utils.generate_transformation_string(clone(base_transformation)));
        }
        return results;
      })();
      return result.join("/");
    }
    responsive_width = utils.option_consume(options, "responsive_width", config().responsive_width);
    width = options["width"];
    height = options["height"];
    size = utils.option_consume(options, "size");
    if (size) {
      ref1 = (ref = size.split("x"), width = ref[0], height = ref[1], ref), options["width"] = ref1[0], options["height"] = ref1[1];
    }
    has_layer = options.overlay || options.underlay;
    crop = utils.option_consume(options, "crop");
    angle = utils.build_array(utils.option_consume(options, "angle")).join(".");
    no_html_sizes = has_layer || utils.present(angle) || crop === "fit" || crop === "limit" || responsive_width;
    if (width && (width.toString().indexOf("auto") === 0 || no_html_sizes || parseFloat(width) < 1)) {
      delete options["width"];
    }
    if (height && (no_html_sizes || parseFloat(height) < 1)) {
      delete options["height"];
    }
    background = utils.option_consume(options, "background");
    background = background && background.replace(/^#/, "rgb:");
    color = utils.option_consume(options, "color");
    color = color && color.replace(/^#/, "rgb:");
    base_transformations = utils.build_array(utils.option_consume(options, "transformation", []));
    named_transformation = [];
    if (base_transformations.length !== 0 && filter(base_transformations, isObject).length > 0) {
      base_transformations = map(base_transformations, function(base_transformation) {
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
    effect = utils.option_consume(options, "effect");
    if (isArray(effect)) {
      effect = effect.join(":");
    } else if (isObject(effect)) {
      for (key in effect) {
        value = effect[key];
        effect = key + ":" + value;
      }
    }
    border = utils.option_consume(options, "border");
    if (isObject(border)) {
      border = ((ref2 = border.width) != null ? ref2 : 2) + "px_solid_" + (((ref3 = border.color) != null ? ref3 : "black").replace(/^#/, 'rgb:'));
    } else if (/^\d+$/.exec(border)) {
      options.border = border;
      border = void 0;
    }
    flags = utils.build_array(utils.option_consume(options, "flags")).join(".");
    dpr = utils.option_consume(options, "dpr", config().dpr);
    if (options["offset"] != null) {
      ref4 = split_range(utils.option_consume(options, "offset")), options["start_offset"] = ref4[0], options["end_offset"] = ref4[1];
    }
    overlay = process_layer(utils.option_consume(options, "overlay"));
    underlay = process_layer(utils.option_consume(options, "underlay"));
    ifValue = process_if(utils.option_consume(options, "if"));
    params = {
      a: normalize_expression(angle),
      ar: normalize_expression(utils.option_consume(options, "aspect_ratio")),
      b: background,
      bo: border,
      c: crop,
      co: color,
      dpr: normalize_expression(dpr),
      e: normalize_expression(effect),
      fl: flags,
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
    simple_params = {
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
    for (param in simple_params) {
      short = simple_params[param];
      params[short] = utils.option_consume(options, param);
    }
    if (params["vc"] != null) {
      params["vc"] = process_video_params(params["vc"]);
    }
    ref5 = ["so", "eo", "du"];
    for (j = 0, len = ref5.length; j < len; j++) {
      range_value = ref5[j];
      if (range_value in params) {
        params[range_value] = norm_range_value(params[range_value]);
      }
    }
    variables = utils.option_consume(options, "variables");
    var_params = [];
    for (key in options) {
      value = options[key];
      if (!(key.match(/^\$/))) {
        continue;
      }
      delete options[key];
      var_params.push(key + "_" + (normalize_expression(value)));
    }
    var_params = var_params.sort();
    if (!isEmpty(variables)) {
      for (l = 0, len1 = variables.length; l < len1; l++) {
        ref6 = variables[l], name = ref6[0], value = ref6[1];
        var_params.push(name + "_" + (normalize_expression(value)));
      }
    }
    variables = var_params.filter(function(x) {
      return x;
    }).join(',');
    sortedParams = [];
    keys = Object.keys(params);
    keys.sort();
    keys.forEach(function(key) {
      if (utils.present(params[key])) {
        sortedParams.push(key + '_' + params[key]);
      }
    });
    transformations = sortedParams.join(',');
    raw_transformation = utils.option_consume(options, 'raw_transformation');
    transformations = compact([ifValue, variables, transformations, raw_transformation]).join(",");
    base_transformations.push(transformations);
    transformations = base_transformations;
    if (responsive_width) {
      responsive_width_transformation = config().responsive_width_transformation || DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION;
      transformations.push(utils.generate_transformation_string(clone(responsive_width_transformation)));
    }
    if ((width != null ? width.toString().indexOf("auto") : void 0) === 0 || responsive_width) {
      options.responsive = true;
    }
    if (dpr === "auto") {
      options.hidpi = true;
    }
    return filter(transformations, utils.present).join("/");
  };

  exports.updateable_resource_params = function(options, params) {
    if (params == null) {
      params = {};
    }
    if (options.access_control != null) {
      params.access_control = jsonArrayParam(options.access_control);
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

  exports.url = function(public_id, options) {
    var api_secret, auth_token, cdn_subdomain, cloud_name, cname, format, i, original_source, prefix, preloaded, private_cdn, ref, ref1, resource_type, resultUrl, secure, secure_cdn_subdomain, secure_distribution, shasum, shorten, sign_url, signature, source_to_sign, ssl_detected, to_sign, token, transformation, type, url_suffix, use_root_path, version;
    if (options == null) {
      options = {};
    }
    type = utils.option_consume(options, "type", null);
    if (type === "fetch") {
      if (options.fetch_format == null) {
        options.fetch_format = utils.option_consume(options, "format");
      }
    }
    transformation = utils.generate_transformation_string(options);
    resource_type = utils.option_consume(options, "resource_type", "image");
    version = utils.option_consume(options, "version");
    format = utils.option_consume(options, "format");
    cloud_name = utils.option_consume(options, "cloud_name", config().cloud_name);
    if (!cloud_name) {
      throw "Unknown cloud_name";
    }
    private_cdn = utils.option_consume(options, "private_cdn", config().private_cdn);
    secure_distribution = utils.option_consume(options, "secure_distribution", config().secure_distribution);
    secure = utils.option_consume(options, "secure", null);
    ssl_detected = utils.option_consume(options, "ssl_detected", config().ssl_detected);
    if (secure === null) {
      secure = ssl_detected || config().secure;
    }
    cdn_subdomain = utils.option_consume(options, "cdn_subdomain", config().cdn_subdomain);
    secure_cdn_subdomain = utils.option_consume(options, "secure_cdn_subdomain", config().secure_cdn_subdomain);
    cname = utils.option_consume(options, "cname", config().cname);
    shorten = utils.option_consume(options, "shorten", config().shorten);
    sign_url = utils.option_consume(options, "sign_url", config().sign_url);
    api_secret = utils.option_consume(options, "api_secret", config().api_secret);
    url_suffix = utils.option_consume(options, "url_suffix");
    use_root_path = utils.option_consume(options, "use_root_path", config().use_root_path);
    auth_token = utils.option_consume(options, "auth_token");
    if (auth_token !== false) {
      auth_token = exports.merge(config().auth_token, auth_token);
    }
    preloaded = /^(image|raw)\/([a-z0-9_]+)\/v(\d+)\/([^#]+)$/.exec(public_id);
    if (preloaded) {
      resource_type = preloaded[1];
      type = preloaded[2];
      version = preloaded[3];
      public_id = preloaded[4];
    }
    original_source = public_id;
    if (public_id == null) {
      return original_source;
    }
    public_id = public_id.toString();
    if (type === null && public_id.match(/^https?:\//i)) {
      return original_source;
    }
    ref = finalize_resource_type(resource_type, type, url_suffix, use_root_path, shorten), resource_type = ref[0], type = ref[1];
    ref1 = finalize_source(public_id, format, url_suffix), public_id = ref1[0], source_to_sign = ref1[1];
    if (source_to_sign.indexOf("/") > 0 && !source_to_sign.match(/^v[0-9]+/) && !source_to_sign.match(/^https?:\//)) {
      if (version == null) {
        version = 1;
      }
    }
    if (version != null) {
      version = "v" + version;
    }
    transformation = transformation.replace(/([^:])\/\//g, '$1/');
    if (sign_url && isEmpty(auth_token)) {
      to_sign = [transformation, source_to_sign].filter(function(part) {
        return (part != null) && part !== '';
      }).join('/');
      i = 0;
      try {
        while (to_sign !== decodeURIComponent(to_sign) && i < 10) {
          to_sign = decodeURIComponent(to_sign);
          i++;
        }
      } catch (error) {

      }
      shasum = crypto.createHash('sha1');
      shasum.update(utf8_encode(to_sign + api_secret), 'binary');
      signature = shasum.digest('base64').replace(/\//g, '_').replace(/\+/g, '-').substring(0, 8);
      signature = "s--" + signature + "--";
    }
    prefix = unsigned_url_prefix(public_id, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution);
    resultUrl = [prefix, resource_type, type, signature, transformation, version, public_id].filter(function(part) {
      return (part != null) && part !== '';
    }).join('/');
    if (sign_url && !isEmpty(auth_token)) {
      auth_token.url = url.parse(resultUrl).path;
      token = generate_token(auth_token);
      resultUrl += "?" + token;
    }
    return resultUrl;
  };

  exports.video_url = function(public_id, options) {
    options = extend({
      resource_type: 'video'
    }, options);
    return utils.url(public_id, options);
  };

  finalize_source = function(source, format, url_suffix) {
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
  };

  exports.video_thumbnail_url = function(public_id, options) {
    options = extend({}, exports.DEFAULT_POSTER_OPTIONS, options);
    return utils.url(public_id, options);
  };

  finalize_resource_type = function(resource_type, type, url_suffix, use_root_path, shorten) {
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
      if ((resource_type === 'image' && type === 'upload') || (resource_type === 'images' && (type == null))) {
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
  };

  unsigned_url_prefix = function(source, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution) {
    var cdn_part, host, prefix, shared_domain, subdomain, subdomain_part;
    if (cloud_name.indexOf("/") === 0) {
      return '/res' + cloud_name;
    }
    shared_domain = !private_cdn;
    if (secure) {
      if ((secure_distribution == null) || secure_distribution === exports.OLD_AKAMAI_SHARED_CDN) {
        secure_distribution = private_cdn ? cloud_name + "-res.cloudinary.com" : exports.SHARED_CDN;
      }
      if (shared_domain == null) {
        shared_domain = secure_distribution === exports.SHARED_CDN;
      }
      if ((secure_cdn_subdomain == null) && shared_domain) {
        secure_cdn_subdomain = cdn_subdomain;
      }
      if (secure_cdn_subdomain) {
        secure_distribution = secure_distribution.replace('res.cloudinary.com', 'res-' + ((crc32(source) % 5) + 1 + '.cloudinary.com'));
      }
      prefix = 'https://' + secure_distribution;
    } else if (cname) {
      subdomain = cdn_subdomain ? 'a' + ((crc32(source) % 5) + 1) + '.' : '';
      prefix = 'http://' + subdomain + cname;
    } else {
      cdn_part = private_cdn ? cloud_name + '-' : '';
      subdomain_part = cdn_subdomain ? '-' + ((crc32(source) % 5) + 1) : '';
      host = [cdn_part, 'res', subdomain_part, '.cloudinary.com'].join('');
      prefix = 'http://' + host;
    }
    if (shared_domain) {
      prefix += '/' + cloud_name;
    }
    return prefix;
  };

  smart_escape = function(string, unsafe) {
    if (unsafe == null) {
      unsafe = /([^a-zA-Z0-9_.\-\/:]+)/g;
    }
    return string.replace(unsafe, function(match) {
      return match.split("").map(function(c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      }).join("");
    });
  };

  utf8_encode = function(argString) {
    var c1, enc, end, n, start, string, stringl, utftext;
    if (argString == null) {
      return "";
    }
    string = argString + "";
    utftext = "";
    start = void 0;
    end = void 0;
    stringl = 0;
    start = end = 0;
    stringl = string.length;
    n = 0;
    while (n < stringl) {
      c1 = string.charCodeAt(n);
      enc = null;
      if (c1 < 128) {
        end++;
      } else if (c1 > 127 && c1 < 2048) {
        enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
      } else {
        enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
      }
      if (enc !== null) {
        if (end > start) {
          utftext += string.slice(start, end);
        }
        utftext += enc;
        start = end = n + 1;
      }
      n++;
    }
    if (end > start) {
      utftext += string.slice(start, stringl);
    }
    return utftext;
  };

  crc32 = function(str) {
    var crc, i, iTop, table, x, y;
    str = utf8_encode(str);
    table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    crc = 0;
    x = 0;
    y = 0;
    crc = crc ^ (-1);
    i = 0;
    iTop = str.length;
    while (i < iTop) {
      y = (crc ^ str.charCodeAt(i)) & 0xFF;
      x = "0x" + table.substr(y * 9, 8);
      crc = (crc >>> 8) ^ x;
      i++;
    }
    crc = crc ^ (-1);
    if (crc < 0) {
      crc += 4294967296;
    }
    return crc;
  };

  exports.api_url = function(action, options) {
    var cloud_name, cloudinary, ref, ref1, ref2, ref3, resource_type;
    if (action == null) {
      action = 'upload';
    }
    if (options == null) {
      options = {};
    }
    cloudinary = (ref = (ref1 = options["upload_prefix"]) != null ? ref1 : config().upload_prefix) != null ? ref : "https://api.cloudinary.com";
    cloud_name = (function() {
      var ref3;
      if ((ref2 = (ref3 = options["cloud_name"]) != null ? ref3 : config().cloud_name) != null) {
        return ref2;
      } else {
        throw "Must supply cloud_name";
      }
    })();
    resource_type = (ref3 = options["resource_type"]) != null ? ref3 : "image";
    return [cloudinary, "v1_1", cloud_name, resource_type, action].join("/");
  };

  exports.random_public_id = function() {
    return crypto.randomBytes(12).toString('base64').replace(/[^a-z0-9]/g, "");
  };

  exports.signed_preloaded_image = function(result) {
    return result.resource_type + "/upload/v" + result.version + "/" + (filter([result.public_id, result.format], utils.present).join(".")) + "#" + result.signature;
  };

  exports.api_sign_request = function(params_to_sign, api_secret) {
    var k, shasum, to_sign, v;
    to_sign = sortBy((function() {
      var results;
      results = [];
      for (k in params_to_sign) {
        v = params_to_sign[k];
        if (v != null) {
          results.push(k + "=" + (utils.build_array(v).join(",")));
        }
      }
      return results;
    })(), identity).join("&");
    shasum = crypto.createHash('sha1');
    shasum.update(utf8_encode(to_sign + api_secret), 'binary');
    return shasum.digest('hex');
  };

  exports.clear_blank = function(hash) {
    var filtered_hash, k, v;
    filtered_hash = {};
    for (k in hash) {
      v = hash[k];
      if (exports.present(v)) {
        filtered_hash[k] = hash[k];
      }
    }
    return filtered_hash;
  };

  exports.merge = function(hash1, hash2) {
    var k, result, v;
    result = {};
    for (k in hash1) {
      v = hash1[k];
      result[k] = hash1[k];
    }
    for (k in hash2) {
      v = hash2[k];
      result[k] = hash2[k];
    }
    return result;
  };

  exports.sign_request = function(params, options) {
    var api_key, api_secret, ref, ref1;
    if (options == null) {
      options = {};
    }
    api_key = (function() {
      var ref1;
      if ((ref = (ref1 = options.api_key) != null ? ref1 : config().api_key) != null) {
        return ref;
      } else {
        throw "Must supply api_key";
      }
    })();
    api_secret = (function() {
      var ref2;
      if ((ref1 = (ref2 = options.api_secret) != null ? ref2 : config().api_secret) != null) {
        return ref1;
      } else {
        throw "Must supply api_secret";
      }
    })();
    params = exports.clear_blank(params);
    params.signature = exports.api_sign_request(params, api_secret);
    params.api_key = api_key;
    return params;
  };

  exports.webhook_signature = function(data, timestamp, options) {
    var api_secret, ref, shasum;
    if (options == null) {
      options = {};
    }
    if (!data) {
      throw "Must supply data";
    }
    if (!timestamp) {
      throw "Must supply timestamp";
    }
    api_secret = (function() {
      var ref1;
      if ((ref = (ref1 = options.api_secret) != null ? ref1 : config().api_secret) != null) {
        return ref;
      } else {
        throw "Must supply api_secret";
      }
    })();
    shasum = crypto.createHash('sha1');
    shasum.update(data + timestamp + api_secret, 'binary');
    return shasum.digest('hex');
  };

  exports.process_request_params = function(params, options) {
    if ((options.unsigned != null) && options.unsigned) {
      params = exports.clear_blank(params);
      delete params["timestamp"];
    } else {
      params = exports.sign_request(params, options);
    }
    return params;
  };

  exports.private_download_url = function(public_id, format, options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = exports.sign_request({
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

  exports.zip_download_url = function(tag, options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = exports.sign_request({
      timestamp: exports.timestamp(),
      tag: tag,
      transformation: utils.generate_transformation_string(options)
    }, options);
    return exports.api_url("download_tag.zip", options) + "?" + hashToQuery(params);
  };


  /**
   * Returns a URL that when invokes creates an archive and returns it.
   * @param options [Hash]
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
   * @param {string|Array<string} [options.target_tags=]  array. Allows assigning one or more tag to the generated archive file (for later housekeeping via the admin API).
   * @param {string} [options.keep_derived=false] keep the derived images used for generating the archive
   * @return [String] archive url
   */

  exports.download_archive_url = function(options) {
    var cloudinary_params;
    if (options == null) {
      options = {};
    }
    cloudinary_params = exports.sign_request(exports.archive_params(merge(options, {
      mode: "download"
    })), options);
    return exports.api_url("generate_archive", options) + "?" + hashToQuery(cloudinary_params);
  };


  /**
   * Returns a URL that when invokes creates an zip archive and returns it.
   * @see download_archive_url
   */

  exports.download_zip_url = function(options) {
    if (options == null) {
      options = {};
    }
    return exports.download_archive_url(merge(options, {
      target_format: "zip"
    }));
  };

  join_pair = function(key, value) {
    if (!value) {
      return void 0;
    } else if (value === true) {
      return key;
    } else {
      return key + "='" + value + "'";
    }
  };

  exports.html_attrs = function(attrs) {
    var pairs;
    pairs = filter(map(attrs, function(value, key) {
      return join_pair(key, value);
    }));
    pairs.sort();
    return pairs.join(" ");
  };

  CLOUDINARY_JS_CONFIG_PARAMS = ['api_key', 'cloud_name', 'private_cdn', 'secure_distribution', 'cdn_subdomain'];

  exports.cloudinary_js_config = function() {
    var j, len, param, params, value;
    params = {};
    for (j = 0, len = CLOUDINARY_JS_CONFIG_PARAMS.length; j < len; j++) {
      param = CLOUDINARY_JS_CONFIG_PARAMS[j];
      value = config()[param];
      if (value != null) {
        params[param] = value;
      }
    }
    return "<script type='text/javascript'>\n" + "$.cloudinary.config(" + JSON.stringify(params) + ");\n" + "</script>\n";
  };

  v1_result_adapter = function(callback) {
    if (callback != null) {
      return function(result) {
        if (result.error != null) {
          return callback(result.error);
        } else {
          return callback(void 0, result);
        }
      };
    } else {
      return null;
    }
  };

  v1_adapter = function(name, num_pass_args, v1) {
    return function() {
      var args, callback, options, pass_args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      pass_args = take(args, num_pass_args);
      options = args[num_pass_args];
      callback = args[num_pass_args + 1];
      if ((callback == null) && isFunction(options)) {
        callback = options;
        options = {};
      }
      callback = v1_result_adapter(callback);
      args = pass_args.concat([callback, options]);
      return v1[name].apply(this, args);
    };
  };

  exports.v1_adapters = function(exports, v1, mapping) {
    var name, num_pass_args, results;
    results = [];
    for (name in mapping) {
      num_pass_args = mapping[name];
      results.push(exports[name] = v1_adapter(name, num_pass_args, v1));
    }
    return results;
  };

  exports.as_safe_bool = function(value) {
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

  number_pattern = "([0-9]*)\\.([0-9]+)|([0-9]+)";

  offset_any_pattern = "(" + number_pattern + ")([%pP])?";

  offset_any_pattern_re = RegExp("(" + offset_any_pattern + ")\\.\\.(" + offset_any_pattern + ")");

  split_range = function(range) {
    switch (range.constructor) {
      case String:
        if (offset_any_pattern_re = ~range) {
          return range.split("..");
        }
        break;
      case Array:
        return [first(range), last(range)];
      default:
        return [null, null];
    }
  };


  /**
   * Normalize an offset value
   * @param {String} value a decimal value which may have a 'p' or '%' postfix. E.g. '35%', '0.4p'
   * @return {Object|String} a normalized String of the input value if possible otherwise the value itself
   */

  norm_range_value = function(value) {
    var modifier, offset;
    offset = String(value).match(RegExp("^" + offset_any_pattern + "$"));
    if (offset) {
      modifier = offset[5] ? 'p' : '';
      value = "" + (offset[1] || offset[4]) + modifier;
    }
    return value;
  };


  /**
   * A video codec parameter can be either a String or a Hash.
   * @param {Object} param <code>vc_<codec>[ : <profile> : [<level>]]</code>
   *                       or <code>{ codec: 'h264', profile: 'basic', level: '3.1' }</code>
   * @return {String} <code><codec> : <profile> : [<level>]]</code> if a Hash was provided
   *                   or the param if a String was provided.
   *                   Returns null if param is not a Hash or String
   */

  process_video_params = function(param) {
    var video;
    switch (param.constructor) {
      case Object:
        video = "";
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
  };


  /**
   * Returns a Hash of parameters used to create an archive
   * @param [Hash] options
   * @private
   */

  exports.archive_params = function(options) {
    var ref;
    if (options == null) {
      options = {};
    }
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
      timestamp: (ref = options.timestamp) != null ? ref : exports.timestamp(),
      transformations: utils.build_eager(options.transformations),
      type: options.type,
      use_original_filename: exports.as_safe_bool(options.use_original_filename)
    };
  };

  build_custom_headers = function(headers) {
    var a;
    return ((function() {
      var j, len, ref, results;
      ref = Array(headers);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        a = ref[j];
        if ((a != null ? a.join : void 0) != null) {
          results.push(a.join(": "));
        }
      }
      return results;
    })()).join("\n");
  };

  exports.build_explicit_api_params = function(public_id, options) {
    var opt;
    if (options == null) {
      options = {};
    }
    opt = [
      {
        callback: options.callback,
        colors: utils.as_safe_bool(options.colors),
        custom_coordinates: options.custom_coordinates && utils.encode_double_array(options.custom_coordinates),
        eager: utils.build_eager(options.eager),
        eager_async: utils.as_safe_bool(options.eager_async),
        eager_notification_url: options.eager_notification_url,
        face_coordinates: options.face_coordinates && utils.encode_double_array(options.face_coordinates),
        faces: utils.as_safe_bool(options.faces),
        headers: build_custom_headers(options.headers),
        image_metadata: utils.as_safe_bool(options.image_metadata),
        invalidate: utils.as_safe_bool(options.invalidate),
        moderation: options.moderation,
        phash: utils.as_safe_bool(options.phash),
        public_id: public_id,
        responsive_breakpoints: utils.generate_responsive_breakpoints_string(options.responsive_breakpoints),
        tags: options.tags && utils.build_array(options.tags).join(","),
        timestamp: options.timestamp || exports.timestamp(),
        type: options.type
      }
    ];
    return opt;
  };

  exports.generate_responsive_breakpoints_string = function(breakpoints) {
    var breakpoint_settings, j, len;
    if (breakpoints == null) {
      return;
    }
    breakpoints = clone(breakpoints);
    if (!isArray(breakpoints)) {
      breakpoints = [breakpoints];
    }
    for (j = 0, len = breakpoints.length; j < len; j++) {
      breakpoint_settings = breakpoints[j];
      if (breakpoint_settings != null) {
        if (breakpoint_settings.transformation) {
          breakpoint_settings.transformation = utils.generate_transformation_string(clone(breakpoint_settings.transformation));
        }
      }
    }
    return JSON.stringify(breakpoints);
  };

  exports.build_streaming_profiles_param = function(options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = utils.only(options, "display_name", "representations");
    if (isArray(params["representations"])) {
      params["representations"] = JSON.stringify(params["representations"].map(function(r) {
        return {
          transformation: utils.generate_transformation_string(r.transformation)
        };
      }));
    }
    return params;
  };

  exports.only = function() {
    var hash, j, key, keys, len, result;
    hash = arguments[0], keys = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = {};
    for (j = 0, len = keys.length; j < len; j++) {
      key = keys[j];
      if (hash[key] != null) {
        result[key] = hash[key];
      }
    }
    return result;
  };


  /**
   * @private
   */

  build_eager = function(eager) {
    var format, ret, transformation;
    if (eager == null) {
      return void 0;
    }
    ret = ((function() {
      var j, len, ref, results;
      ref = Array(eager);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        transformation = ref[j];
        transformation = clone(transformation);
        if (transformation.format != null) {
          format = transformation.format;
        }
        delete transformation.format;
        results.push(compact([utils.generate_transformation_string(transformation), format]).join("/"));
      }
      return results;
    })()).join("|");
    return ret;
  };

  hashToQuery = function(hash) {
    var key, v, value;
    return compact((function() {
      var results;
      results = [];
      for (key in hash) {
        value = hash[key];
        if (isArray(value)) {
          results.push(((function() {
            var j, len, results1;
            results1 = [];
            for (j = 0, len = value.length; j < len; j++) {
              v = value[j];
              if (!key.match(/\w+\[\]/)) {
                key = key + "[]";
              }
              results1.push((querystring.escape("" + key)) + "=" + (querystring.escape(v)));
            }
            return results1;
          })()).join("&"));
        } else {
          results.push((querystring.escape(key)) + "=" + (querystring.escape(value)));
        }
      }
      return results;
    })()).sort().join('&');
  };


  /**
   * Returns a JSON array as String.
   * Yields the array before it is converted to JSON format
   * @api private
   * @param [Hash|String|Array<Hash>] data
   * @return [String|nil] a JSON array string or `nil` if data is `nil`
   */

  exports.jsonArrayParam = jsonArrayParam = function(data, callback) {
    if (!data) {
      return;
    }
    if (isString(data)) {
      data = JSON.parse(data);
    }
    if (!isArray(data)) {
      data = [data];
    }
    if (isFunction(callback)) {
      data = callback(data);
    }
    return JSON.stringify(data);
  };

}).call(this);

//# sourceMappingURL=utils.js.map
