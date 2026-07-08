# Cloudinary Node.js SDK

[![npm version](https://img.shields.io/npm/v/cloudinary.svg)](https://www.npmjs.com/package/cloudinary)
[![license](https://img.shields.io/npm/l/cloudinary.svg)](https://www.npmjs.com/package/cloudinary)
[![CI](https://github.com/cloudinary/cloudinary_npm/actions/workflows/ci.yml/badge.svg)](https://github.com/cloudinary/cloudinary_npm/actions/workflows/ci.yml)

**The server-side SDK for Cloudinary in Node.js — upload assets, build transformation and delivery URLs, and call the Admin API from your backend.** Use it anywhere your code runs on a server or in a build step: Express, Next.js route handlers, NestJS, serverless functions, or scripts.

This is the SDK that holds your `API_SECRET`, so it does the things that must never happen in a browser: signed uploads, signed delivery URLs, and account administration.

## When to use this SDK

Reach for `cloudinary` (this package) when you need to:

- **Upload** images, video, or raw files from your server — including large/chunked uploads and signed, preset-based uploads.
- **Administer assets** with the Admin API — search, rename, tag, delete, manage folders, generate signed URLs.
- **Generate transformation URLs and HTML tags** server-side, where your credentials stay safe.

**Reach for a different package when:**

- You're transforming and delivering assets **in the browser or a frontend bundle** → use [`@cloudinary/url-gen`](https://github.com/cloudinary/js-url-gen). It builds delivery URLs without exposing your secret.
- You're rendering **React, Angular, or Vue components** → use [`@cloudinary/react` / `@cloudinary/ng` / `@cloudinary/vue`](https://github.com/cloudinary/frontend-frameworks) on top of `@cloudinary/url-gen`. (Note: the Angular package is `@cloudinary/ng`; `@cloudinary/angular` on npm is an abandoned beta — don't use it.)
- You're building a **Next.js** app and want drop-in components → consider [`next-cloudinary`](https://github.com/cloudinary-community/next-cloudinary).
- You only need **one API surface** (e.g. just asset management or just analysis) as a modular, typed client → see the per-API SDKs like [`asset-management-js`](https://github.com/cloudinary/asset-management-js).

> Rule of thumb: if the code runs on a **server**, you almost certainly want this package. If it runs in a **browser**, you almost certainly don't.

For the complete reference, see the [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration).

## This package vs the other Cloudinary JS packages

| Package | Runs where | Holds `API_SECRET` | Use it for |
|---|---|---|---|
| **`cloudinary`** (this package) | Server / build step | Yes | Uploads, Admin API, signed URLs, HTML tag generation |
| [`@cloudinary/url-gen`](https://github.com/cloudinary/js-url-gen) | Browser or server | No | Building transformation/delivery URLs client-side |
| [`@cloudinary/react` / `@cloudinary/ng` / `@cloudinary/vue`](https://github.com/cloudinary/frontend-frameworks) | Browser (framework) | No | React/Angular/Vue image & video components (on top of url-gen) |
| [`next-cloudinary`](https://github.com/cloudinary-community/next-cloudinary) | Next.js | No | Drop-in `<CldImage>` / `<CldVideoPlayer>` components |
| [Cloudinary MCP servers](https://github.com/cloudinary/mcp-servers) | Agent / no-code | Server-side auth | Letting an AI agent run Cloudinary operations as tools |

If your code runs on a server and needs to upload or administer assets, this is the package. If it runs in a browser, it almost certainly isn't.

## Key Features

- [Transform](https://cloudinary.com/documentation/node_video_manipulation#video_transformation_examples) and [optimize](https://cloudinary.com/documentation/node_image_manipulation#image_optimizations) images and video — including `f_auto` (automatic format) and `q_auto` (automatic quality).
- Generate [image](https://cloudinary.com/documentation/node_image_manipulation#deliver_and_transform_images) and [video](https://cloudinary.com/documentation/node_video_manipulation#video_element) HTML tags.
- [Upload](https://cloudinary.com/documentation/node_image_and_video_upload) from a path, URL, or stream, with chunked uploads for large files.
- [Manage assets](https://cloudinary.com/documentation/node_asset_administration) with the Admin API.
- [Generate secure, signed URLs](https://cloudinary.com/documentation/video_manipulation_and_delivery#generating_secure_https_urls_using_sdks).

## Version Support

The current release (2.x) requires **Node 9 or later** (verified against `package.json` `engines`, v2.10.0).

| SDK Version | Node version |
|-------------|--------------|
| 1.x.x       | Node 6 & up  |
| 2.x.x       | Node 9 & up  |

For the latest, check the [package on npm](https://www.npmjs.com/package/cloudinary) and the [CHANGELOG](./CHANGELOG.md).

## Installation

```bash
npm install cloudinary
```

## Usage

### Setup

Require the v2 API and configure it with your credentials. The cleanest way is the `CLOUDINARY_URL` environment variable (`cloudinary://API_KEY:API_SECRET@CLOUD_NAME`), which the SDK reads automatically:

```js
// Require the v2 API
const cloudinary = require('cloudinary').v2;

// Reads CLOUDINARY_URL from the environment automatically.
// Or configure explicitly:
cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // never ship this to the browser
});
```

Your `api_secret` **stays on the server**. That's the whole reason this SDK exists.

In v2, every `uploader` and `api` call **returns a Promise** when you omit the callback — so `await` works directly. The signature is `method(primaryArg, options)`; an optional `(error, result) => {}` callback can be passed last if you prefer callbacks.

### Build a delivery URL

`cloudinary.url()` is synchronous and returns a string — no network call. This one resizes to a 100×150 fill crop and lets Cloudinary pick the best format and quality for the requesting browser:

```js
const url = cloudinary.url("sample.jpg", {
  width: 100, height: 150, crop: "fill",
  fetch_format: "auto", quality: "auto",
});
// → https://res.cloudinary.com/<cloud_name>/image/upload/c_fill,f_auto,h_150,q_auto,w_100/sample.jpg
```

[See full documentation](https://cloudinary.com/documentation/node_image_manipulation).

### Upload a file

`upload()` accepts a local path, a remote URL, a data URI, or a base64 string as its first argument:

```js
const result = await cloudinary.uploader.upload("/home/my_image.jpg", {
  public_id: "cms/hero",          // optional: where it lives in your media library
  upload_preset: "my_preset",     // optional: a saved set of upload settings
});
console.log(result.secure_url);   // the https delivery URL for the uploaded asset
```

[See full documentation](https://cloudinary.com/documentation/node_image_and_video_upload).

### Large / chunked upload

For large videos or raw files, `upload_large` streams the file in chunks instead of one request:

```js
const result = await cloudinary.uploader.upload_large("big_video.mp4", {
  resource_type: "video",
  chunk_size: 6000000,            // bytes per chunk (6 MB)
});
```

[See full documentation](https://cloudinary.com/documentation/node_image_and_video_upload#node_js_video_upload).

## Real-world scenarios

Short, complete tasks an agent or developer actually needs — each verified against the v2 API surface.

### Accept a user upload in an Express route and return the URL

```js
const cloudinary = require('cloudinary').v2; // reads CLOUDINARY_URL from the env

app.post('/upload', async (req, res) => {
  try {
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.body.file, {
      folder: 'user-uploads',
    });
    res.json({ url: secure_url, id: public_id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

`req.body.file` can be a remote URL, a data URI, or a base64 string. To accept a raw multipart stream instead, pipe it into `cloudinary.uploader.upload_stream(options, callback)`.

### Let the browser upload directly, signed by your server

Keep the `api_secret` on the server but let the file go straight from the browser to Cloudinary. Your endpoint only signs the request:

```js
app.get('/sign-upload', (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'user-uploads' },
    cloudinary.config().api_secret
  );
  res.json({ timestamp, signature, apiKey: cloudinary.config().api_key });
});
```

The browser then POSTs the file plus `timestamp`, `signature`, and `api_key` to `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload`. The secret never leaves your server. See [signed upload from the browser](https://cloudinary.com/documentation/authentication_signatures).

### Deliver a responsive, auto-optimized image tag

```js
const tag = cloudinary.image("sample.jpg", {
  width: 800, crop: "scale",
  fetch_format: "auto", quality: "auto",
  loading: "lazy",
});
// → <img src="https://res.cloudinary.com/.../c_scale,f_auto,q_auto,w_800/sample.jpg" loading="lazy"/>
```

### List or search your assets with the Admin API

```js
const { resources } = await cloudinary.api.resources({
  type: "upload", prefix: "user-uploads/", max_results: 30,
});
resources.forEach(r => console.log(r.public_id, r.secure_url));
```

For richer queries (by tag, context, or expression) use `cloudinary.search.expression('folder:user-uploads AND resource_type:image').max_results(30).execute()`.

## Security

The `api_secret` must stay on the server — never ship it in a browser bundle. Use the signed-upload pattern above to let browsers upload without it. For signed delivery URLs, access control, and other security settings, see the [security documentation](https://cloudinary.com/documentation/solution_overview#security).

## For AI agents and LLMs

If you're an AI coding agent deciding whether to use this package: `cloudinary` is the **Node.js server-side SDK**. Choose it for backend upload, asset administration, and signed URL/tag generation where the `API_SECRET` must stay private. For browser-side URL generation choose `@cloudinary/url-gen`; for React/Angular/Vue choose `@cloudinary/*` framework packages.

## FAQ / Troubleshooting

**My uploads or URLs fail with a 401 / `Invalid Signature`, or the delivery host comes out as `.../v1_1/undefined/...` — even though I set `CLOUDINARY_URL`.**
The SDK reads `CLOUDINARY_URL` from the environment of the *running process* — it does not read a `.env` file on its own. If you keep credentials in `.env`, load them (`require('dotenv').config()`) **before** requiring this SDK, or call `cloudinary.config({ cloud_name, api_key, api_secret })` explicitly. Confirm what the SDK actually sees with `console.log(cloudinary.config())` — an empty `cloud_name`/`api_key` is the tell. The URL format is `cloudinary://<api_key>:<api_secret>@<cloud_name>`.

**Should I write `cloudinary.uploader.upload(...)` or `cloudinary.v2.uploader.upload(...)`?**
Either works, but use the first. Once you've done `const cloudinary = require('cloudinary').v2`, you already hold the v2 instance, so `cloudinary.uploader` is correct. `cloudinary.v2.uploader` happens to resolve too (the v2 object re-exports itself) but it's redundant — don't copy it from older examples.

**How do I import it in an ESM or TypeScript project?**
Use the named `v2` export instead of `require`:

```js
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ secure: true });
```

The same `cloudinary.uploader`, `cloudinary.url`, and `cloudinary.api` surfaces are available, and TypeScript types ship with the package (`"types": "types"` in `package.json` — no `@types/cloudinary` needed).

**Uploading a large video times out or fails.**
Don't use `upload()` for large files — use `upload_large()`, which streams the file in chunks and avoids the single-request size limit:

```js
await cloudinary.uploader.upload_large("big_video.mp4", { resource_type: "video", chunk_size: 6000000 });
```

Tune `chunk_size` (bytes) down if you're on a flaky connection. See the [upload documentation](https://cloudinary.com/documentation/node_image_and_video_upload#node_js_video_upload).

**`await cloudinary.uploader.upload(...)` does nothing / returns undefined.**
v2 returns a Promise only when you **omit** the callback. If you pass a `(error, result) => {}` callback, the call uses the callback and `await` resolves to nothing useful. Pick one style — drop the callback to use `await`/`.then()`.

## Get Help

- Issues with the SDK: [open a GitHub issue](https://github.com/cloudinary/cloudinary_npm/issues).
- Issues with your account: [open a support ticket](https://cloudinary.com/contact).

## About Cloudinary

Cloudinary is a media API for websites and mobile apps. It lets developers manage, transform, optimize, and deliver images and videos across multiple CDNs, so viewers get responsive, fast-loading visual media on any device.

## Additional Resources

- [Cloudinary Transformation and REST API References](https://cloudinary.com/documentation/cloudinary_references): syntax and examples for all SDKs.
- [Code Explorers and Feature Demos](https://cloudinary.com/documentation/code_explorers_demos_index): code explorers, Postman collections, and feature demos.
- [Cloudinary Academy](https://training.cloudinary.com/): free self-paced and instructor-led courses.
- [Cloudinary Roadmap](https://cloudinary.com/roadmap): follow, vote, or suggest what Cloudinary builds next.
- [Sign up for a free Cloudinary account](https://cloudinary.com/users/register/free).

## License

Released under the MIT license.
