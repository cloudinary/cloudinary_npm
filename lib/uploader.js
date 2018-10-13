"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Chunkable, EncodeFieldPart, EncodeFilePart, Q, TEXT_PARAMS, UploadStream, Writable, build_upload_params, call_api, call_context_api, call_tags_api, config, extend, fs, https, includes, isArray, isObject, path, post, utils;
config = require("./config");

if (config().upload_prefix && config().upload_prefix.slice(0, 5) === 'http:') {
  https = require('http');
} else {
  https = require('https');
} //http = require('http')


UploadStream = require('./upload_stream');
utils = require("./utils");
var _utils = utils;
extend = _utils.extend;
includes = _utils.includes;
isArray = _utils.isArray;
isObject = _utils.isObject;
fs = require('fs');
path = require('path');
Q = require('q');
Writable = require("stream").Writable; // Multipart support based on http://onteria.wordpress.com/2011/05/30/multipartform-data-uploads-using-node-js-and-http-request/

build_upload_params = function build_upload_params(options) {
  return utils.build_upload_params(options);
};

exports.unsigned_upload_stream = function (upload_preset, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return exports.upload_stream(callback, utils.merge(options, {
    unsigned: true,
    upload_preset: upload_preset
  }));
};

exports.upload_stream = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return exports.upload(null, callback, extend({
    stream: true
  }, options));
};

exports.unsigned_upload = function (file, upload_preset, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return exports.upload(file, callback, utils.merge(options, {
    unsigned: true,
    upload_preset: upload_preset
  }));
};

exports.upload = function (file, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("upload", callback, options, function () {
    var params;
    params = build_upload_params(options);

    if (file != null && file.match(/^ftp:|^https?:|^s3:|^data:[^;]*;base64,([a-zA-Z0-9\/+\n=]+)$/)) {
      return [params, {
        file: file
      }];
    } else {
      return [params, {}, file];
    }
  });
};

exports.upload_large = function (path, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (path != null && path.match(/^https?:/)) {
    return exports.upload(path, callback, options);
  } else {
    return exports.upload_chunked(path, callback, extend({
      resource_type: 'raw'
    }, options));
  }
};

exports.upload_chunked = function (path, callback, options) {
  var file_reader, out_stream;
  file_reader = fs.createReadStream(path);
  out_stream = exports.upload_chunked_stream(callback, options);
  return file_reader.pipe(out_stream);
};

Chunkable =
/*#__PURE__*/
function (_Writable) {
  _inherits(Chunkable, _Writable);

  function Chunkable(options) {
    var _this;

    _classCallCheck(this, Chunkable);

    var ref;
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Chunkable).call(this, options));
    _this.chunk_size = (ref = options.chunk_size) != null ? ref : 20000000;
    _this.buffer = new Buffer(0);
    _this.active = true;

    _this.on('finish', function () {
      if (_this.active) {
        return _this.emit('ready', _this.buffer, true, function () {});
      }
    });

    return _this;
  }

  _createClass(Chunkable, [{
    key: "_write",
    value: function _write(data, encoding, done) {
      var _this2 = this;

      var grab;

      if (!this.active) {
        return done();
      }

      if (this.buffer.length + data.length <= this.chunk_size) {
        this.buffer = Buffer.concat([this.buffer, data], this.buffer.length + data.length);
        return done();
      } else {
        grab = this.chunk_size - this.buffer.length;
        this.buffer = Buffer.concat([this.buffer, data.slice(0, grab)], this.buffer.length + grab);
        return this.emit('ready', this.buffer, false, function (active) {
          _this2.active = active;

          if (_this2.active) {
            _this2.buffer = data.slice(grab);
            return done();
          }
        });
      }
    }
  }]);

  return Chunkable;
}(Writable);

exports.upload_large_stream = function (_unused_, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return exports.upload_chunked_stream(callback, extend({
    resource_type: 'raw'
  }, options));
};

exports.upload_chunked_stream = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var chunk_size, chunker, params, ref, sent;
  options = extend({}, options, {
    stream: true
  });
  options.x_unique_upload_id = utils.random_public_id();
  params = build_upload_params(options);
  chunk_size = (ref = options.chunk_size) != null ? ref : options.part_size;
  chunker = new Chunkable({
    chunk_size: chunk_size
  });
  sent = 0;
  chunker.on('ready', function (buffer, is_last, done) {
    var chunk_start, finished_part, stream;
    chunk_start = sent;
    sent += buffer.length;
    options.content_range = "bytes ".concat(chunk_start, "-").concat(sent - 1, "/").concat(is_last ? sent : -1);

    finished_part = function finished_part(result) {
      if (result.error != null || is_last) {
        if (typeof callback === "function") {
          callback(result);
        }

        return done(false);
      } else {
        return done(true);
      }
    };

    stream = call_api("upload", finished_part, options, function () {
      return [params, {}, buffer];
    });
    return stream.write(buffer, 'buffer', function () {
      return stream.end();
    });
  });
  return chunker;
};

exports.explicit = function (public_id, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("explicit", callback, options, function () {
    return utils.build_explicit_api_params(public_id, options);
  });
}; // Creates a new archive in the server and returns information in JSON format


exports.create_archive = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var target_format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  return call_api("generate_archive", callback, options, function () {
    var opt;
    opt = utils.archive_params(options);

    if (target_format) {
      opt.target_format = target_format;
    }

    return [opt];
  });
}; // Creates a new zip archive in the server and returns information in JSON format


exports.create_zip = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return exports.create_archive(callback, options, "zip");
};

exports.destroy = function (public_id, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("destroy", callback, options, function () {
    return [{
      timestamp: utils.timestamp(),
      type: options.type,
      invalidate: options.invalidate,
      public_id: public_id
    }];
  });
};

exports.rename = function (from_public_id, to_public_id, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return call_api("rename", callback, options, function () {
    return [{
      timestamp: utils.timestamp(),
      type: options.type,
      from_public_id: from_public_id,
      to_public_id: to_public_id,
      overwrite: options.overwrite,
      invalidate: options.invalidate,
      to_type: options.to_type
    }];
  });
};

TEXT_PARAMS = ["public_id", "font_family", "font_size", "font_color", "text_align", "font_weight", "font_style", "background", "opacity", "text_decoration"];

exports.text = function (text, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("text", callback, options, function () {
    var j, k, len, params;
    params = {
      timestamp: utils.timestamp(),
      text: text
    };

    for (j = 0, len = TEXT_PARAMS.length; j < len; j++) {
      k = TEXT_PARAMS[j];

      if (options[k] != null) {
        params[k] = options[k];
      }
    }

    return [params];
  });
};

exports.generate_sprite = function (tag, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("sprite", callback, options, function () {
    var transformation;
    transformation = utils.generate_transformation_string(extend({}, options, {
      fetch_format: options.format
    }));
    return [{
      timestamp: utils.timestamp(),
      tag: tag,
      transformation: transformation,
      async: options.async,
      notification_url: options.notification_url
    }];
  });
};

exports.multi = function (tag, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("multi", callback, options, function () {
    var transformation;
    transformation = utils.generate_transformation_string(extend({}, options));
    return [{
      timestamp: utils.timestamp(),
      tag: tag,
      transformation: transformation,
      format: options.format,
      async: options.async,
      notification_url: options.notification_url
    }];
  });
};

exports.explode = function (public_id, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("explode", callback, options, function () {
    var transformation;
    transformation = utils.generate_transformation_string(extend({}, options));
    return [{
      timestamp: utils.timestamp(),
      public_id: public_id,
      transformation: transformation,
      format: options.format,
      type: options.type,
      notification_url: options.notification_url
    }];
  });
}; // options may include 'exclusive' (boolean) which causes clearing this tag from all other resources 


exports.add_tag = function (tag) {
  var public_ids = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var callback = arguments.length > 2 ? arguments[2] : undefined;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var command, exclusive;
  exclusive = utils.option_consume("exclusive", options);
  command = exclusive ? "set_exclusive" : "add";
  return call_tags_api(tag, command, public_ids, callback, options);
};

exports.remove_tag = function (tag) {
  var public_ids = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var callback = arguments.length > 2 ? arguments[2] : undefined;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return call_tags_api(tag, "remove", public_ids, callback, options);
};

exports.remove_all_tags = function () {
  var public_ids = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var callback = arguments.length > 1 ? arguments[1] : undefined;
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_tags_api(null, "remove_all", public_ids, callback, options);
};

exports.replace_tag = function (tag) {
  var public_ids = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var callback = arguments.length > 2 ? arguments[2] : undefined;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return call_tags_api(tag, "replace", public_ids, callback, options);
};

call_tags_api = function call_tags_api(tag, command) {
  var public_ids = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var callback = arguments.length > 3 ? arguments[3] : undefined;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  return call_api("tags", callback, options, function () {
    var params;
    params = {
      timestamp: utils.timestamp(),
      public_ids: utils.build_array(public_ids),
      command: command,
      type: options.type
    };

    if (tag != null) {
      params.tag = tag;
    }

    return [params];
  });
};

exports.add_context = function (context) {
  var public_ids = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var callback = arguments.length > 2 ? arguments[2] : undefined;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return call_context_api(context, 'add', public_ids, callback, options);
};

exports.remove_all_context = function () {
  var public_ids = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var callback = arguments.length > 1 ? arguments[1] : undefined;
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_context_api(null, 'remove_all', public_ids, callback, options);
};

call_context_api = function call_context_api(context, command) {
  var public_ids = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var callback = arguments.length > 3 ? arguments[3] : undefined;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  return call_api('context', callback, options, function () {
    var params;
    params = {
      timestamp: utils.timestamp(),
      public_ids: utils.build_array(public_ids),
      command: command,
      type: options.type
    };

    if (context != null) {
      params.context = utils.encode_context(context);
    }

    return [params];
  });
};

call_api = function call_api(action, callback, options, get_params) {
  var api_url, boundary, deferred, error, file, handle_response, j, key, len, params, post_data, result, unsigned_params, v, value;
  deferred = Q.defer();

  if (options == null) {
    options = {};
  }

  var _get_params$call = get_params.call();

  var _get_params$call2 = _slicedToArray(_get_params$call, 3);

  params = _get_params$call2[0];
  unsigned_params = _get_params$call2[1];
  file = _get_params$call2[2];
  params = utils.process_request_params(params, options);
  params = extend(params, unsigned_params);
  api_url = utils.api_url(action, options);
  boundary = utils.random_public_id();
  error = false;

  handle_response = function handle_response(res) {
    var buffer, error_obj;

    if (error) {// Already reported
    } else if (res.error) {
      error = true;
      deferred.reject(res);
      return typeof callback === "function" ? callback(res) : void 0;
    } else if (includes([200, 400, 401, 404, 420, 500], res.statusCode)) {
      buffer = "";
      res.on("data", function (d) {
        return buffer += d;
      });
      res.on("end", function () {
        var e, result;

        if (error) {
          return;
        }

        try {
          result = JSON.parse(buffer);
        } catch (error1) {
          e = error1;
          result = {
            error: {
              message: "Server return invalid JSON response. Status Code ".concat(res.statusCode)
            }
          };
        }

        if (result["error"]) {
          result["error"]["http_code"] = res.statusCode;
        }

        if (result.error) {
          deferred.reject(result.error);
        } else {
          deferred.resolve(result);
        }

        return typeof callback === "function" ? callback(result) : void 0;
      });
      return res.on("error", function (e) {
        error = true;
        deferred.reject(e);
        return typeof callback === "function" ? callback({
          error: e
        }) : void 0;
      });
    } else {
      error_obj = {
        error: {
          message: "Server returned unexpected status code - ".concat(res.statusCode),
          http_code: res.statusCode
        }
      };
      deferred.reject(error_obj.error);
      return typeof callback === "function" ? callback(error_obj) : void 0;
    }
  };

  post_data = [];

  for (key in params) {
    value = params[key];

    if (isArray(value)) {
      for (j = 0, len = value.length; j < len; j++) {
        v = value[j];
        post_data.push(new Buffer(EncodeFieldPart(boundary, key + "[]", v), 'utf8'));
      }
    } else if (utils.present(value)) {
      post_data.push(new Buffer(EncodeFieldPart(boundary, key, value), 'utf8'));
    }
  }

  result = post(api_url, post_data, boundary, file, handle_response, options);

  if (isObject(result)) {
    return result;
  } else {
    return deferred.promise;
  }
};

post = function post(url, post_data, boundary, file, callback, options) {
  var file_header, filename, finish_buffer, headers, i, j, post_options, post_request, ref, ref1, timeout, upload_stream;
  finish_buffer = new Buffer("--" + boundary + "--", 'ascii');

  if (file != null || options.stream) {
    filename = options.stream ? "file" : path.basename(file);
    file_header = new Buffer(EncodeFilePart(boundary, 'application/octet-stream', 'file', filename), 'binary');
  }

  post_options = require('url').parse(url);
  headers = {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'User-Agent': utils.getUserAgent()
  };

  if (options.content_range != null) {
    headers['Content-Range'] = options.content_range;
  }

  if (options.x_unique_upload_id != null) {
    headers['X-Unique-Upload-Id'] = options.x_unique_upload_id;
  }

  post_options = extend(post_options, {
    method: 'POST',
    headers: headers
  });

  if (options.agent != null) {
    post_options.agent = options.agent;
  }

  post_request = https.request(post_options, callback);
  upload_stream = new UploadStream({
    boundary: boundary
  });
  upload_stream.pipe(post_request);
  timeout = false;
  post_request.on("error", function (e) {
    if (timeout) {
      return callback({
        error: {
          message: "Request Timeout",
          http_code: 499
        }
      });
    } else {
      return callback({
        error: e
      });
    }
  });
  post_request.setTimeout((ref = options.timeout) != null ? ref : 60000, function () {
    timeout = true;
    return post_request.abort();
  });

  for (i = j = 0, ref1 = post_data.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
    post_request.write(post_data[i]);
  }

  if (options.stream) {
    post_request.write(file_header);
    return upload_stream;
  } else if (file != null) {
    post_request.write(file_header);
    fs.createReadStream(file).on('error', function (error) {
      callback({
        error: error
      });
      return post_request.abort();
    }).pipe(upload_stream);
  } else {
    post_request.write(finish_buffer);
    post_request.end();
  }

  return true;
};

EncodeFieldPart = function EncodeFieldPart(boundary, name, value) {
  var return_part;
  return_part = "--".concat(boundary, "\r\n");
  return_part += "Content-Disposition: form-data; name=\"".concat(name, "\"\r\n\r\n");
  return_part += value + "\r\n";
  return return_part;
};

EncodeFilePart = function EncodeFilePart(boundary, type, name, filename) {
  var return_part;
  return_part = "--".concat(boundary, "\r\n");
  return_part += "Content-Disposition: form-data; name=\"".concat(name, "\"; filename=\"").concat(filename, "\"\r\n");
  return_part += "Content-Type: ".concat(type, "\r\n\r\n");
  return return_part;
};

exports.direct_upload = function (callback_url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var api_url, params;
  params = build_upload_params(extend({
    callback: callback_url
  }, options));
  params = utils.process_request_params(params, options);
  api_url = utils.api_url("upload", options);
  return {
    hidden_fields: params,
    form_attrs: {
      action: api_url,
      method: "POST",
      enctype: "multipart/form-data"
    }
  };
};

exports.upload_tag_params = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var params;
  params = build_upload_params(options);
  params = utils.process_request_params(params, options);
  return JSON.stringify(params);
};

exports.upload_url = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (options.resource_type == null) {
    options.resource_type = "auto";
  }

  return utils.api_url("upload", options);
};

exports.image_upload_tag = function (field) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var html_options, ref, tag_options;
  html_options = (ref = options.html) != null ? ref : {};
  tag_options = extend({
    type: "file",
    name: "file",
    "data-url": exports.upload_url(options),
    "data-form-data": exports.upload_tag_params(options),
    "data-cloudinary-field": field,
    "data-max-chunk-size": options.chunk_size,
    "class": [html_options["class"], "cloudinary-fileupload"].join(" ")
  }, html_options);
  return '<input ' + utils.html_attrs(tag_options) + '/>';
};

exports.unsigned_image_upload_tag = function (field, upload_preset) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return exports.image_upload_tag(field, utils.merge(options, {
    unsigned: true,
    upload_preset: upload_preset
  }));
};