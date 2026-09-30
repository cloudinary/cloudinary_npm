/**
 * Build transformation and delivery URLs for a video already in Cloudinary.
 *
 * URL generation is local - no network call and no credentials beyond the cloud name.
 * The derived asset is created by Cloudinary on first request and then served from CDN cache.
 *
 * In your own project: const cloudinary = require('cloudinary').v2;
 *
 * Related:
 * - Task doc: docs/transform-and-deliver-video.md
 * - For images: examples/transform-and-deliver-image.js
 * - Every transformation parameter and its accepted values:
 *   https://cloudinary.com/documentation/transformation_reference.md
 * - Building transformations from a plain-language description: the
 *   cloudinary-transformations skill (npx skills add cloudinary-devs/skills)
 */
const cloudinary = require('../cloudinary').v2;

function main(publicId = 'dog') {
  // A complete <video> tag: three <source> variants plus a generated poster frame.
  const playerTag = cloudinary.video(publicId, {
    width: 640,
    crop: 'scale',
    quality: 'auto',
    controls: true,
    secure: true
  });

  // The delivery URL on its own, for a player you control.
  const videoUrl = cloudinary.url(publicId, {
    resource_type: 'video',
    width: 640,
    crop: 'scale',
    quality: 'auto',
    secure: true
  });

  // A still frame as an image: ask a video asset for an image format.
  const posterUrl = cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    start_offset: '2',
    width: 400,
    crop: 'fill',
    secure: true
  });

  // Adaptive bitrate streaming - prefer this over a single MP4 for long videos.
  const hlsUrl = cloudinary.url(publicId, {
    resource_type: 'video',
    streaming_profile: 'hd',
    format: 'm3u8',
    secure: true
  });

  console.log(`Video URL (640 wide):     ${videoUrl}`);
  console.log(`Poster frame at 2s:       ${posterUrl}`);
  console.log(`HLS adaptive streaming:   ${hlsUrl}`);
  console.log(`Player tag:               ${playerTag}`);
  return { playerTag, videoUrl, posterUrl, hlsUrl };
}

if (require.main === module) {
  try {
    main(process.argv[2]);
  } catch (error) {
    const { message } = error.error || error;
    console.error(`URL generation failed: ${message}`);
    console.error('Check that cloud_name is configured (CLOUDINARY_URL or cloudinary.config()).');
    process.exitCode = 1;
  }
}

module.exports = { main };
