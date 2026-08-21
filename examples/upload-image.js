/**
 * Upload an image and print its public ID and an optimized delivery URL.
 *
 * Prerequisites: set CLOUDINARY_URL in your environment (Console > Settings > API Keys).
 * In your own project, import the published package instead:
 *   const cloudinary = require('cloudinary').v2;
 */
const cloudinary = require('../cloudinary').v2;

async function main(imageSource = 'https://res.cloudinary.com/demo/image/upload/sample.jpg') {
  const result = await cloudinary.uploader.upload(imageSource, {
    // A stable public_id makes the asset addressable; omit it to get a random one.
    public_id: 'examples/uploaded-sample',
    overwrite: true
  });

  const optimizedUrl = cloudinary.url(result.public_id, {
    fetch_format: 'auto',
    quality: 'auto',
    secure: true
  });

  console.log(`Stored reference: ${result.asset_id}`);
  console.log(`Uploaded: ${result.public_id} (${result.bytes} bytes, ${result.width}x${result.height})`);
  console.log(`Optimized delivery URL: ${optimizedUrl}`);
  return result;
}

if (require.main === module) {
  main().catch((error) => {
    const { message } = error.error || error;
    console.error(`Upload failed: ${message}`);
    console.error('Check that CLOUDINARY_URL is set and the source file or URL is reachable.');
    process.exitCode = 1;
  });
}

module.exports = { main };
