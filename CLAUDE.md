@AGENTS.md

# CLAUDE.md — cloudinary_npm

## Claude Code-specific notes

**Primary reference:** `AGENTS.md` (imported above) covers setup, build commands, conventions, and gotchas. Read it before touching any file.

## What this repo is

`cloudinary_npm` is the **server-side Node.js SDK** for Cloudinary: upload assets, build transformation/delivery URLs, and call the Admin API from your backend. This is the package that holds `API_SECRET` — never use it in a browser bundle.

## Key constraints

- **Entry point:** `cloudinary.js`; production code lives in `lib/`. Always use `require('cloudinary').v2` — the legacy top-level (v1) API is deprecated.
- **TypeScript types** are hand-maintained in `types/index.d.ts`. Update them alongside any public API change or `npm test` (dtslint) will fail.
- **Node 9 compatibility is a hard floor.** A second ESLint pass enforces this against `cloudinary.js` and `lib/`. Avoid syntax unavailable in Node 9.
- **ESLint (`airbnb-base`) only — no formatter.** Match existing style and run `npm run lint` before committing.
- **Branch target:** `master`. Every public API change requires updating both `types/index.d.ts` and `CHANGELOG.md`.

## Verified build/test commands

```bash
npm ci || npm i            # install (CI uses npm ci)

npm test                   # lint + ES6 mocha specs + dtslint — requires CLOUDINARY_URL set
npm run test:unit          # unit specs only — mocked (no live API calls), but `CLOUDINARY_URL` must be set; a dummy value like `cloudinary://x:y@z` suffices
npm run lint               # eslint ./test ./lib + Node-9 compat lint
npm run dtslint            # type-definition tests against types/index.d.ts
npm run coverage           # mocha + nyc HTML coverage report

# Single spec file (setup.js must load first):
npx mocha --exit --file ./test/setup.js ./test/unit/cloudinaryUtils/getUserAgent.spec.js
# Filter by test name across the suite:
npx mocha --exit --file ./test/setup.js "./test/**/*spec.js" -g "signature"
```

`npm test` and `npm run test-es6` hit a real Cloudinary account — supply `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`. CI provisions a temporary cloud via `npm run test-with-temp-cloud`. For offline iteration, use `npm run test:unit`.
