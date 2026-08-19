# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 2.x     | Yes       |
| 1.x     | No        |

## Reporting a vulnerability

Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/cloudinary/cloudinary_npm/security/advisories/new) for this repository.

If you cannot use GitHub reporting, contact Cloudinary support at [support.cloudinary.com](https://support.cloudinary.com/hc/en-us/requests/new) and mark the ticket as a security issue.

Use these private channels for anything security-sensitive; public GitHub issues are for regular bugs and feature requests.

## What to include in a report

- The affected package version and Node.js version.
- A minimal reproduction or proof of concept.
- The impact you believe the issue has (for example: credential exposure, signature bypass, request forgery).
- Any suggested remediation, if you have one.

## Response and disclosure process

- We acknowledge reports and keep you informed while the issue is investigated.
- Fixes are released as patched package versions; the changelog notes security-relevant changes without disclosing exploit details before users can upgrade.
- Please give us reasonable time to release a fix before public disclosure.

## Security guidance for SDK users

- Your `api_secret` is a server-side credential. Keep it on your server; browsers, mobile binaries, and repositories should only ever hold delivery URLs or short-lived signatures.
- Provide credentials through the `CLOUDINARY_URL` environment variable rather than hardcoding them.
- For uploads initiated from a browser or mobile app, generate the signature on your server. See [docs/sign-browser-upload.md](docs/sign-browser-upload.md).
- For unsigned uploads, use a deliberately restricted [unsigned upload preset](https://cloudinary.com/documentation/upload_presets) ([md](https://cloudinary.com/documentation/upload_presets.md)).
- Cloudinary platform security documentation: https://cloudinary.com/documentation/solution_overview#security
