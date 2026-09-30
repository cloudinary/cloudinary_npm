# Contributor guide for coding agents

This file is for agents contributing to this repository. If you are *using* the installed
`cloudinary` package in another project, read the bundled docs in
`node_modules/cloudinary/docs/` instead.

## Commands

```bash
npm install              # install dependencies
npm test                 # lint + unit tests + type declaration tests
npm run test:unit        # mocha unit tests only (mocked, no network)
npm run lint             # eslint
npm run dtslint          # TypeScript declaration tests
npm run test-with-temp-cloud  # full integration tests against a temporary cloud (CI)
```

Unit tests require a `CLOUDINARY_URL` in the environment or a `.env` file;
any syntactically valid value works for mocked tests:
`CLOUDINARY_URL=cloudinary://key:secret@test-cloud`.

## Testing

- `test/unit/` is mocked and must never perform network calls.
- `test/integration/` requires a real or temporary Cloudinary environment; do not run it
  by default and do not add tests there that consume paid add-ons without a skip guard.
- Nondeterministic AI output (captions, tags, moderation verdicts) must be asserted by
  request shape, state transition, and response schema — never by exact output values.

## Project structure

- `cloudinary.js` — package entry point; exposes the legacy v1 API and `require('cloudinary').v2`.
- `lib/` — implementation. `lib/v2/` wraps the v1 modules with promise support.
- `lib/analysis/` — Analyze API (`analyze_uri`).
- `types/index.d.ts` — TypeScript declarations, tested by `npm run dtslint`.
- `examples/` — small, runnable task examples shipped in the npm package.
- `docs/` — version-matched Markdown docs shipped in the npm package.
- `samples/` — legacy full applications; not part of the tested example set.
- `test/` — `unit/`, `integration/`, shared helpers in `spechelper.js` and `testUtils/`.
- `tools/scripts/` — shell entry points used by the npm scripts.

## Code style

- CommonJS modules, ES6+ syntax, two-space indent; eslint config is authoritative.
- Public API methods accept an options object and an optional Node-style callback and
  return a Promise, following the existing pattern:

```js
exports.example_method = function example_method(public_id, callback, options = {}) {
  return call_api("post", ["example"], { public_id }, callback, options);
};
```

## Git workflow

- Branch from `master`; keep changes focused; one topic per pull request.
- Run `npm test` before opening a PR.
- Do not rewrite published changelog entries; add new entries at the top.
- Never commit generated output (`out/`, `coverage/`), credentials, or `.env` files.

## Boundaries

**Always**
- Update `types/index.d.ts` and tests when public behavior changes.
- Keep `docs/` and `examples/` consistent with the code they document.
- Keep API secrets out of examples, docs, tests, and fixtures.

**Ask first**
- Changing supported Node versions, dependencies, or `package.json.files`.
- Renaming or removing any public method or exported symbol.
- Changing release, CI, or publishing configuration.

**Never**
- Commit credentials or real account identifiers.
- Perform live network calls in unit or example tests.
- Document a Cloudinary platform capability as an SDK method unless this package
  implements it (see docs/platform-capabilities.md).
