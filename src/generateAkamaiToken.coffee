crypto = require('crypto')
config = require('./config')

digest = (message, key) ->
  crypto.createHmac("sha256", new Buffer(key, "hex"))
    .update message
    .digest 'hex'


module.exports = generateAkamaiToken = (options)->
  key = options.key ? config().akamai_key
  tokenName = options.token_name ? "__cld_token__"
  expiration = options.end_time
  unless expiration?
    if options.window?
      start = options.start_time ? Math.round(Date.now() / 1000)
      expiration = start + options.window
    else
      throw new Error( "Must provide either end_time or window")

  tokenParts = []
  tokenParts.push("ip=#{options.ip}") if options.ip?
  tokenParts.push("st=#{options.start_time}") if options.start_time?
  tokenParts.push("exp=#{expiration}")
  tokenParts.push("acl=#{options.acl}")
  auth = digest(tokenParts.join("~"), key)
  tokenParts.push("hmac=#{auth}")
  "#{tokenName}=#{tokenParts.join('~')}"
