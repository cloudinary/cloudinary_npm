v1 = require('../../cloudinary.js')
_ = require('underscore')
v2 = _.clone(v1)
v2.api = require('./api')
v2.uploader = require('./uploader')
module.exports = v2
