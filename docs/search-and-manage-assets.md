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

API errors reject with `{ error: { message, http_code } }`. Network failures reject with
an `Error` and no `http_code`. Unwrap with `error.error || error` and branch on
`http_code`:

```js
try {
  await cloudinary.api.resource('examples/does-not-exist');
} catch (error) {
  const { http_code, message } = error.error || error;

  switch (http_code) {
    case 404: /* asset is gone */ break;
    case 401: /* credentials do not match the cloud */ break;
    case 420: /* rate limited - back off and retry */ break;
    case undefined: /* never reached the API - retriable */ break;
    default: throw error;
  }
}
```

`cloudinary.config({ debug: true })` adds `request_id` to API errors — include it in
support tickets.

## Troubleshooting

- `420 Rate limit exceeded` — the response includes reset time; back off and batch work.
- Stale search results — the search index lags writes by a short interval; for
  read-after-write flows, use `api.resource_by_asset_id` instead of searching.
- Zero results from an expression you expected to match — check the field name and
  syntax against the
  [search expression reference](https://cloudinary.com/documentation/search_expressions.md);
  an unknown field is not an error, it simply matches nothing.

## Related

- [Use structured metadata](use-structured-metadata.md)
- [Asset administration guide](https://cloudinary.com/documentation/node_asset_administration.md)
