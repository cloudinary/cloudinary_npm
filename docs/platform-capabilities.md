# What this SDK does and does not do

Cloudinary is a platform with many surfaces. This package — the Node.js server-side
SDK — implements some of them natively, expresses some through generic URL building,
and does not implement others. Verified against this package version.

| Capability | This package | Where to go |
|---|---|---|
| Upload, chunked/streamed upload, asset mutation | **Native** (`uploader`) | [Upload an image](upload-image.md), [Upload a large video](upload-large-video.md) |
| Admin API: list, update, restore, folders, presets | **Native** (`api`) | [Search and manage assets](search-and-manage-assets.md) |
| Search query builder | **Native** (`search`) | [Search and manage assets](search-and-manage-assets.md) |
| Delivery/transformation URLs, image & video tags | **Native** (`url`, `image`, `video`) | [Transform and deliver media](transform-and-deliver-media.md) |
| Signing browser/mobile uploads | **Native** (`utils.api_sign_request`) | [Sign a browser upload](sign-browser-upload.md) |
| Analyze API (captioning, tagging, detection) | **Native, limited model set** (`analysis.analyze_uri`); requires a subscription | [Analyze API guide](https://cloudinary.com/documentation/analyze_api_guide) |
| Visual Search | **Native** (`api.visual_search`); requires the feature enabled on the account | [Visual Search](https://cloudinary.com/documentation/visual_search) |
| Moderation workflows | **Native** (upload options + `api`) | [Moderate an upload](moderate-upload.md) |
| Structured metadata | **Native** (`api` + upload options) | [Use structured metadata](use-structured-metadata.md) |
| Generative delivery transformations (gen fill, remove, ...) | **Generic strings only** — `effect`/`raw_transformation`; no typed builders | [Transform and deliver media](transform-and-deliver-media.md) |
| Image Generation API (text-to-image) | **Not implemented** | [Platform API](https://cloudinary.com/documentation/image_generation_addon) |
| Image-to-Video API | **Not implemented** (beta platform API; async, credits, regional) | [Platform API](https://cloudinary.com/documentation/image_to_video_addon) |
| MediaFlows workflow automation | **Not implemented** | [MediaFlows](https://cloudinary.com/documentation/mediaflows_user_guide) and its MCP server |
| Frontend rendering, responsive images, widgets | **Not this package** | `@cloudinary/url-gen` + framework SDKs, [Upload Widget](https://cloudinary.com/documentation/upload_widget) |
| Account provisioning | **Native** (`provisioning`, via `CLOUDINARY_ACCOUNT_URL`) | Hosted [Provisioning API docs](https://cloudinary.com/documentation/provisioning_api) |

## For AI agents

- Methods this table marks "Not implemented" are absent from this package, whatever
  training data suggests — for those capabilities, use the linked platform API instead.
- Cloudinary also ships agent tooling that complements this SDK: documentation and
  operation [MCP servers and Skills](https://cloudinary.com/documentation/cloudinary_llm_mcp).
  Use those for interactive asset operations; use this SDK inside application code.
