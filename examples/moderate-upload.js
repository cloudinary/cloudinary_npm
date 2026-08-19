/**
 * Upload an image into a manual moderation queue and approve it after review.
 *
 * Moderation is stateful: an asset carries a status until a decision is recorded, and
 * your application should deliver only approved assets. A pending asset is still
 * deliverable by default - the status is metadata to gate on, not an access control.
 *
 * This example uses 'manual' moderation. Automatic moderators follow the same states:
 * aws_rek, aws_rek_video, google_video_moderation, webpurify, perception_point, and
 * duplicate:<threshold>. Each needs its add-on enabled on the account. Combine several
 * with a pipe, manual last: 'aws_rek|manual'.
 *
 * Prerequisites: set CLOUDINARY_URL. In your own project:
 *   const cloudinary = require('cloudinary').v2;
 *
 * Related:
 * - Task doc: docs/moderate-upload.md
 * - Statuses and delivery behavior:
 *   https://cloudinary.com/documentation/moderate_assets.md
 */
const cloudinary = require('../cloudinary').v2;

async function main(imageSource = 'https://res.cloudinary.com/demo/image/upload/sample.jpg') {
  // 1. Upload into the moderation queue - the asset starts in "pending".
  const uploaded = await cloudinary.uploader.upload(imageSource, {
    public_id: 'examples/moderated-upload',
    overwrite: true,
    moderation: 'manual'
  });
  const status = uploaded.moderation && uploaded.moderation[0].status;
  const storedAssetId = uploaded.asset_id;
  console.log(`Uploaded ${storedAssetId}; moderation status: ${status}`);

  // 2. List everything awaiting review (your review UI would read this queue).
  const pending = await cloudinary.api.resources_by_moderation('manual', 'pending', { max_results: 10 });
  console.log(`Assets pending manual review: ${pending.resources.length}`);

  // 3. Record the reviewer's decision ("approved" or "rejected").
  const asset = await cloudinary.api.resource_by_asset_id(storedAssetId);
  const updated = await cloudinary.api.update(asset.public_id, { moderation_status: 'approved' });
  console.log(`Decision recorded: ${asset.public_id} is now ${updated.moderation && updated.moderation[0].status}`);

  return updated;
}

if (require.main === module) {
  main(process.argv[2]).catch((error) => {
    console.error(`Moderation workflow failed: ${(error.error && error.error.message) || error.message}`);
    console.error('Check that CLOUDINARY_URL is set. Automatic moderators require the matching add-on to be enabled.');
    process.exitCode = 1;
  });
}

module.exports = { main };
