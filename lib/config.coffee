_ = require("underscore")
cloudinary_config = undefined
module.exports = (new_config, new_value) ->
  if !cloudinary_config? || new_config == true
    cloudinary_url = process.env.CLOUDINARY_URL
    if cloudinary_url?
      uri = require('url').parse(cloudinary_url)
      cloudinary_config =
        cloud_name: uri.host,
        api_key: uri.auth and uri.auth.split(":")[0],
        api_secret: uri.auth and uri.auth.split(":")[1],
        private_cdn: uri.path?,
        secure_distribution: uri.path and uri.path.substring(1)
    else
      cloudinary_config = {}
  if not _.isUndefined(new_value)
    cloudinary_config[new_config] = new_value
  else if _.isString(new_config)
    return cloudinary_config[new_config]
  else if _.isObject(new_config)
    cloudinary_config = new_config
  cloudinary_config
