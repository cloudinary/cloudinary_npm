uploader = require('../uploader')
utils = require('../utils')

utils.v1_adapters exports, uploader, 
  unsigned_upload_stream: 1,
  upload_stream: 0,
  unsigned_upload: 2,
  upload: 1,
  upload_large_part: 0,
  upload_large: 1,
  explicit: 1,
  destroy: 1,
  rename: 2,
  text: 1,
  generate_sprite: 1,
  multi: 1,
  explode: 1,
  add_tag: 2,
  remove_tag: 2,
  replace_tag: 2

exports.direct_upload = uploader.direct_upload
exports.upload_tag_params = uploader.upload_tag_params
exports.upload_url = uploader.upload_url
exports.image_upload_tag = uploader.image_upload_tag
exports.unsigned_image_upload_tag = uploader.unsigned_image_upload_tag
