# Use structured metadata

## When to use

Attach typed, validated business fields (SKU, campaign, rights expiry) to assets, so
applications can filter and route on a stable schema instead of free-form tags.

## Define a field (once, per product environment)

```js
const cloudinary = require('cloudinary').v2; // reads CLOUDINARY_URL

await cloudinary.api.add_metadata_field({
  external_id: 'sku',
  label: 'SKU',
  type: 'string',
  mandatory: false
});
```

Field types include `string`, `integer`, `date`, `enum`, and `set` (enum/set take a
`datasource` of allowed values).

## Write values on an asset

```js
// At upload time:
await cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', {
  public_id: 'examples/product-photo',
  overwrite: true,
  metadata: { sku: 'SKU-00042' }
});

// Or later:
await cloudinary.uploader.update_metadata({ sku: 'SKU-00042' }, ['examples/product-photo']);
```

## Query by metadata

```js
const result = await cloudinary.search
  .expression('metadata.sku="SKU-00042"')
  .execute();
```

## Pattern: analysis to reviewed metadata

The robust AI workflow is not "run a model, trust the output" — it is:

1. Run AI analysis on the asset (captioning, tagging — for example the
   [Analyze API](https://cloudinary.com/documentation/analyze_api_guide), subscription required).
2. Have a human or business rule review/normalize the output.
3. Write the **approved** values as structured metadata.
4. Search, route, and deliver based on that metadata.

This keeps model output out of your delivery path until it has been accepted.

## Common failures

- `external_id already exists` — field definitions are per-environment and permanent;
  reuse the existing field instead of re-creating it.
- Enum/set writes fail when the value is not in the datasource — update the datasource
  first (`api.update_metadata_field_datasource`).

## Related

- [Search and manage assets](search-and-manage-assets.md)
- Hosted reference: https://cloudinary.com/documentation/structured_metadata
