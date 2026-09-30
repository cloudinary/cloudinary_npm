# Moderate an upload

## When to use

Content uploaded by users must be reviewed before it is delivered. Moderation in
Cloudinary is stateful: an asset carries a moderation status, and your application is
responsible for delivering approved assets only.

**By default, `pending` does not block delivery.** A moderated asset is deliverable and
visible in the Media Library from the moment it is uploaded — the status is metadata you
gate on in your own code.

Blocking delivery of non-approved assets can be configured for your product environment.
It is not an upload parameter — contact Cloudinary support. Gate on the status in your
code regardless.

Statuses are `queued`, `pending`, `approved`, `rejected`, and `aborted`. They appear in
the `moderation` array on the asset, not as a top-level field:

```js
result.moderation[0].kind     // 'manual', 'aws_rek', ...
result.moderation[0].status   // 'pending'
```

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
  const { message } = error.error || error;
  console.error(`Moderation flow failed: ${message}`);
  process.exitCode = 1;
});
```

## Automatic moderation

Pass an add-on name instead of `manual` to get an automated verdict.

**Prerequisite — a human has to do this, not your code.** Every value below except
`manual` requires its add-on to be registered on the account first, from the
[Add-ons page](https://cloudinary.com/documentation/cloudinary_add_ons.md) in the console.
Some third-party add-ons also require reviewing and accepting the provider's terms of
service as part of registration. Neither step has an API; until both are done the add-on
value is rejected at upload. `manual` needs no add-on and no terms accepted, which is why
the flow above uses it.

| Value | Moderates | Add-on |
|---|---|---|
| `aws_rek` | images | Amazon Rekognition AI Moderation |
| `aws_rek_video` | video | Amazon Rekognition Video Moderation |
| `google_video_moderation` | video | Google AI Video Moderation |
| `webpurify` | images | WebPurify Image Moderation |
| `perception_point` | any asset | Perception Point Malware Detection |
| `duplicate:<threshold>` | images | Cloudinary Duplicate Image Detection |

Combine several with a pipe — the order is the order they run in, and `manual` must be
last (`'aws_rek|duplicate:0.9|manual'`). The first moderation starts as `pending` and the
rest as `queued`; if one rejects, the remaining become `aborted` and the asset's final
status is `rejected`. Always set a `notification_url` when requesting several.

The same statuses apply, and you can still override a machine decision with `api.update`
+ `moderation_status` for human review. An asset may sit in `queued` before the add-on
reaches it.

## Design rules

- Model moderation as a state machine, not a boolean. Keep the pending state visible in
  your product (placeholder image, "under review" label) — and remember the URL works
  regardless, so the gate has to be in your code.
- Keep human override even with automatic moderation — machine verdicts are drafts for
  anything with legal or brand consequences.
- Rejected assets stay in storage unless you delete them; decide your retention policy.

## Troubleshooting

- `You don't have an active subscription for <add-on name>` — register the add-on on the
  Add-ons page in the console. Some third-party add-ons also require accepting the
  provider's terms of service before they activate.
- `Moderation <value> moderation is not valid` — the moderation value is misspelled; use
  one of the values in the table above.
- Delivering a pending asset — nothing blocks delivery by default; enforcement is your
  application's responsibility. It is not an upload parameter: contact Cloudinary support
  to have it configured for your product environment.
- Showing a rejected image — deliver `default_image` as a placeholder rather than
  relying on the URL failing, because it will not.

## Related

- Runnable example: `examples/moderate-upload.js`
- [Moderate assets](https://cloudinary.com/documentation/moderate_assets.md) — statuses,
  delivery behavior, and the available moderation add-ons.
- [Moderation guide](https://cloudinary.com/documentation/cloudinary_moderation.md)
