/**
 * Build transformation and delivery URLs for an image already in Cloudinary.
 *
 * URL generation is local - no network call and no credentials beyond the cloud name.
 * The derived asset is created by Cloudinary on first request and then served from CDN cache.
 *
 * In your own project: const cloudinary = require('cloudinary').v2;
 *
 * Related:
 * - Task doc: docs/transform-and-deliver-image.md
 * - For video: examples/transform-and-deliver-video.js
 * - Every transformation parameter and its accepted values:
 *   https://cloudinary.com/documentation/transformation_reference.md
 * - Building transformations from a plain-language description: the
 *   cloudinary-transformations skill (npx skills add cloudinary-devs/skills)
 */
const cloudinary = require('../cloudinary').v2;

function main(publicId = 'sample') {
  // Crop to a 200x200 square thumbnail focused on the most interesting region.
  // For people photos, use gravity: 'face' to center the crop on the face.
  const avatarUrl = cloudinary.url(publicId, {
    width: 200,
    height: 200,
    crop: 'thumb',
    gravity: 'auto',
    fetch_format: 'auto',
    quality: 'auto',
    secure: true
  });

  // Chained transformations run in order: fill to 16:9, then overlay a text badge.
  // A text overlay needs no second asset; to overlay an image instead, pass
  // overlay: '<public_id of an image in your account>'.
  const bannerUrl = cloudinary.url(publicId, {
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

  console.log(`Thumbnail (200x200, auto-focused): ${avatarUrl}`);
  console.log(`Banner (16:9 with overlay):        ${bannerUrl}`);
  return { avatarUrl, bannerUrl };
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
