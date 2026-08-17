# Migrate to the v2 API

## The one correct import

```js
const cloudinary = require('cloudinary').v2;

// then:
cloudinary.uploader.upload(...)   // correct
cloudinary.api.resource(...)      // correct
cloudinary.url(...)               // correct
```

## The most common mistake

```js
const cloudinary = require('cloudinary').v2;
cloudinary.v2.uploader.upload(...) // WRONG - cloudinary is already the v2 API;
                                   // there is no .v2 property on it. This throws
                                   // "Cannot read properties of undefined".
```

Either import the root and use `.v2` everywhere, or (recommended) import `.v2` once and
write plain `cloudinary.uploader...` from then on.

## What v2 adds over the legacy v1 API

- Promises: every method returns a Promise when no callback is passed. v1 is
  callback-only.
- Consistent parameter order: the options object comes right after the main arguments,
  with an optional callback last.

The legacy v1 surface (`require('cloudinary')` without `.v2`) still works for backward
compatibility; use the v2 API for all new code.

## TypeScript

Type declarations cover the v2 API:

```ts
import { v2 as cloudinary } from 'cloudinary';
```

## Related

- [Configure Cloudinary](configure-cloudinary.md)
- Hosted migration notes: https://cloudinary.com/documentation/node_integration
