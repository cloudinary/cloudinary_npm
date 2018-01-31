(function() {
  var Chunkable, EncodeFieldPart, EncodeFilePart, Q, TEXT_PARAMS, UploadStream, Writable, _, build_upload_params, call_api, call_context_api, call_tags_api, config, fs, https, path, post, util, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require("lodash");

  config = require("./config");

  if (config().upload_prefix && config().upload_prefix.slice(0, 5) === 'http:') {
    https = require('http');
  } else {
    https = require('https');
  }

  UploadStream = require('./upload_stream');

  utils = require("./utils");

  util = require("util");

  fs = require('fs');

  path = require('path');

  Q = require('q');

  Writable = require("stream").Writable;

  build_upload_params = function(options) {
    return utils.build_upload_params(options);
  };

  exports.unsigned_upload_stream = function(upload_preset, callback, options) {
    if (options == null) {
      options = {};
    }
    return exports.upload_stream(callback, utils.merge(options, {
      unsigned: true,
      upload_preset: upload_preset
    }));
  };

  exports.upload_stream = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return exports.upload(null, callback, _.extend({
      stream: true
    }, options));
  };

  exports.unsigned_upload = function(file, upload_preset, callback, options) {
    if (options == null) {
      options = {};
    }
    return exports.upload(file, callback, utils.merge(options, {
      unsigned: true,
      upload_preset: upload_preset
    }));
  };

  exports.upload = function(file, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("upload", callback, options, function() {
      var params;
      params = build_upload_params(options);
      if ((file != null) && file.match(/^ftp:|^https?:|^s3:|^data:[^;]*;base64,([a-zA-Z0-9\/+\n=]+)$/)) {
        return [
          params, {
            file: file
          }
        ];
      } else {
        return [params, {}, file];
      }
    });
  };

  exports.upload_large = function(path, callback, options) {
    if (options == null) {
      options = {};
    }
    if ((path != null) && path.match(/^https?:/)) {
      return exports.upload(path, callback, options);
    } else {
      return exports.upload_chunked(path, callback, _.extend({
        resource_type: 'raw'
      }, options));
    }
  };

  exports.upload_chunked = function(path, callback, options) {
    var file_reader, out_stream;
    file_reader = fs.createReadStream(path);
    out_stream = exports.upload_chunked_stream(callback, options);
    return file_reader.pipe(out_stream);
  };

  Chunkable = (function(superClass) {
    extend(Chunkable, superClass);

    function Chunkable(options) {
      var ref;
      this.chunk_size = (ref = options.chunk_size) != null ? ref : 20000000;
      this.buffer = new Buffer(0);
      this.active = true;
      Chunkable.__super__.constructor.call(this, options);
      this.on('finish', (function(_this) {
        return function() {
          if (_this.active) {
            return _this.emit('ready', _this.buffer, true, function() {});
          }
        };
      })(this));
    }

    Chunkable.prototype._write = function(data, encoding, done) {
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
        return this.emit('ready', this.buffer, false, (function(_this) {
          return function(active) {
            _this.active = active;
            if (_this.active) {
              _this.buffer = data.slice(grab);
              return done();
            }
          };
        })(this));
      }
    };

    return Chunkable;

  })(Writable);

  exports.upload_large_stream = function(_unused_, callback, options) {
    if (options == null) {
      options = {};
    }
    return exports.upload_chunked_stream(callback, _.extend({
      resource_type: 'raw'
    }, options));
  };

  exports.upload_chunked_stream = function(callback, options) {
    var chunk_size, chunker, params, ref, sent;
    if (options == null) {
      options = {};
    }
    options = _.extend({}, options, {
      stream: true
    });
    options.x_unique_upload_id = utils.random_public_id();
    params = build_upload_params(options);
    chunk_size = (ref = options.chunk_size) != null ? ref : options.part_size;
    chunker = new Chunkable({
      chunk_size: chunk_size
    });
    sent = 0;
    chunker.on('ready', function(buffer, is_last, done) {
      var chunk_start, finished_part, stream;
      chunk_start = sent;
      sent += buffer.length;
      options.content_range = util.format("bytes %d-%d/%d", chunk_start, sent - 1, is_last ? sent : -1);
      finished_part = function(result) {
        if ((result.error != null) || is_last) {
          if (typeof callback === "function") {
            callback(result);
          }
          return done(false);
        } else {
          return done(true);
        }
      };
      stream = call_api("upload", finished_part, options, function() {
        return [params, {}, buffer];
      });
      return stream.write(buffer, 'buffer', function() {
        return stream.end();
      });
    });
    return chunker;
  };

  exports.explicit = function(public_id, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("explicit", callback, options, function() {
      return utils.build_explicit_api_params(public_id, options);
    });
  };

  exports.create_archive = function(callback, options, target_format) {
    if (options == null) {
      options = {};
    }
    if (target_format == null) {
      target_format = null;
    }
    return call_api("generate_archive", callback, options, function() {
      var opt;
      opt = utils.archive_params(options);
      if (target_format) {
        opt.target_format = target_format;
      }
      return [opt];
    });
  };

  exports.create_zip = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return exports.create_archive(callback, options, "zip");
  };

  exports.destroy = function(public_id, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("destroy", callback, options, function() {
      return [
        {
          timestamp: utils.timestamp(),
          type: options.type,
          invalidate: options.invalidate,
          public_id: public_id
        }
      ];
    });
  };

  exports.rename = function(from_public_id, to_public_id, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("rename", callback, options, function() {
      return [
        {
          timestamp: utils.timestamp(),
          type: options.type,
          from_public_id: from_public_id,
          to_public_id: to_public_id,
          overwrite: options.overwrite,
          invalidate: options.invalidate,
          to_type: options.to_type
        }
      ];
    });
  };

  TEXT_PARAMS = ["public_id", "font_family", "font_size", "font_color", "text_align", "font_weight", "font_style", "background", "opacity", "text_decoration"];

  exports.text = function(text, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("text", callback, options, function() {
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

  exports.generate_sprite = function(tag, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("sprite", callback, options, function() {
      var transformation;
      transformation = utils.generate_transformation_string(_.extend({}, options, {
        fetch_format: options.format
      }));
      return [
        {
          timestamp: utils.timestamp(),
          tag: tag,
          transformation: transformation,
          async: options.async,
          notification_url: options.notification_url
        }
      ];
    });
  };

  exports.multi = function(tag, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("multi", callback, options, function() {
      var transformation;
      transformation = utils.generate_transformation_string(_.extend({}, options));
      return [
        {
          timestamp: utils.timestamp(),
          tag: tag,
          transformation: transformation,
          format: options.format,
          async: options.async,
          notification_url: options.notification_url
        }
      ];
    });
  };

  exports.explode = function(public_id, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("explode", callback, options, function() {
      var transformation;
      transformation = utils.generate_transformation_string(_.extend({}, options));
      return [
        {
          timestamp: utils.timestamp(),
          public_id: public_id,
          transformation: transformation,
          format: options.format,
          type: options.type,
          notification_url: options.notification_url
        }
      ];
    });
  };

  exports.add_tag = function(tag, public_ids, callback, options) {
    var command, exclusive;
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    exclusive = utils.option_consume("exclusive", options);
    command = exclusive ? "set_exclusive" : "add";
    return call_tags_api(tag, command, public_ids, callback, options);
  };

  exports.remove_tag = function(tag, public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_tags_api(tag, "remove", public_ids, callback, options);
  };

  exports.remove_all_tags = function(public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_tags_api(null, "remove_all", public_ids, callback, options);
  };

  exports.replace_tag = function(tag, public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_tags_api(tag, "replace", public_ids, callback, options);
  };

  call_tags_api = function(tag, command, public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_api("tags", callback, options, function() {
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

  exports.add_context = function(context, public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_context_api(context, 'add', public_ids, callback, options);
  };

  exports.remove_all_context = function(public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_context_api(null, 'remove_all', public_ids, callback, options);
  };

  call_context_api = function(context, command, public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_api('context', callback, options, function() {
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

  call_api = function(action, callback, options, get_params) {
    var api_url, boundary, deferred, error, file, handle_response, j, key, len, params, post_data, ref, result, unsigned_params, v, value;
    deferred = Q.defer();
    if (options == null) {
      options = {};
    }
    ref = get_params.call(), params = ref[0], unsigned_params = ref[1], file = ref[2];
    params = utils.process_request_params(params, options);
    params = _.extend(params, unsigned_params);
    api_url = utils.api_url(action, options);
    boundary = utils.random_public_id();
    error = false;
    handle_response = function(res) {
      var buffer, error_obj;
      if (error) {

      } else if (res.error) {
        error = true;
        deferred.reject(res);
        return typeof callback === "function" ? callback(res) : void 0;
      } else if (_.includes([200, 400, 401, 404, 420, 500], res.statusCode)) {
        buffer = "";
        res.on("data", function(d) {
          return buffer += d;
        });
        res.on("end", function() {
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
                message: "Server return invalid JSON response. Status Code " + res.statusCode
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
        return res.on("error", function(e) {
          error = true;
          deferred.reject(e);
          return typeof callback === "function" ? callback({
            error: e
          }) : void 0;
        });
      } else {
        error_obj = {
          error: {
            message: "Server returned unexpected status code - " + res.statusCode,
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
      if (_.isArray(value)) {
        for (j = 0, len = value.length; j < len; j++) {
          v = value[j];
          post_data.push(new Buffer(EncodeFieldPart(boundary, key + "[]", v), 'utf8'));
        }
      } else if (utils.present(value)) {
        post_data.push(new Buffer(EncodeFieldPart(boundary, key, value), 'utf8'));
      }
    }
    result = post(api_url, post_data, boundary, file, handle_response, options);
    if (_.isObject(result)) {
      return result;
    } else {
      return deferred.promise;
    }
  };

  post = function(url, post_data, boundary, file, callback, options) {
    var file_header, filename, finish_buffer, headers, i, j, post_options, post_request, ref, ref1, timeout, upload_stream;
    finish_buffer = new Buffer("--" + boundary + "--", 'ascii');
    if ((file != null) || options.stream) {
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
    post_options = _.extend(post_options, {
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
    post_request.on("error", function(e) {
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
    post_request.setTimeout((ref = options.timeout) != null ? ref : 60000, function() {
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
      fs.createReadStream(file).on('error', function(error) {
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

  EncodeFieldPart = function(boundary, name, value) {
    var return_part;
    return_part = "--" + boundary + "\r\n";
    return_part += "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n";
    return_part += value + "\r\n";
    return return_part;
  };

  EncodeFilePart = function(boundary, type, name, filename) {
    var return_part;
    return_part = "--" + boundary + "\r\n";
    return_part += "Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename + "\"\r\n";
    return_part += "Content-Type: " + type + "\r\n\r\n";
    return return_part;
  };

  exports.direct_upload = function(callback_url, options) {
    var api_url, params;
    if (options == null) {
      options = {};
    }
    params = build_upload_params(_.extend({
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

  exports.upload_tag_params = function(options) {
    var params;
    if (options == null) {
      options = {};
    }
    params = build_upload_params(options);
    params = utils.process_request_params(params, options);
    return JSON.stringify(params);
  };

  exports.upload_url = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.resource_type == null) {
      options.resource_type = "auto";
    }
    return utils.api_url("upload", options);
  };

  exports.image_upload_tag = function(field, options) {
    var html_options, ref, tag_options;
    if (options == null) {
      options = {};
    }
    html_options = (ref = options.html) != null ? ref : {};
    tag_options = _.extend({
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

  exports.unsigned_image_upload_tag = function(field, upload_preset, options) {
    if (options == null) {
      options = {};
    }
    return exports.image_upload_tag(field, utils.merge(options, {
      unsigned: true,
      upload_preset: upload_preset
    }));
  };

}).call(this);

//# sourceMappingURL=uploader.js.map
