
const Transform = require("stream").Transform;

class UploadStream extends Transform {
  constructor(options) {
    super();
    this.boundary = options.boundary;
  }

  _transform(data, encoding, next) {
    let buffer = ((Buffer.isBuffer(data)) ? data : new Buffer(data, encoding));
    this.push(buffer);
    next();
  }

  _flush(next) {
    this.push(new Buffer("\r\n", 'ascii'));
    this.push(new Buffer("--" + this.boundary + "--", 'ascii'));
    return next();
  }
}

module.exports = UploadStream;
