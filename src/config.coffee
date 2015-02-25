_ = require("lodash")
cloudinary_config = undefined
module.exports = (new_config, new_value) ->
  if !cloudinary_config? || new_config == true
    cloudinary_url = process.env.CLOUDINARY_URL
    if cloudinary_url?
      uri = require('url').parse(cloudinary_url, true)
      cloudinary_config =
        cloud_name: uri.host,
        api_key: uri.auth and uri.auth.split(":")[0],
        api_secret: uri.auth and uri.auth.split(":")[1],
        private_cdn: uri.pathname?,
        secure_distribution: uri.pathname and uri.pathname.substring(1)
      if uri.query?        
        for k, v of uri.query
          cloudinary_config[k] = v
    else
      cloudinary_config = {}
  if not _.isUndefined(new_value)
    cloudinary_config[new_config] = new_value
  else if _.isString(new_config)
    return cloudinary_config[new_config]
  else if _.isObject(new_config)
    _.extend(cloudinary_config, new_config)
  cloudinary_config
