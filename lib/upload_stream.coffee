stream = require("stream")
util = require("util")

UploadStream= (options)-> 
  @boundary = options.boundary
  stream.Transform.call this, options
  return

util.inherits UploadStream, stream.Transform


UploadStream::_transform= (data, encoding, next) -> 
  buffer = (if (Buffer.isBuffer(data)) then data else new Buffer(data, encoding))
  this.push(buffer)
  next()
  return

UploadStream::_flush= (next) -> 
  this.push(new Buffer("\r\n", 'ascii'))
  this.push(new Buffer("--" + @boundary + "--", 'ascii'))
  next()

module.exports = UploadStream
