const fs = require('fs');
const { extname, basename } = require('path');
const Q = require('q');
const Writable = require("stream").Writable;
const urlLib = require('url');

// eslint-disable-next-line import/order
const { upload_prefix } = require("./config");

const isSecure = !(upload_prefix && upload_prefix.slice(0, 5) === 'http:');
const https = isSecure ? require('https') : require('http');

const Cache = require('./cache');
const utils = require("./utils");
const UploadStream = require('./upload_stream');

const {
  build_upload_params,
  extend,
  includes,
  isObject,
  isRemoteUrl,
  merge,
  pickOnlyExistingValues
} = utils;

exports.unsigned_upload_stream = function unsigned_upload_stream(upload_preset, callback, options = {}) {
  return exports.upload_stream(callback, merge(options, {
    unsigned: true,
    upload_preset: upload_preset
  }));
};

exports.upload_stream = function upload_stream(callback, options = {}) {
  return exports.upload(null, callback, extend({
    stream: true
  }, options));
};

exports.unsigned_upload = function unsigned_upload(file, upload_preset, callback, options = {}) {
  return exports.upload(file, callback, merge(options, {
    unsigned: true,
    upload_preset: upload_preset
  }));
};

exports.upload = function upload(file, callback, options = {}) {
  return call_api("upload", callback, options, function () {
    let params = build_upload_params(options);
    return isRemoteUrl(file) ? [params, { file: file }] : [params, {}, file];
  });
};

exports.upload_large = function upload_large(path, callback, options = {}) {
  if ((path != null) && isRemoteUrl(path)) {
    // upload a remote file
    return exports.upload(path, callback, options);
  }
  if (path != null && !options.filename) {
    options.filename = path.split(/(\\|\/)/g).pop().replace(/\.[^/.]+$/, "");
  }
  return exports.upload_chunked(path, callback, extend({
    resource_type: 'raw'
  }, options));
};

exports.upload_chunked = function upload_chunked(path, callback, options) {
  let file_reader = fs.createReadStream(path);
  let out_stream = exports.upload_chunked_stream(callback, options);
  return file_reader.pipe(out_stream);
};

class Chunkable extends Writable {
  constructor(options) {
    super(options);
    this.chunk_size = options.chunk_size != null ? options.chunk_size : 20000000;
    this.buffer = Buffer.alloc(0);
    this.active = true;
    this.on('finish', () => {
      if (this.active) {
        this.emit('ready', this.buffer, true, function () {
        });
      }
    });
  }

  _write(data, encoding, done) {
    if (!this.active) {
      done();
    }
    if (this.buffer.length + data.length <= this.chunk_size) {
      this.buffer = Buffer.concat([this.buffer, data], this.buffer.length + data.length);
      done();
    } else {
      const grab = this.chunk_size - this.buffer.length;
      this.buffer = Buffer.concat([this.buffer, data.slice(0, grab)], this.buffer.length + grab);
      this.emit('ready', this.buffer, false, (active) => {
        this.active = active;
        if (this.active) {
          this.buffer = data.slice(grab);
          done();
        }
      });
    }
  }
}

exports.upload_large_stream = function upload_large_stream(_unused_, callback, options = {}) {
  return exports.upload_chunked_stream(callback, extend({
    resource_type: 'raw'
  }, options));
};

exports.upload_chunked_stream = function upload_chunked_stream(callback, options = {}) {
  options = extend({}, options, {
    stream: true
  });
  options.x_unique_upload_id = utils.random_public_id();
  let params = build_upload_params(options);
  let chunk_size = options.chunk_size != null ? options.chunk_size : options.part_size;
  let chunker = new Chunkable({
    chunk_size: chunk_size
  });
  let sent = 0;
  chunker.on('ready', function (buffer, is_last, done) {
    let chunk_start = sent;
    sent += buffer.length;
    options.content_range = `bytes ${chunk_start}-${sent - 1}/${(is_last ? sent : -1)}`;
    params.timestamp = utils.timestamp();
    let finished_part = function (result) {
      const errorOrLast = (result.error != null) || is_last;
      if (errorOrLast && typeof callback === "function") {
        callback(result);
      }
      return done(!errorOrLast);
    };
    let stream = call_api("upload", finished_part, options, function () {
      return [params, {}, buffer];
    });
    return stream.write(buffer, 'buffer', function () {
      return stream.end();
    });
  });
  return chunker;
};

exports.explicit = function explicit(public_id, callback, options = {}) {
  return call_api("explicit", callback, options, function () {
    return utils.build_explicit_api_params(public_id, options);
  });
};

// Creates a new archive in the server and returns information in JSON format
exports.create_archive = function create_archive(callback, options = {}, target_format = null) {
  return call_api("generate_archive", callback, options, function () {
    let opt = utils.archive_params(options);
    if (target_format) {
      opt.target_format = target_format;
    }
    return [opt];
  });
};

// Creates a new zip archive in the server and returns information in JSON format
exports.create_zip = function create_zip(callback, options = {}) {
  return exports.create_archive(callback, options, "zip");
};

exports.destroy = function destroy(public_id, callback, options = {}) {
  return call_api("destroy", callback, options, function () {
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

exports.rename = function rename(from_public_id, to_public_id, callback, options = {}) {
  return call_api("rename", callback, options, function () {
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

const TEXT_PARAMS = ["public_id", "font_family", "font_size", "font_color", "text_align", "font_weight", "font_style", "background", "opacity", "text_decoration", "font_hinting", "font_antialiasing"];

exports.text = function text(content, callback, options = {}) {
  return call_api("text", callback, options, function () {
    let textParams = pickOnlyExistingValues(options, ...TEXT_PARAMS);
    let params = {
      timestamp: utils.timestamp(),
      text: content,
      ...textParams
    };

    return [params];
  });
};

exports.generate_sprite = function generate_sprite(tag, callback, options = {}) {
  return call_api("sprite", callback, options, function () {
    const transformation = utils.generate_transformation_string(extend({}, options, {
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

exports.multi = function multi(tag, callback, options = {}) {
  return call_api("multi", callback, options, function () {
    const transformation = utils.generate_transformation_string(extend({}, options));
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

exports.explode = function explode(public_id, callback, options = {}) {
  return call_api("explode", callback, options, function () {
    const transformation = utils.generate_transformation_string(extend({}, options));
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

// options may include 'exclusive' (boolean) which causes clearing this tag from all other resources
exports.add_tag = function add_tag(tag, public_ids = [], callback, options = {}) {
  const exclusive = utils.option_consume("exclusive", options);
  const command = exclusive ? "set_exclusive" : "add";
  return call_tags_api(tag, command, public_ids, callback, options);
};

exports.remove_tag = function remove_tag(tag, public_ids = [], callback, options = {}) {
  return call_tags_api(tag, "remove", public_ids, callback, options);
};

exports.remove_all_tags = function remove_all_tags(public_ids = [], callback, options = {}) {
  return call_tags_api(null, "remove_all", public_ids, callback, options);
};

exports.replace_tag = function replace_tag(tag, public_ids = [], callback, options = {}) {
  return call_tags_api(tag, "replace", public_ids, callback, options);
};

function call_tags_api(tag, command, public_ids = [], callback, options = {}) {
  return call_api("tags", callback, options, function () {
    let params = {
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
}

exports.add_context = function add_context(context, public_ids = [], callback, options = {}) {
  return call_context_api(context, 'add', public_ids, callback, options);
};

exports.remove_all_context = function remove_all_context(public_ids = [], callback, options = {}) {
  return call_context_api(null, 'remove_all', public_ids, callback, options);
};

function call_context_api(context, command, public_ids = [], callback, options = {}) {
  return call_api('context', callback, options, function () {
    let params = {
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
}

/**
 * Cache (part of) the upload results.
 * @param result
 * @param {object} options
 * @param {string} options.type
 * @param {string} options.resource_type
 */
function cacheResults(result, { type, resource_type }) {
  if (result.responsive_breakpoints) {
    result.responsive_breakpoints.forEach(
      ({ transformation,
        url,
        breakpoints }) => Cache.set(
        result.public_id,
        { type, resource_type, raw_transformation: transformation, format: extname(breakpoints[0].url).slice(1) },
        breakpoints.map(i => i.width)
      )
    );
  }
}


function parseResult(buffer, res) {
  let result = '';
  try {
    result = JSON.parse(buffer);
    if (result.error && !result.error.name) {
      result.error.name = "Error";
    }
  } catch (jsonError) {
    result = {
      error: {
        message: `Server return invalid JSON response. Status Code ${res.statusCode}. ${jsonError}`,
        name: "Error"
      }
    };
  }
  return result;
}

function call_api(action, callback, options, get_params) {
  if (typeof callback !== "function") {
    callback = function () {};
  }

  let deferred = Q.defer();
  if (options == null) {
    options = {};
  }
  let [params, unsigned_params, file] = get_params.call();
  params = utils.process_request_params(params, options);
  params = extend(params, unsigned_params);
  let api_url = utils.api_url(action, options);
  let boundary = utils.random_public_id();
  let errorRaised = false;
  let handle_response = function (res) {
    // let buffer;
    if (errorRaised) {

      // Already reported
    } else if (res.error) {
      errorRaised = true;
      deferred.reject(res);
      callback(res);
    } else if (includes([200, 400, 401, 404, 420, 500], res.statusCode)) {
      let buffer = "";
      res.on("data", (d) => {
        buffer += d;
        return buffer;
      });
      res.on("end", () => {
        let result;
        if (errorRaised) {
          return;
        }
        result = parseResult(buffer, res);
        if (result.error) {
          result.error.http_code = res.statusCode;
          deferred.reject(result.error);
        } else {
          cacheResults(result, options);
          deferred.resolve(result);
        }
        callback(result);
      });
      res.on("error", (error) => {
        errorRaised = true;
        deferred.reject(error);
        callback({ error });
      });
    } else {
      let error = {
        message: `Server returned unexpected status code - ${res.statusCode}`,
        http_code: res.statusCode,
        name: "UnexpectedResponse"
      };
      deferred.reject(error);
      callback({ error });
    }
  };
  let post_data = utils.hashToParameters(params)
    .filter(([key, value]) => value != null)
    .map(
      ([key, value]) => Buffer.from(encodeFieldPart(boundary, key, value), 'utf8')
    );

  let result = post(api_url, post_data, boundary, file, handle_response, options);
  if (isObject(result)) {
    return result;
  }
  return deferred.promise;
}

function post(url, post_data, boundary, file, callback, options) {
  let file_header;
  let finish_buffer = Buffer.from("--" + boundary + "--", 'ascii');
  if ((file != null) || options.stream) {
    // eslint-disable-next-line no-nested-ternary
    let filename = options.stream ? options.filename ? options.filename : "file" : basename(file);
    file_header = Buffer.from(encodeFilePart(boundary, 'application/octet-stream', 'file', filename), 'binary');
  }
  let post_options = urlLib.parse(url);
  let headers = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
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
  let post_request = https.request(post_options, callback);
  let upload_stream = new UploadStream({ boundary });
  upload_stream.pipe(post_request);
  let timeout = false;
  post_request.on("error", function (error) {
    if (timeout) {
      error = {
        message: "Request Timeout",
        http_code: 499,
        name: "TimeoutError"
      };
    }
    return callback({ error });
  });
  post_request.setTimeout(options.timeout != null ? options.timeout : 60000, function () {
    timeout = true;
    return post_request.abort();
  });
  post_data.forEach(postDatum => post_request.write(postDatum));
  if (options.stream) {
    post_request.write(file_header);
    return upload_stream;
  }
  if (file != null) {
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
}

function encodeFieldPart(boundary, name, value) {
  return [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${name}"`,
    '',
    value,
    ''
  ].join("\r\n");
}

function encodeFilePart(boundary, type, name, filename) {
  return [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${name}"; filename="${filename}"`,
    `Content-Type: ${type}`,
    '',
    ''
  ].join("\r\n");
}

exports.direct_upload = function direct_upload(callback_url, options = {}) {
  let params = build_upload_params(extend({
    callback: callback_url
  }, options));
  params = utils.process_request_params(params, options);
  let api_url = utils.api_url("upload", options);
  return {
    hidden_fields: params,
    form_attrs: {
      action: api_url,
      method: "POST",
      enctype: "multipart/form-data"
    }
  };
};

exports.upload_tag_params = function upload_tag_params(options = {}) {
  let params = build_upload_params(options);
  params = utils.process_request_params(params, options);
  return JSON.stringify(params);
};

exports.upload_url = function upload_url(options = {}) {
  if (options.resource_type == null) {
    options.resource_type = "auto";
  }
  return utils.api_url("upload", options);
};

exports.image_upload_tag = function image_upload_tag(field, options = {}) {
  let html_options = options.html || {};
  let tag_options = extend({
    type: "file",
    name: "file",
    "data-url": exports.upload_url(options),
    "data-form-data": exports.upload_tag_params(options),
    "data-cloudinary-field": field,
    "data-max-chunk-size": options.chunk_size,
    "class": [html_options.class, "cloudinary-fileupload"].join(" ")
  }, html_options);
  return `<input ${utils.html_attrs(tag_options)}/>`;
};

exports.unsigned_image_upload_tag = function unsigned_image_upload_tag(field, upload_preset, options = {}) {
  return exports.image_upload_tag(field, merge(options, {
    unsigned: true,
    upload_preset: upload_preset
  }));
};


/**
 * Populates metadata fields with the given values. Existing values will be overwritten.
 *
 * @param {Object}   metadata   A list of custom metadata fields (by external_id) and the values to assign to each
 * @param {Array}    public_ids The public IDs of the resources to update
 * @param {Function} callback   Callback function
 * @param {Object}   options    Configuration options
 *
 * @return {Object}
 */
exports.update_metadata = function update_metadata(metadata, public_ids, callback, options = {}) {
  return call_api("metadata", callback, options, function () {
    let params = {
      metadata: utils.encode_context(metadata),
      public_ids: utils.build_array(public_ids),
      timestamp: utils.timestamp(),
      type: options.type
    };
    return [params];
  });
};
