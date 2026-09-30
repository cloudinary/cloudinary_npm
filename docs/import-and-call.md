# Import and call the SDK

```js
const cloudinary = require('cloudinary').v2;

cloudinary.uploader.upload(...)
cloudinary.api.resource(...)
cloudinary.url(...)
```

Import once at the top of the file, then call methods directly on `cloudinary`.

Every method returns a Promise when no callback is passed, so use `async`/`await`. The
options object comes right after the main arguments, with an optional callback last.

## TypeScript

```ts
import { v2 as cloudinary } from 'cloudinary';
```

## Related

- [Configure Cloudinary](configure-cloudinary.md)
- [Node SDK guide](https://cloudinary.com/documentation/node_integration.md)
