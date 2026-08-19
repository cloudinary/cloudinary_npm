# Upload a large video

## When to use

Any upload over ~100 MB, or any video where you want chunked transfer that tolerates
network interruptions.

## Complete flow

`upload_large` reports its result through a **callback**, not a promise, when uploading a
local file — `await`ing the call directly resolves immediately with a stream object and
your upload result is lost. Wrap it:

```js
const fs = require('fs');
const https = require('https');
const cloudinary = require('cloudinary').v2; // reads CLOUDINARY_URL

const SAMPLE_VIDEO_URL = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';

/** Use the local video if present; otherwise download the demo sample to that path. */
function ensureVideoExists(videoPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(videoPath)) {
      resolve(videoPath);
      return;
    }
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
        resource_type: 'video',        // REQUIRED for videos: upload_large defaults to 'raw'
        chunk_size: 5 * 1024 * 1024,   // 5 MB chunks (the minimum Cloudinary accepts)
        public_id: 'examples/uploaded-large-video',
        overwrite: true
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
  });
}

async function main() {
  const localPath = await ensureVideoExists('./dog.mp4');
  const result = await uploadLargeVideo(localPath);
  console.log(result.public_id, result.duration, result.bytes);
  console.log(result.secure_url); // playback URL
}

main().catch((error) => {
  const { message } = error.error || error;
  console.error(`Video upload failed: ${message}`);
  process.exitCode = 1;
});
```

A remote URL is the exception: `upload_large` delegates to `uploader.upload()` for remote
sources, which *does* return a promise. Use the callback form for both so one code path
handles either input.

## Asynchronous processing

Large or busy videos may finish **processing** after the upload completes. For derived
versions, pass `eager` transformations with `eager_async: true` and a `notification_url`
webhook; the response then includes a pending status until Cloudinary calls your webhook.

## Troubleshooting

- Missing `resource_type: 'video'` — the asset lands as `raw` and cannot be transformed
  or streamed as video. This is the most common mistake with `upload_large`.
- `await cloudinary.uploader.upload_large(...)` returning something that is not the
  upload result — it returned a stream; use the callback wrapper above.
- `All parts except EOF-chunk must be larger than 5mb` — `chunk_size` is below the 5 MB
  minimum.
- Timeouts on slow links — reduce chunk size; each chunk retries independently.

## Related

- Runnable example: `examples/upload-large-video.js` — works with no arguments; it
  downloads a sample video from the Cloudinary demo account if none is supplied.
- [Video upload guide](https://cloudinary.com/documentation/node_image_and_video_upload.md#node_js_video_upload)
