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
  const { message } = error.error || error;
  console.error(`Upload failed: ${message}`);
  process.exitCode = 1;
});
```

`source` may be a file path, a remote URL, a data URI, or a stream
(`cloudinary.uploader.upload_stream` for buffers/streams).

## Result fields to keep

Store `asset_id`. It never changes; `public_id` changes when an asset is renamed or moved.

```js
console.log(result.asset_id);
```

Look assets up with `api.resource_by_asset_id` (or `api.resources_by_asset_ids`,
`api.restore_by_asset_ids`, `api.delete_resources_by_asset_ids` in bulk). Every lookup
returns the `public_id` for delivery URLs and updates.

## Size limits

Two separate limits apply, and they fail the same way:

- **100 MB per request.** A single `upload` call cannot exceed this, whatever your plan.
  Above it, use [`upload_large`](upload-large-video.md) — it splits the file into chunks
  (20 MB by default, set with `chunk_size`) and uploads them sequentially.
- **Your product environment's maximum asset size**, which varies by plan and is
  unrelated to the per-request ceiling. `upload_large` does not raise it.

Read the real values for your environment rather than assuming:

```js
const { media_limits } = await cloudinary.api.usage();
console.log(media_limits.image_max_size_bytes);
console.log(media_limits.video_max_size_bytes);
console.log(media_limits.image_max_px, media_limits.asset_max_total_px);
```

If an asset exceeds the environment maximum, chunking will not help — compress or resize
it before uploading, or upgrade the plan.

## Troubleshooting

- `Must supply api_key` — configuration missing; see [Configure Cloudinary](configure-cloudinary.md).
- `File size too large` — see [Size limits](#size-limits); either the request exceeded
  the 100 MB single-request ceiling, or the asset exceeds your product environment's
  maximum.
- Remote URL fetch failures — the URL must be publicly reachable from Cloudinary.

## Related

- Runnable example: `examples/upload-image.js`
- [Transform and deliver an image](transform-and-deliver-image.md)
- [Upload guide](https://cloudinary.com/documentation/node_image_and_video_upload.md)
