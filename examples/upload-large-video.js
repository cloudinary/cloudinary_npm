/**
 * Upload a large video in chunks and print the resulting playback URL.
 *
 * upload_large streams the file in chunks, which survives network hiccups better
 * than a single request. Two things differ from uploader.upload():
 *   1. resource_type defaults to "raw", so videos must set resource_type: "video"
 *      explicitly to get video features (streaming, transformations, duration).
 *   2. For local files it returns a stream and reports the result through a
 *      CALLBACK - it does not return a promise, so `await` on it resolves immediately
 *      with a stream instead of the upload result. Wrap it as below to await it.
 *
 * Prerequisites: set CLOUDINARY_URL. In your own project:
 *   const cloudinary = require('cloudinary').v2;
 *
 * Run with your own file (node upload-large-video.js my-video.mp4) or with no
 * arguments - a sample video is downloaded from the Cloudinary demo account.
 */
const fs = require('fs');
const https = require('https');
const cloudinary = require('../cloudinary').v2;

const SAMPLE_VIDEO_URL = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';

/** Use the local video if present; otherwise download the demo sample to that path. */
function ensureVideoExists(videoPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(videoPath)) {
      resolve(videoPath);
      return;
    }
    console.log(`No file at ${videoPath}; downloading a sample video from ${SAMPLE_VIDEO_URL} ...`);
    https.get(SAMPLE_VIDEO_URL, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Sample video download failed: HTTP ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(videoPath);
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve(videoPath)));
      file.on('error', reject);
    }).on('error', reject);
  });
}

function uploadLargeVideo(videoPath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      videoPath,
      {
        resource_type: 'video', // required: upload_large defaults to 'raw'
        chunk_size: 5 * 1024 * 1024, // 5 MB chunks (the minimum Cloudinary accepts)
        public_id: 'examples/uploaded-large-video',
        overwrite: true
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
  });
}

async function main(videoPath) {
  if (videoPath && !fs.existsSync(videoPath)) {
    throw new Error(`No such file: ${videoPath}`);
  }
  const localPath = videoPath || await ensureVideoExists('./dog.mp4');
  const result = await uploadLargeVideo(localPath);

  console.log(`Stored reference: ${result.asset_id}`);
  console.log(`Uploaded video: ${result.public_id} (${result.bytes} bytes, ${result.duration}s)`);
  console.log(`Playback URL: ${result.secure_url}`);
  return result;
}

if (require.main === module) {
  main(process.argv[2]).catch((error) => {
    const { message } = error.error || error;
    console.error(`Video upload failed: ${message}`);
    console.error('Check that CLOUDINARY_URL is set. Large or busy videos may finish processing asynchronously; pass eager_async: true and a notification_url for server-side processing callbacks.');
    process.exitCode = 1;
  });
}

module.exports = { main, uploadLargeVideo, ensureVideoExists };
