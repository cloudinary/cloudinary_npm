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

A common pattern for turning model output into data you can rely on:

1. Run AI analysis on the asset (captioning, tagging — for example the
   [Analyze API](https://cloudinary.com/documentation/analyze_api_guide.md), subscription required).
2. Normalize the output against your schema — map free-form values onto your allowed
   list, drop low-confidence results, apply business rules.
3. Write the resulting values as structured metadata.
4. Search, route, and deliver based on that metadata.

Step 2 is where the value is: structured metadata fields are typed and validated, so
whatever you write has to conform. Automate it when the rules are clear and route to a
person only for the cases your rules cannot decide.

## Troubleshooting

- `external_id already exists` — field definitions are per-environment and permanent;
  reuse the existing field instead of re-creating it.
- Enum/set writes fail when the value is not in the datasource — update the datasource
  first (`api.update_metadata_field_datasource`).

## Related

- [Search and manage assets](search-and-manage-assets.md)
- [Structured metadata guide](https://cloudinary.com/documentation/structured_metadata.md)
