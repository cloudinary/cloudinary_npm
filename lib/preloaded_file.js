let PRELOADED_CLOUDINARY_PATH, config, utils;

utils = require("./utils");

config = require("./config");

PRELOADED_CLOUDINARY_PATH = /^([^\/]+)\/([^\/]+)\/v(\d+)\/([^#]+)#([^\/]+)$/;

class PreloadedFile {
  constructor(file_info) {
    let matches, public_id_and_format;
    matches = file_info.match(PRELOADED_CLOUDINARY_PATH);
    if (!matches) {
      throw "Invalid preloaded file info";
    }
    this.resource_type = matches[1];
    this.type = matches[2];
    this.version = matches[3];
    this.filename = matches[4];
    this.signature = matches[5];
    public_id_and_format = PreloadedFile.split_format(this.filename);
    this.public_id = public_id_and_format[0];
    this.format = public_id_and_format[1];
  }

  is_valid() {
    return utils.verify_api_response_signature(this.public_id, this.version, this.signature);
  }

  static split_format(identifier) {
    let format, last_dot, public_id;
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
    let result = {};
    Object.getOwnPropertyNames(this).forEach((key) => {
      let val = this[key];
      if (typeof val !== 'function') {
        result[key] = val;
      }
    });
    return result;
  }
}

module.exports = PreloadedFile;
