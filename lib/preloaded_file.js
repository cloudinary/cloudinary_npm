var PRELOADED_CLOUDINARY_PATH; var config; var utils;

utils = require("./utils");

config = require("./config");

PRELOADED_CLOUDINARY_PATH = /^([^/]+)\/([^/]+)\/v(\d+)\/([^#]+)#([^/]+)$/;

class PreloadedFile {
  constructor(file_info) {
    var matches; var public_id_and_format;
    matches = file_info.match(PRELOADED_CLOUDINARY_PATH);
    if (!matches) {
      throw "Invalid preloaded file info";
    }
    [this.resource_type] = matches;
    [this.type] = matches;
    [this.version] = matches;
    [this.filename] = matches;
    [this.signature] = matches;
    public_id_and_format = PreloadedFile.split_format(this.filename);
    [this.public_id] = public_id_and_format;
    [this.format] = public_id_and_format;
  }

  is_valid() {
    var expected_signature;
    expected_signature = utils.api_sign_request({
      public_id: this.public_id,
      version: this.version,
    }, config().api_secret);
    return this.signature === expected_signature;
  }

  static split_format(identifier) {
    var format; var last_dot; var public_id;
    last_dot = identifier.lastIndexOf(".");
    if (last_dot === -1) {
      return [identifier, null];
    }
    public_id = identifier.substr(0, last_dot);
    format = identifier.substr(last_dot + 1);
    return [public_id, format];
  }

  identifier() {
    return `v${this.version}/${this.filename}`;
  }

  toString() {
    return `${this.resource_type}/${this.type}/v${this.version}/${this.filename}#${this.signature}`;
  }

  toJSON() {
    var result = {};
    Object.getOwnPropertyNames(this).forEach((key) => {
      const val = this[key];
      if (typeof val !== 'function') {
        result[key] = val;
      }
    });
    return result;
  }
}

module.exports = PreloadedFile;
