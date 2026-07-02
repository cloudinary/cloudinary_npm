const fs = require('fs');
const path = require('path');
const isRemoteUrl = require('./isRemoteUrl');

/**
 * Resolves a file parameter for use as an API request parameter.
 * Remote URLs and data URIs are returned as-is, to be sent as a plain string parameter.
 * Buffers and local file paths are resolved into a {filename, data} pair representing
 * binary content, to be sent as a multipart file part.
 * @param {string|Buffer} file A remote url, a data URI, a local file path or a Buffer
 * @returns {string|{filename: string, data: Buffer}|undefined}
 */
function handleFileParameter(file) {
  if (file == null) {
    return undefined;
  }
  if (Buffer.isBuffer(file)) {
    return { filename: 'file', data: file };
  }
  if (typeof file === 'string' && !isRemoteUrl(file)) {
    return { filename: path.basename(file), data: fs.readFileSync(file) };
  }
  return file;
}

module.exports = handleFileParameter;
