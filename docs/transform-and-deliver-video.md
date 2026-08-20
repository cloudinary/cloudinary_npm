# Transform and deliver a video

## When to use

Generate CDN-backed delivery URLs and player markup for a video that is already in
Cloudinary. URL generation is local — no network call, no secret required — and the
derived asset is created by Cloudinary on first request, then served from CDN cache.

For images, see [Transform and deliver an image](transform-and-deliver-image.md).

## Player markup

`cloudinary.video()` returns a complete HTML `<video>` tag, not a URL:

```js
const cloudinary = require('cloudinary').v2; // only cloud_name is needed for URL generation

// 'examples/uploaded-large-video' is created by the "Upload a large video" task
const tag = cloudinary.video('examples/uploaded-large-video', {
  width: 640,
  crop: 'scale',
  quality: 'auto',
  controls: true,
  secure: true
});
console.log(tag);
// <video controls poster='.../c_scale,q_auto,w_640/<id>.jpg' width='640'>
//   <source src='.../<id>.webm' type='video/webm'>
//   <source src='.../<id>.mp4'  type='video/mp4'>
//   <source src='.../<id>.ogv'  type='video/ogg'>
// </video>
```

The tag carries three `<source>` variants so the browser picks a format it supports, plus
a generated JPG poster frame. Drop it into a template as-is.

## Video URL only

`cloudinary.video()` returns markup; for the URL alone use `cloudinary.url()` with
`resource_type: 'video'`.

```js
const videoUrl = cloudinary.url('examples/uploaded-large-video', {
  resource_type: 'video',
  width: 640,
  crop: 'scale',
  quality: 'auto',
  secure: true
});
// https://res.cloudinary.com/<cloud>/video/upload/c_scale,q_auto,w_640/examples/uploaded-large-video
```

## Thumbnail from a video frame

Request an image format from a video asset to get a still. `start_offset` picks the
second to grab:

```js
const posterUrl = cloudinary.url('examples/uploaded-large-video', {
  resource_type: 'video',
  format: 'jpg',
  start_offset: '2',   // so_2 — two seconds in
  width: 400,
  crop: 'fill',
  secure: true
});
// https://res.cloudinary.com/<cloud>/video/upload/c_fill,so_2,w_400/examples/uploaded-large-video.jpg
```

## Adaptive bitrate streaming

For anything longer than a short clip, deliver HLS or DASH rather than a single MP4 so
the player can switch renditions:

```js
const hlsUrl = cloudinary.url('examples/uploaded-large-video', {
  resource_type: 'video',
  streaming_profile: 'hd',   // sp_hd
  format: 'm3u8',            // .mpd for DASH
  secure: true
});
// https://res.cloudinary.com/<cloud>/video/upload/sp_hd/examples/uploaded-large-video.m3u8
```

Streaming profiles are per-environment; list the available ones with
`cloudinary.api.list_streaming_profiles()`.

## Cache behavior

- The same URL is served from CDN cache; a new transformation means a new URL.
- To bust stale caches after re-uploading, deliver with the asset `version` from the
  upload response (`cloudinary.url(id, { resource_type: 'video', version: result.version })`).

## Troubleshooting

- The asset was uploaded with `upload_large` and will not transform or stream — it landed
  as `raw`. Re-upload with `resource_type: 'video'`. See
  [Upload a large video](upload-large-video.md).
- The first request for a new transformation is slow — the derived video is being
  generated. For long jobs prefer `eager_async` with a `notification_url` over polling.

## Related

- Runnable example: `examples/transform-and-deliver-video.js`
- [Transform and deliver an image](transform-and-deliver-image.md)
- [Upload a large video](upload-large-video.md)
- Every transformation parameter and its accepted values:
  [Transformation reference](https://cloudinary.com/documentation/transformation_reference.md)
- [Video manipulation guide](https://cloudinary.com/documentation/node_video_manipulation.md)
