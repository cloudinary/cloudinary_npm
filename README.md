# Cloudinary Node.js SDK

Upload, transform, optimize, and manage images and videos with Cloudinary from Node.js — the `cloudinary` package on npm.

[![CI](https://github.com/cloudinary/cloudinary_npm/actions/workflows/ci.yml/badge.svg)](https://github.com/cloudinary/cloudinary_npm/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/cloudinary.svg)](https://www.npmjs.com/package/cloudinary)
[![License](https://img.shields.io/npm/l/cloudinary.svg)](LICENSE)

## Install

```bash
npm install cloudinary
```

## Quick start

Set your API environment variable (Console > Settings > API Keys):

```bash
export CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

Upload an image and get an optimized delivery URL:

```js
const cloudinary = require('cloudinary').v2;

async function main() {
  // Upload a remote image (a local file path works the same way)
  const result = await cloudinary.uploader.upload(
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    { public_id: 'quickstart-sample' }
  );
  console.log(`Uploaded: ${result.public_id}`);

  // Build a 400x400 auto-cropped URL with automatic format and quality
  const url = cloudinary.url(result.public_id, {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
    fetch_format: 'auto',
    quality: 'auto',
    secure: true
  });
  console.log(`Optimized URL: ${url}`);
}

main().catch((error) => {
  console.error(`Quick start failed: ${error.message}`);
  console.error('Check that CLOUDINARY_URL is set (Console > Settings > API Keys).');
  process.exitCode = 1;
});
```

Save as `quickstart.js` and run `node quickstart.js`. [Create a free account](https://cloudinary.com/users/register_free) if you don't have one — or run `npx @cloudinary/cloud` to [provision one without signing up](docs/get-credentials.md).

## Common tasks

- [Get Cloudinary credentials](docs/get-credentials.md)
- [Upload an image](docs/upload-image.md)
- [Upload a large video](docs/upload-large-video.md)
- [Sign a browser upload](docs/sign-browser-upload.md)
- [Transform and deliver media](docs/transform-and-deliver-media.md)
- [Search and manage assets](docs/search-and-manage-assets.md)
- [Moderate an upload](docs/moderate-upload.md)
- [Use structured metadata](docs/use-structured-metadata.md)
- [Troubleshoot errors](docs/troubleshoot-errors.md)

Runnable versions live in [`examples/`](examples/) — each is a complete file you can run directly.

## When to use this SDK

Use this package in **Node.js server-side code**: uploads, signed operations, asset
administration, search, moderation, and delivery URL generation.

For other jobs, better-fitting tools exist:

- Browser or frontend framework rendering: [@cloudinary/url-gen](https://www.npmjs.com/package/@cloudinary/url-gen) and the [frontend SDKs](https://cloudinary.com/documentation/frontend_sdks) ([md](https://cloudinary.com/documentation/frontend_sdks.md)).
- Complete in-browser upload UI: [Upload Widget](https://cloudinary.com/documentation/upload_widget) ([md](https://cloudinary.com/documentation/upload_widget.md)).
- Text-to-image generation and image-to-video: [platform APIs](https://cloudinary.com/documentation/image_generation_addon) ([md](https://cloudinary.com/documentation/image_generation_addon.md)), not wrapped by this package.
- Multi-step media workflow automation: [MediaFlows](https://cloudinary.com/documentation/mediaflows_user_guide) ([md](https://cloudinary.com/documentation/mediaflows_user_guide.md)).
- Interactive agent-driven asset operations: [Cloudinary MCP servers and Skills](https://cloudinary.com/documentation/cloudinary_llm_mcp) ([md](https://cloudinary.com/documentation/cloudinary_llm_mcp.md)).

The full capability map — plus the Skills, MCP servers, and CLI worth setting up first —
is in [docs/platform-capabilities.md](docs/platform-capabilities.md).

## Status and compatibility

Stable, actively maintained. See [CHANGELOG.md](CHANGELOG.md).

| SDK version | Node.js |
|-------------|---------|
| 2.x         | 9 and later |
| 1.x         | 6 and later (no longer maintained) |

## Documentation

- [Bundled task docs](docs/README.md) — ship inside the package, version-matched.
- [Node SDK guide](https://cloudinary.com/documentation/node_integration) — the full documentation ([md](https://cloudinary.com/documentation/node_integration.md)).

Documentation links in this README point at the browsable HTML page, with an `(md)`
companion link that returns the same page as raw Markdown. Inside `docs/` and `examples/`
the links are Markdown-only, since those files are written to be read by coding agents.
Either form works for any page: add `.md` for Markdown, drop it for HTML.

## For AI coding agents

- Contributing to this repo: read [AGENTS.md](AGENTS.md).
- Using the installed package: the docs in `node_modules/cloudinary/docs/` match your
  installed version and are the source of truth; start with
  [platform-capabilities](docs/platform-capabilities.md) before assuming a feature exists.

## Support

- SDK bugs and feature requests: [GitHub issues](https://github.com/cloudinary/cloudinary_npm/issues)
- Account and platform questions: [Cloudinary support](https://support.cloudinary.com)

## Security

See [SECURITY.md](SECURITY.md) for private vulnerability reporting. Keep your
`api_secret` in server-side code; for client uploads, use the server-signed pattern in
[Sign a browser upload](docs/sign-browser-upload.md).

## License

Released under the MIT license — see [LICENSE](LICENSE). Copyright (c) Cloudinary Ltd.
