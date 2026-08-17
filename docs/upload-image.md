# Upload an image

## When to use

Server-side upload of a local file, buffer, stream, or remote URL into your Cloudinary
product environment. For uploads started in a browser, see
[Sign a browser upload](sign-browser-upload.md).

## Complete flow

```js
const cloudinary = require('cloudinary').v2; // reads CLOUDINARY_URL

async function main() {
  const result = await cloudinary.uploader.upload(
    'https://res.cloudinary.com/demo/image/upload/sample.jpg', // file path, URL, data URI, or stream
    {
      public_id: 'examples/uploaded-sample', // stable, addressable ID; omit for a random one
      overwrite: true
    }
  );

  console.log(result.public_id);   // 'examples/uploaded-sample'
  console.log(result.secure_url);  // canonical delivery URL of the original
  console.log(result.width, result.height, result.format, result.bytes);
  return result;
}

main().catch((error) => {
  console.error(`Upload failed: ${error.message}`);
  process.exitCode = 1;
});
```

`source` may be a file path, a remote URL, a data URI, or a stream
(`cloudinary.uploader.upload_stream` for buffers/streams).

## Result fields to keep

Store `public_id` (and `asset_id` if you use folders that may move). Everything else —
URLs, dimensions, derived versions — can be regenerated from the `public_id`.

## Common failures

- `Must supply api_key` / 401 — configuration missing; see [Configure Cloudinary](configure-cloudinary.md).
- `File size too large` — use [chunked upload](upload-large-video.md) for assets over ~100 MB.
- Remote URL fetch failures — the URL must be publicly reachable from Cloudinary.

## Related

- Runnable example: `examples/upload-image.js`
- [Transform and deliver media](transform-and-deliver-media.md)
- Hosted reference: https://cloudinary.com/documentation/node_image_and_video_upload
