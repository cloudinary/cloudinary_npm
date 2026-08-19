# Troubleshoot errors

## How this SDK reports errors

Promise rejections and callback errors carry `message` and `http_code`. In debug mode,
errors from API calls also include the Cloudinary request ID — include it in support
tickets:

```js
const cloudinary = require('cloudinary').v2;
cloudinary.config({ debug: true }); // adds request IDs to errors and logs
```

## Errors by symptom

### `Must supply cloud_name` / `Must supply api_key`
Configuration never loaded. Set `CLOUDINARY_URL` before the first call, or call
`cloudinary.config({...})` explicitly. See [Configure Cloudinary](configure-cloudinary.md).

### `401 Unauthorized`
Key/secret pair does not match the cloud name. Re-copy from Console > Settings > API
Keys. If you use multiple environments, check which one your process actually loaded.

### `Invalid Signature`
A signed request included parameters that were not part of the signature, or values
changed after signing. Sign every parameter the client sends. See
[Sign a browser upload](sign-browser-upload.md).

### `420 Rate limit exceeded` (Admin/Search API)
You are calling management APIs in a request path. Batch the work, cache results, and
respect the reset time in the response headers. Delivery URLs are never rate-limited
this way.

### `File size too large`
Switch to [chunked upload](upload-large-video.md) (`upload_large`).

### `423 Processing`
The asset is still being processed and is not yet available for the operation you
requested — common right after uploading a large video, or while an eager or
add-on-driven transformation is still running. This is transient: retry with backoff
rather than treating it as a failure. For long jobs, prefer `eager_async` with a
`notification_url` over polling.

### Delivery URL returns `400` or `404`
The reason is in the `X-Cld-Error` response header of the failing URL (lowercase
`x-cld-error` over HTTP/2):

```bash
curl -sI "https://res.cloudinary.com/<cloud_name>/image/upload/w_abc/sample.jpg" | grep -i '^x-cld-error'
# x-cld-error: Invalid width in transformation: abc
```

Typical values: `Resource not found - <public_id>` (wrong public ID, folder, or
resource type in the URL path), `Invalid <param> in transformation: <value>`, and
`Unknown transformation <name>` (the named transformation is missing on this
environment). The header is CORS-exposed, so browser code can read it from a failed
image fetch as well.

### Upload succeeded but video will not transform or stream
The asset was uploaded as `raw` — `upload_large` defaults to `resource_type: 'raw'`.
Re-upload with `resource_type: 'video'`.

### `403` / entitlement errors
The feature or add-on (for example the Analyze API or Visual Search) requires a
subscription or account enablement. Check the add-ons page in the console; these are
account capabilities, not SDK flags.

### Timeouts
Pass `timeout` (milliseconds) in the call options. For uploads on unstable links, use
chunked upload; chunks retry independently.

### Stale delivery after re-upload
CDN-cached URLs do not update instantly. Deliver with the new `version` from the upload
response, which changes the URL immediately. See
[Transform and deliver media](transform-and-deliver-media.md).

## Still stuck

- Platform status: https://status.cloudinary.com — check this first. A widespread
  incident explains failures that look like a bug in your code.
- SDK bugs: https://github.com/cloudinary/cloudinary_npm/issues
- Account issues: https://support.cloudinary.com (include the request ID from debug mode)
