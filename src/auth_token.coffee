###*
  * Authorization Token
  * @module auth_token
###
crypto = require('crypto')
config = require('./config')

digest = (message, key) ->
  crypto.createHmac("sha256", new Buffer(key, "hex")).update( message).digest('hex')

###*
  * Escape url using lowercase hex code
  * @param {string} url a url string
  * @return escaped url
###
escape_to_lower = (url) ->
  encodeURIComponent(url).replace(/%../g, (match)-> match.toLowerCase())

###*
  * Generate an authorization token
  * @param {Object} options
  * @param {string} options.key - the secret key required to sign the token
  * @param {string} [options.ip] - the IP address of the client
  * @param {number} [options.start_time=now] - the start time of the token in seconds from epoch
  * @param {string} [options.expiration] - the expiration time of the token in seconds from epoch
  * @param {string} [options.duration] - the duration of the token (from start_time)
  * @param {string} [options.acl] - the ACL for the token
  * @param {string} [options.url] - the URL to authentication in case of a URL token
  * @returns {string} the authorization token
###
module.exports = (options)->
  tokenName = options.token_name ? "__cld_token__"

  unless options.expiration?
    if options.duration?
      start = options.start_time ? Math.round(Date.now() / 1000)
      options.expiration = start + options.duration
    else
      throw new Error( "Must provide either expiration or duration")

  tokenParts = []
  tokenParts.push("ip=#{options.ip}") if options.ip?
  tokenParts.push("st=#{options.start_time}") if options.start_time?
  tokenParts.push("exp=#{options.expiration}")
  tokenParts.push("acl=#{escape_to_lower(options.acl)}") if options.acl?
  toSign = (part for part in tokenParts)
  if options.url
    url = escape_to_lower(options.url)
    toSign.push "url=#{url}"
  auth = digest(toSign.join("~"), options.key)
  tokenParts.push("hmac=#{auth}")
  "#{tokenName}=#{tokenParts.join('~')}"
