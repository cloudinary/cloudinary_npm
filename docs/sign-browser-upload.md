# Sign a browser upload

## When to use

A browser or mobile app uploads directly to Cloudinary, but you want the operation
authorized by your server. The `api_secret` stays on the server; the client receives a
signature that is valid for **1 hour** from the `timestamp` it was signed with.

For uploads without a server round-trip, use an
[unsigned upload preset](https://cloudinary.com/documentation/upload_presets.md) instead —
deliberately restricted, because anyone can use it.

## Server: signing endpoint

```js
const cloudinary = require('cloudinary').v2; // reads CLOUDINARY_URL

// Example Express route
app.get('/api/sign-upload', (req, res) => {
  const { api_key, api_secret, cloud_name } = cloudinary.config();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: 'user-uploads' }; // sign ONLY what the client may use

  const signature = cloudinary.utils.api_sign_request(params, api_secret);
  res.json({ signature, timestamp, folder: params.folder, api_key, cloud_name });
});
```

## Browser: use the signature

```js
const { signature, timestamp, folder, api_key, cloud_name } = await (await fetch('/api/sign-upload')).json();

const form = new FormData();
form.append('file', fileInput.files[0]);
form.append('api_key', api_key);
form.append('timestamp', timestamp);
form.append('signature', signature);
form.append('folder', folder); // send back exactly what the server signed

// 'auto' detects image / video / raw from the file itself
const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, {
  method: 'POST',
  body: form
});
const asset = await response.json(); // contains public_id, secure_url, ...
```

## Rules

- Every parameter the browser sends (except `file`, `api_key`, `signature`, and
  `resource_type`) must be included in the signed parameter set, or Cloudinary rejects
  the request with `Invalid Signature`. To let the client set a tag, `public_id`, or
  transformation, add it to the signed params on the server first.
- Signatures embed the timestamp and are accepted for 1 hour after it. Generate one per
  upload rather than caching and reusing them.
- Keep the `api_secret` in server code only; the client receives just the signature,
  timestamp, `api_key`, and `cloud_name`.

## Troubleshooting

- `Invalid Signature` — the client sent a parameter that was not signed, or sent values
  differing from the signed ones.
- `Stale request` — the signature is more than 1 hour old. Fetch a fresh one at upload
  time instead of signing on page load; also check that your server clock is accurate,
  since a skewed clock produces timestamps that are stale on arrival.

## Related

- Runnable example: `examples/sign-browser-upload.js`
- [Generating authentication signatures](https://cloudinary.com/documentation/upload_images.md#generating_authentication_signatures)
