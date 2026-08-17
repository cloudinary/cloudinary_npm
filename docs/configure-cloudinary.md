# Configure Cloudinary

## When to use

Do this once per process before any upload, admin, analysis, or URL-generation call.

## Recommended: environment variable

Set `CLOUDINARY_URL` (from Console > Settings > API Keys):

```bash
export CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

```js
const cloudinary = require('cloudinary').v2;
// Configuration is read from CLOUDINARY_URL automatically on first use.
console.log(cloudinary.config().cloud_name);
```

## Alternative: explicit configuration

```js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'my-cloud',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
```

## Behavior you should know

- Configuration is **process-global**: `cloudinary.config()` affects every caller in the
  process. Pass per-call options as the last argument of a method when you need to
  override (for example a different `cloud_name` for one call).
- Always import the v2 API once: `const cloudinary = require('cloudinary').v2;` and then
  call `cloudinary.uploader...` directly — the imported object already is the v2 API.
- Proxy support: set `api_proxy` in config or the `HTTPS_PROXY` environment variable.
- Account-level (provisioning) operations use `CLOUDINARY_ACCOUNT_URL` instead.

## Validate configuration early

```js
const { cloud_name, api_key, api_secret } = cloudinary.config();
if (!cloud_name || !api_key || !api_secret) {
  throw new Error('Cloudinary is not configured: set CLOUDINARY_URL.');
}
```

## Common failures

- `Must supply cloud_name` — `CLOUDINARY_URL` is missing or malformed; it must start with `cloudinary://`.
- `401 Unauthorized` — key/secret mismatch for the cloud name; re-copy from the console.

## Related

- [Sign a browser upload](sign-browser-upload.md) — keeping the secret server-side.
- Hosted reference: https://cloudinary.com/documentation/node_integration
