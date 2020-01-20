
// Functions used internally
const clone = require("lodash/clone");
const isArray = require("lodash/isArray");
const isObject = require("lodash/isObject");


const config = require("../../config");
const utils = require('../index');

console.log(utils);

function createParamsFromOptions(options) {
  let responsive_width = utils.option_consume(options, "responsive_width", config().responsive_width);
  let width = options.width;
  let height = options.height;
  let size = utils.option_consume(options, "size");
  if (size) {
    [width, height] = size.split("x");
    [options.width, options.height] = [width, height];
  }
  let has_layer = options.overlay || options.underlay;
  let crop = utils.option_consume(options, "crop");
  let angle = utils.build_array(utils.option_consume(options, "angle")).join(".");
  let no_html_sizes = has_layer || utils.present(angle) || crop === "fit" || crop === "limit" || responsive_width;
  if (width && (width.toString().indexOf("auto") === 0 || no_html_sizes || parseFloat(width) < 1)) {
    delete options.width;
  }
  if (height && (no_html_sizes || parseFloat(height) < 1)) {
    delete options.height;
  }
  let background = utils.option_consume(options, "background");
  background = background && background.replace(/^#/, "rgb:");
  let color = utils.option_consume(options, "color");
  color = color && color.replace(/^#/, "rgb:");
  let base_transformations = utils.build_array(utils.option_consume(options, "transformation", []));
  let named_transformation = [];
  if (base_transformations.some(isObject)) {
    base_transformations = base_transformations.map(tr => utils.generate_transformation_string(
      isObject(tr) ? clone(tr) : {transformation: tr}
    ));
  } else {
    named_transformation = base_transformations.join(".");
    base_transformations = [];
  }
  let effect = utils.option_consume(options, "effect");
  if (isArray(effect)) {
    effect = effect.join(":");
  } else if (isObject(effect)) {
    effect = entries(effect).map(
      ([key, value]) => `${key}:${value}`,
    );
  }
  let border = utils.option_consume(options, "border");
  if (isObject(border)) {
    border = `${border.width != null ? border.width : 2}px_solid_${(border.color != null ? border.color : "black").replace(/^#/, 'rgb:')}`;
  } else if (/^\d+$/.exec(border)) { // fallback to html border attributes
    options.border = border;
    border = void 0;
  }
  let flags = utils.build_array(utils.option_consume(options, "flags")).join(".");
  let dpr = utils.option_consume(options, "dpr", config().dpr);
  if (options.offset != null) {
    [options.start_offset, options.end_offset] = split_range(utils.option_consume(options, "offset"));
  }

  let overlay = process_layer(utils.option_consume(options, "overlay"));
  let radius = process_radius(utils.option_consume(options, "radius"));
  let underlay = process_layer(utils.option_consume(options, "underlay"));
  let ifValue = process_if(utils.option_consume(options, "if"));
  let custom_function = process_custom_function(utils.option_consume(options, "custom_function"));
  let custom_pre_function = process_custom_pre_function(utils.option_consume(options, "custom_pre_function"));
  let fps = utils.option_consume(options, 'fps');
  if (isArray(fps)) {
    fps = fps.join('-');
  }

  let params = {
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
    z: normalize_expression(utils.option_consume(options, "zoom")),
  };

  let simple_params = [
    ["audio_codec", "ac"],
    ["audio_frequency", "af"],
    ["bit_rate", 'br'],
    ["color_space", "cs"],
    ["default_image", "d"],
    ["delay", "dl"],
    ["density", "dn"],
    ["duration", "du"],
    ["end_offset", "eo"],
    ["fetch_format", "f"],
    ["gravity", "g"],
    ["page", "pg"],
    ["prefix", "p"],
    ["start_offset", "so"],
    ["streaming_profile", "sp"],
    ["video_codec", "vc"],
    ["video_sampling", "vs"],
  ];

  simple_params.forEach(([name, short]) => {
    let value = utils.option_consume(options, name);
    if (value !== undefined) {
      params[short] = value;
    }
  });
  if (params.vc != null) {
    params.vc = process_video_params(params.vc);
  }
  ["so", "eo", "du"].forEach((short) => {
    if (params[short] !== undefined) {
      params[short] = norm_range_value(params[short]);
    }
  });

  return params;
}

exports.createParamsFromOptions = createParamsFromOptions;
