/**
 * Sign an upload on your server.
 *
 * Your api_secret stays on the server. The server creates a short-lived
 * signature; the browser sends it (with the same parameters, your api_key, and the
 * timestamp) directly to the Cloudinary upload endpoint.
 *
 * Prerequisites: set CLOUDINARY_URL. In your own project:
 *   const cloudinary = require('cloudinary').v2;
 */
const cloudinary = require('../cloudinary').v2;

/**
 * Build the response body for a signing endpoint (for example an Express route).
 * Only sign parameters you are willing to let the client use.
 */
function main(paramsToSign = {}) {
  const { api_key: apiKey, api_secret: apiSecret, cloud_name: cloudName } = cloudinary.config();
  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_URL in the server environment.');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: 'user-uploads', // constrain what the client can do
    ...paramsToSign
  };

  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  return {
    signature,
    timestamp,
    folder: params.folder,
    api_key: apiKey,
    cloud_name: cloudName,
    upload_url: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
  };
}

if (require.main === module) {
  try {
    const body = main();
    console.log('Send these fields to the browser (the api_secret stays on the server):');
    console.log(JSON.stringify(body, null, 2));
  } catch (error) {
    const { message } = error.error || error;
    console.error(`Signing failed: ${message}`);
    process.exitCode = 1;
  }
}

module.exports = { main };
