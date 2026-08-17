# Search and manage assets

## When to use

Find assets by indexed fields, read or update asset attributes, and administer your
media library from the server. These use the Admin and Search APIs, which are
**rate-limited** — treat them as management operations, not a per-request database.

## Search with the query builder

```js
const cloudinary = require('cloudinary').v2; // reads CLOUDINARY_URL

async function main() {
  // Assets created by the other bundled tasks live in the 'examples' folder
  const result = await cloudinary.search
    .expression('folder:examples AND resource_type:image')
    .sort_by('created_at', 'desc')
    .max_results(30)
    .execute();

  for (const asset of result.resources) {
    console.log(asset.public_id, asset.bytes, asset.created_at);
  }

  // Pagination: pass the cursor back until it is absent
  if (result.next_cursor) {
    const page2 = await cloudinary.search
      .expression('folder:examples AND resource_type:image')
      .next_cursor(result.next_cursor)
      .execute();
    console.log(`Second page: ${page2.resources.length} asset(s)`);
  }
}

main().catch(console.error);
```

## Read and update a single asset

```js
// 'examples/uploaded-sample' is created by the "Upload an image" task
const details = await cloudinary.api.resource('examples/uploaded-sample');

await cloudinary.api.update('examples/uploaded-sample', {
  tags: 'featured',
  context: 'alt=Sample image from the bundled upload example'
});
```

## Deletion — destructive, no undo without backups

```js
await cloudinary.uploader.destroy('examples/uploaded-sample');   // one asset
// cloudinary.api.delete_resources([...ids])                     // bulk — double-check inputs
// cloudinary.api.delete_resources_by_prefix('examples/')        // by prefix — extremely destructive
```

Prefer explicit ID lists over prefix deletion. Enable backups on the product
environment if you need restore (`cloudinary.api.restore`).

## Common failures

- `420 Rate limit exceeded` — the response includes reset time; back off and batch work.
- Stale search results — the search index lags writes by a short interval; for
  read-after-write flows, use `api.resource` with the known `public_id`.

## Related

- [Use structured metadata](use-structured-metadata.md)
- Hosted reference: https://cloudinary.com/documentation/node_asset_administration
