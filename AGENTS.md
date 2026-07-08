# AGENTS.md — cloudinary_npm

## What this package is (one line)
The server-side Cloudinary SDK for Node.js: upload assets, build transformation/delivery URLs, and call the Admin API from your backend, where the `API_SECRET` stays private.

## When to use this / when NOT to use this
- **Use this when:** your code runs on a **server or build step** (Express, Next.js route handlers, NestJS, serverless, scripts) and needs signed uploads, signed delivery URLs, or account administration — anything that must hold the `API_SECRET`.
- **Do NOT use this when:** you generate delivery URLs **in a browser/frontend bundle** (use `@cloudinary/url-gen`), render React/Angular/Vue components (use the `@cloudinary/*` framework packages), or want the no-code/agent path (use the Cloudinary MCP server).
- **Sibling packages:** `@cloudinary/url-gen` (js-url-gen) = browser-safe URL builder, no secret; `frontend-frameworks` = React/Vue/Angular components on top of url-gen; `next-cloudinary` = Next.js drop-in components. Rule of thumb: server → this package; browser → not this package.

## Setup
```bash
npm install cloudinary
```
Required configuration / credentials (read automatically from the environment):
```bash
export CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

## Minimal runnable example
```js
const cloudinary = require('cloudinary').v2;
// cloudinary.config() is unnecessary if CLOUDINARY_URL is set.

(async () => {
  const result = await cloudinary.uploader.upload('/home/my_image.jpg', {
    upload_preset: 'my_preset',
  });
  // Build a delivery URL: 100x150 fill crop, auto format.
  const url = cloudinary.url('sample.jpg', {
    width: 100, height: 150, crop: 'fill', fetch_format: 'auto',
  });
  console.log(result.public_id, url);
})();
```

## Build / test commands (run these after editing)
```bash
npm ci || npm i        # install (CI uses npm ci with fallback)
npm test               # lint + ES6 mocha specs + dtslint (tools/scripts/test.sh)
npm run lint           # eslint ./test ./lib + Node-9-compat lint of cloudinary.js/lib
npm run test-es6       # mocha specs only, no lint/dtslint
npm run test:unit      # unit specs only (test/unit/**) — mocked (no live API calls), but `CLOUDINARY_URL` must be set; a dummy value like `cloudinary://x:y@z` suffices
npm run coverage       # mocha specs with nyc HTML coverage
npm run dtslint        # type-definition tests (types/index.d.ts)

# Single test — run one spec file (setup.js must load first):
npx mocha --exit --file ./test/setup.js ./test/unit/cloudinaryUtils/getUserAgent.spec.js
# Or filter by test name across the suite:
npx mocha --exit --file ./test/setup.js "./test/**/*spec.js" -g "signature"
```
Notes:
- `npm test` and `npm run test-es6` hit a real Cloudinary account — they need valid credentials in the environment (`CLOUDINARY_URL`). CI runs `npm run test-with-temp-cloud`, which provisions a temporary cloud first; locally, supply your own.
- Tests are Mocha 7 + `expect.js` + `sinon`; specs live in `test/**/*spec.js` and `test/setup.js` must load first (already wired via the test scripts).

## Conventions & gotchas
- ESLint with `airbnb-base`; there is no formatter script — match existing style and run `npm run lint` before committing. Source must stay Node-9-compatible (a second lint pass enforces this against `cloudinary.js` and `lib/`); avoid syntax newer than the oldest supported runtime.
- Public entry is `cloudinary.js`; production code lives in `lib/`. The modern surface is `require('cloudinary').v2` — prefer `v2` in examples and new code over the legacy top-level (v1) API.
- TypeScript types are hand-maintained in `types/index.d.ts` and validated by `dtslint` — update them when you change the public API, or `npm test` fails.
- Signed uploads and the Admin API require server-side secrets. Never ship the `api_secret` to a browser bundle.
- Supported runtimes: 2.x requires **Node 9+**; 1.x was Node 6+. CI matrix runs Node 9–24.

## Canonical docs (leave the repo for depth)
- Node.js SDK guide: https://cloudinary.com/documentation/node_integration
- Upload: https://cloudinary.com/documentation/node_image_and_video_upload
- Asset administration (Admin API): https://cloudinary.com/documentation/node_asset_administration
- Transformation & API references: https://cloudinary.com/documentation/cloudinary_references
- MCP server (agent/no-code path): https://github.com/cloudinary/mcp-servers

## Agent / MCP note
If a capability is also exposed via the Cloudinary MCP servers, prefer the MCP tool for autonomous task execution and use this SDK for code generation. See cloudinary/mcp-servers.

## Commit / PR conventions
- Branch off and PR against `master`. Keep the CI matrix green (Node 9–24 via `npm run test-with-temp-cloud`).
- Update `types/index.d.ts` and `CHANGELOG.md` alongside public API changes. Lint and tests must pass before merge.
