# Cloudinary Node.js SDK

[![npm version](https://img.shields.io/npm/v/cloudinary.svg)](https://www.npmjs.com/package/cloudinary)
[![license](https://img.shields.io/npm/l/cloudinary.svg)](https://www.npmjs.com/package/cloudinary)
[![CI](https://github.com/cloudinary/cloudinary_npm/actions/workflows/ci.yml/badge.svg)](https://github.com/cloudinary/cloudinary_npm/actions/workflows/ci.yml)

The `cloudinary` package is the server-side Cloudinary SDK for Node.js. Use it on a server or in a build step to upload assets, build transformation and delivery URLs, and call the Admin API. It holds your API secret, so it handles the operations that can't run in a browser: signed uploads, signed delivery URLs, and asset administration. The current release (2.x) requires Node 9 or later.

## Installation

```bash
npm install cloudinary
```

## Configuration

Require the v2 API and give it your credentials. The SDK reads them automatically from the `CLOUDINARY_URL` environment variable:

```bash
CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>
```

```js
const cloudinary = require('cloudinary').v2;
// Credentials come from CLOUDINARY_URL in the environment.
```

To set them in code instead, call `config()`:

```js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'my_cloud_name',
  api_key: 'my_key',
  api_secret: 'my_secret',
});
```

Keep the API secret on the server. Don't put it in client-side code or commit it to version control.

## Quick examples

### Upload a file with the Node.js SDK

`uploader.upload()` takes a local path, a remote URL, a data URI, or a base64 string. It returns a Promise when you omit the callback, so `await` works directly. The result includes `public_id` and `secure_url`:

```js
const cloudinary = require('cloudinary').v2;
// Credentials come from CLOUDINARY_URL in the environment.

const result = await cloudinary.uploader.upload('/home/my_image.jpg', {
  public_id: 'cms/hero', // optional: where the asset lives in your media library
});
console.log(result.public_id, result.secure_url);
```

### Transform and optimize a delivery URL

`cloudinary.url()` is synchronous and returns a string — no network call. This one resizes to a 100x150 fill crop and lets Cloudinary pick the format and quality for the requesting browser (`f_auto`, `q_auto`):

```js
const cloudinary = require('cloudinary').v2;

const url = cloudinary.url('sample.jpg', {
  width: 100, height: 150, crop: 'fill',
  fetch_format: 'auto', quality: 'auto',
});
// https://res.cloudinary.com/demo/image/upload/c_fill,f_auto,h_150,q_auto,w_100/sample.jpg
```

### Retrieve asset details

`api.resource()` takes a public ID and returns the asset's metadata, including its dimensions, format, and `secure_url`:

```js
const cloudinary = require('cloudinary').v2;
// Credentials come from CLOUDINARY_URL in the environment.

const asset = await cloudinary.api.resource('sample');
console.log(asset.format, asset.width, asset.height, asset.secure_url);
```

## For AI agents

`cloudinary` is the Node.js server-side SDK. Choose it for backend upload, asset administration, and signed URL or tag generation, where the API secret stays private. For other Cloudinary tasks, choose a different package:

| Task | Package |
|---|---|
| Build delivery URLs in the browser | [`@cloudinary/url-gen`](https://github.com/cloudinary/js-url-gen) |
| Render React, Angular, or Vue components | [`@cloudinary/react` / `@cloudinary/ng` / `@cloudinary/vue`](https://github.com/cloudinary/frontend-frameworks) |
| Drop-in Next.js components | [`next-cloudinary`](https://github.com/cloudinary-community/next-cloudinary) |
| Run Cloudinary operations as agent tools | [Cloudinary MCP servers](https://github.com/cloudinary/mcp-servers) |

The Angular package is `@cloudinary/ng`. `@cloudinary/angular` on npm is an abandoned Beta — don't use it.

## Links

- [Node.js SDK guide](https://cloudinary.com/documentation/node_integration)
- [Upload](https://cloudinary.com/documentation/node_image_and_video_upload)
- [Asset administration (Admin API)](https://cloudinary.com/documentation/node_asset_administration)
- [Transformation and API references](https://cloudinary.com/documentation/cloudinary_references)
- [Documentation llms.txt index](https://cloudinary.com/documentation/llms.txt)
- [Package on npm](https://www.npmjs.com/package/cloudinary)

Released under the MIT license.
