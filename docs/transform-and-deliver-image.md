# Transform and deliver an image

## When to use

Generate CDN-backed delivery URLs that resize, crop, overlay, or optimize an image. URL
generation is local — no network call, no secret required — and the derived asset is
created by Cloudinary on first request, then served from CDN cache.

For video, see [Transform and deliver a video](transform-and-deliver-video.md).

## Optimized image URL

```js
const cloudinary = require('cloudinary').v2; // only cloud_name is needed for URL generation

// 'sample' ships with every new Cloudinary account; substitute any public_id you own
const thumbnailUrl = cloudinary.url('sample', {
  width: 200,
  height: 200,
  crop: 'thumb',
  gravity: 'auto',        // focus on the most interesting region; use 'face' for people photos
  fetch_format: 'auto',   // f_auto: best format for the requesting browser
  quality: 'auto',        // q_auto: perceptual quality tuning
  secure: true
});
console.log(thumbnailUrl);
// https://res.cloudinary.com/<cloud>/image/upload/c_thumb,f_auto,g_auto,h_200,q_auto,w_200/sample
```

## Chained transformations (order matters)

Each component runs on the output of the previous one:

```js
// A text overlay needs no second asset; to overlay an image instead, pass
// overlay: '<public_id of an image in your account>'.
const bannerUrl = cloudinary.url('sample', {
  transformation: [
    { width: 1280, height: 720, crop: 'fill', gravity: 'auto' },
    {
      overlay: { font_family: 'Arial', font_size: 64, font_weight: 'bold', text: 'SALE' },
      color: 'white',
      gravity: 'south_east',
      x: 24,
      y: 24
    },
    { fetch_format: 'auto', quality: 'auto' }
  ],
  secure: true
});
console.log(bannerUrl);
```

Reordering components changes the output. When matching eagerly generated versions,
the serialized transformation string must match exactly.

## Generative editing on delivery

Server-supported generative transformations (background removal, generative fill, and
similar) can be expressed as transformation strings — this package serializes them
generically via `effect` or `raw_transformation`, without dedicated typed builders.
Their availability is account- and plan-dependent; verify against
https://cloudinary.com/documentation/generative_ai_transformations.md before relying on one.

## Cache behavior

- The same URL is served from CDN cache; a new transformation means a new URL.
- To bust stale caches after re-uploading, deliver with the asset `version` from the
  upload response (`cloudinary.url(id, { version: result.version })`).

## Related

- Runnable example: `examples/transform-and-deliver-image.js`
- [Transform and deliver a video](transform-and-deliver-video.md)
- Every transformation parameter and its accepted values:
  [Transformation reference](https://cloudinary.com/documentation/transformation_reference.md)
- [Image manipulation guide](https://cloudinary.com/documentation/node_image_manipulation.md)
