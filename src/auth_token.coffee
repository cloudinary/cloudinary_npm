###*
  * Authorization Token
  * @module auth_token
###
crypto = require('crypto')
config = require('./config')

digest = (message, key) ->
  crypto.createHmac("sha256", new Buffer(key, "hex"))
    .update message
    .digest 'hex'

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
  params = Object.assign {}, config().auth_token, options
  tokenName = params.token_name ? "__cld_token__"

  unless params.expiration?
    if params.duration?
      start = params.start_time ? Math.round(Date.now() / 1000)
      params.expiration = start + params.duration
    else
      throw new Error( "Must provide either expiration or duration")

  tokenParts = []
  tokenParts.push("ip=#{params.ip}") if params.ip?
  tokenParts.push("st=#{params.start_time}") if params.start_time?
  tokenParts.push("exp=#{params.expiration}")
  tokenParts.push("acl=#{params.acl}") if params.acl?
  toSign = (part for part in tokenParts)
  if params.url
    url = encodeURIComponent(params.url).replace(/%../g, (match)-> match.toLowerCase())
    toSign.push "url=#{url}"
  auth = digest(toSign.join("~"), params.key)
  tokenParts.push("hmac=#{auth}")
  "#{tokenName}=#{tokenParts.join('~')}"
