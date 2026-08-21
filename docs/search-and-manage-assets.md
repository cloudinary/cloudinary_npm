# Search and manage assets

## When to use

Find assets by indexed fields, read or update asset attributes, and administer your
media library from the server. These use the Admin and Search APIs, which are
**rate-limited** — treat them as management operations, not a per-request database.

## Search with the query builder

Expressions use Cloudinary's search syntax — fields, operators, ranges, and boolean
combinations are listed in the
[search expression reference](https://cloudinary.com/documentation/search_expressions.md).

```js
const cloudinary = require('cloudinary').v2; // reads CLOUDINARY_URL

async function main() {
  // Images created by the other bundled tasks live in the 'examples' folder
  const result = await cloudinary.search
    .expression('folder:examples AND resource_type:image')
    .sort_by('created_at', 'desc')
    .max_results(30)
    .execute();

  for (const asset of result.resources) {
    console.log(asset.asset_id, asset.public_id, asset.bytes, asset.created_at);
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
const details = await cloudinary.api.resource_by_asset_id(storedAssetId);

await cloudinary.api.update(details.public_id, {
  tags: 'featured',
  context: 'alt=Sample image from the bundled upload example'
});
```

Bulk: `api.resources_by_asset_ids`, `api.restore_by_asset_ids`,
`api.delete_resources_by_asset_ids`.

## Deletion — destructive, no undo without backups

```js
await cloudinary.uploader.destroy('examples/uploaded-sample');   // one asset
// cloudinary.api.delete_resources([...ids])                     // bulk — double-check inputs
// cloudinary.api.delete_resources_by_prefix('examples/')        // by prefix — extremely destructive
```

Prefer explicit ID lists over prefix deletion. Enable backups on the product
environment if you need restore (`cloudinary.api.restore`).

## Handling errors

Failed calls reject with a `message` describing what went wrong. Read the message; there
are no error classes to catch by type.

```js
try {
  await cloudinary.api.resource('examples/does-not-exist');
} catch (error) {
  const { message } = error.error || error;
  console.error(message);
}
```

Never log the whole error object from an Admin or Search call — it carries your
`api_secret`. Log `message`.

Set `cloudinary.config({ debug: true })` to add a `request_id` to failures; quote it in
support tickets.

## Troubleshooting

- `Rate limit exceeded` — too many Admin API calls. Batch your work and retry later.
  Successful Admin responses carry `rate_limit_remaining`, so you can slow down before
  you are cut off.
- Stale search results — the search index lags writes by a short interval; for
  read-after-write flows, use `api.resource_by_asset_id` instead of searching.
- Zero results from an expression you expected to match — check the field name and
  syntax against the
  [search expression reference](https://cloudinary.com/documentation/search_expressions.md);
  an unknown field is not an error, it simply matches nothing.

## Related

- [Use structured metadata](use-structured-metadata.md)
- [Asset administration guide](https://cloudinary.com/documentation/node_asset_administration.md)
