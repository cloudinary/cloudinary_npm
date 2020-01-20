const DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION = {
  width: "auto",
  crop: "limit",
};

const DEFAULT_POSTER_OPTIONS = {
  format: 'jpg',
  resource_type: 'video',
};

const DEFAULT_VIDEO_SOURCE_TYPES = ['webm', 'mp4', 'ogv'];

const CONDITIONAL_OPERATORS = {
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
  "-": "sub",
};

const PREDEFINED_VARS = {
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
  "width": "w",
};

const LAYER_KEYWORD_PARAMS = {
  font_weight: "normal",
  font_style: "normal",
  text_decoration: "none",
  text_align: null,
  stroke: "none",
};


module.exports = {
  DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION,
  DEFAULT_POSTER_OPTIONS,
  DEFAULT_VIDEO_SOURCE_TYPES,
  CONDITIONAL_OPERATORS,
  PREDEFINED_VARS,
  LAYER_KEYWORD_PARAMS,
};
