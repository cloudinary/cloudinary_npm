# Moderate an upload

## When to use

Content uploaded by users must be reviewed before it is delivered. Moderation in
Cloudinary is stateful: assets are `pending` until a decision is recorded, and your
application is responsible for delivering approved assets only.

## Complete flow (manual review queue)

```js
const cloudinary = require('cloudinary').v2; // reads CLOUDINARY_URL

async function main() {
  // 1. Upload into the moderation queue - the asset starts as "pending"
  const uploaded = await cloudinary.uploader.upload(
    'https://res.cloudinary.com/demo/image/upload/sample.jpg', // or the user's file
    {
      public_id: 'examples/moderated-upload',
      overwrite: true,
      moderation: 'manual'
    }
  );
  console.log(uploaded.moderation[0].status); // 'pending'

  // 2. Your review UI lists the queue
  const queue = await cloudinary.api.resources_by_moderation('manual', 'pending', {
    max_results: 50
  });
  console.log(`Assets pending review: ${queue.resources.length}`);

  // 3. A reviewer records the decision ('approved' or 'rejected')
  await cloudinary.api.update(uploaded.public_id, { moderation_status: 'approved' });

  // 4. Deliver approved assets only - gate on moderation status in your data model
}

main().catch((error) => {
  console.error(`Moderation flow failed: ${error.message}`);
  process.exitCode = 1;
});
```

## Automatic moderation

Pass an add-on name instead of `manual` (for example `moderation: 'aws_rek'`) to get an
automated verdict; the same pending/approved/rejected states apply, and you can still
override a machine decision with `api.update` + `moderation_status` for human review.
Automatic moderators require the matching add-on to be enabled on the account.

## Design rules

- Model moderation as a state machine, not a boolean. Keep the pending state visible in
  your product (placeholder image, "under review" label).
- Keep human override even with automatic moderation — machine verdicts are drafts for
  anything with legal or brand consequences.
- Rejected assets stay in storage unless you delete them; decide your retention policy.

## Common failures

- `Moderation kind not supported` — the add-on is not enabled for the account.
- Delivering a pending asset — nothing blocks delivery by default; enforcement is your
  application's responsibility (or use access control on the asset).

## Related

- Runnable example: `examples/moderate-upload.js`
- Hosted reference: https://cloudinary.com/documentation/cloudinary_moderation
