const { base64Encode } = require('./base64Encode')

function base64EncodeURL(sourceUrl) {
  try {
    sourceUrl = decodeURI(sourceUrl);
  } catch (error) {
    // ignore errors
  }
  sourceUrl = encodeURI(sourceUrl);
  return base64Encode(sourceUrl);
}


module.exports.base64EncodeURL = base64EncodeURL;
