
1.15.0 / 2019-09-08
===================

New functionality
-----------------

* Add 'derived_next_resource' to api.resource method
* Add support for 'delete folder' API
* Add support for remote/local function invocation (fn:remote and fn:wasm) (#261)
* Add antialiasing and hinting
* Add `force_version` transformation parameterAdd automatic JavaScript linting and fix existing code conflicts (#262)
* Add automatic JavaScript linting and fix existing code conflicts (#262)

Other changes
-------------
  * Mock upload preset listing test
  * Feature/duration to condition video
  * Update test for change moderation status
  * Simplified error assertions in a few test specs
  * Fix base64 URL validation
  * Rearrange util tests
  * Test support of `async` option in explicit api
  * Remove unnecessary return statements and options from tests
  * Remove unnecessary use of options and API in access_control_spec.js
  * Merge pull request #239 from tornqvist/remove-coffeescript-transform
  * Remove coffee script deps and transform

1.14.0 / 2019-03-26
===================

New functionality
-----------------

  * Support format in transformation API
  * Add support for `start_offset` value `auto`
  * Add support for gs:// urls in uploader
  * Add support for the `quality_analysis` upload parameter. Fixes #171
  * Add `fps` transformation parameter (#230)

Other changes
-------------

  * Update code samples in the README file. Fixes #135
  * Reject deferred on request error. Fixes #136
  * Refactor test code after conversion from CoffeeScript
  * Convert test code from CoffeeScript to JavaScript
  * Merge pull request #208 from cloudinary/fix_update_samples_readme
  * Fix the "upload large" test for node 4
  * Remove bower from the sample code
  * Add timeout to search integration tests
  * Fix detection test
  * Fix broken links in node sample project readme

1.13.2 / 2018-11-14
===================

  * Use a new timestamp for each chunk in `upload_large` API

1.13.1 / 2018-11-13
===================

  * Filter files in the npm package
  * Add polyfill for `Object.entries`
  * Add `update_version` script

1.13.0 / 2018-11-13
===================

  * Support listing of named transformations using the `named` parameter
  * Fix Node version check. Fixes #217

1.12.0 / 2018-11-08
===================

New functionality
-----------------

  * Add Responsive Breakpoints cache
  * Add `picture` and `source` tags
  * Add fetch support to overlay/underlay (#189)
  * Add async param to uploader (#193)
 
Other changes
-------------

  * Convert CoffeeScript source to JavaScript
  * Refactor compiled coffee to proper JS
  * Remove old lib files
  * Move all sources from `src` to `lib`
  * Move `cloudinary.js` inside the src folder
  * Setup library and tests to run with either es6 or es5
  * Apply babel to support older Node versions
  * Refactor tests to use promises
  * Fix Tests
  * Refactor utils
  * Move utils.js to utils folder
  * Add `ensurePresenceOf` and `rimraf` utility functions
  * Add `nyc` for coverage and update sinon
  * Add "Join the Community" (#201)
  * Use upload params in explicit API
  * Fix raw convert test

1.11.0 / 2018-03-19
===================

New functionality
-----------------

  * Add `access_control` parameter to `upload` and `update`
 
Other changes
-------------

  * Mock `delete_all_resources` test
  * Add `compileTests` script to `package.json`
  * Add http/https handling to spec helper
  * Mock moderation tests
  * Fix `categorization` test
  * Remove `similiarity_search` test
  * Add test helper functions
  * Add utility functions to `utils`
  * Replace lodash's `_` with explicitly requiring methods

1.10.0 / 2018-02-13
===================

New functionality
-----------------

  * Support url suffix for shared CDN
  * Add Node 8 to Travis CI tests and remove secure variables
  * Fix breakpoints format parameter
  * Extend support of url_suffix for different resource types
  * Add support for URLs in upload_large
  * Add support for transformations parameter in delete_resources api
  * Add support for delete_derived_by_transformation
  * Add format parameter support to responsive-breakpoints encoder
  * Add expires_at parameter to archive_params
  * Add `faces` parameter to the `explicit` API

Other changes
-------------

  * Fix typos
  * Test transformations api with next_cursor
  * add test cases of ocr for upload and url generation
  * add test case of conditional tags
  * Update dependencies
  * Fix tests
  * Remove tests for `auto_tagging`

1.9.1 / 2017-10-24
==================

  * Decode string to sign before creating the signature (#167)
  * Update Readme to point to HTTPS URLs of cloudinary.com
  * Update lib files
  * Ignore error when `.env` file is missing.
  * Remove CoffeeScript header
  * Add `lib\v2\search.js` to git.

1.9.0 / 2017-04-30
==================

New functionality
-----------------

  * Add Search API
  * Add support for `type` parameter in publish-resources api
  * Add support for `keyframe-interval` (ki) video manipulation parameter
  * Added parameters `allow_missing` and `skip_transformation_name` to generate-archive api
  * Add support for `notification-url` parameter to update API
  * Support = and | characters within context values using escaping + test (#143)

Other changes
-------------

  * Test/upgrade mocha (#142)
  * fix bad escaping of special characters in certain scenarios + tests (#140) Fixes #138
  * Don't normalize negative numbers.
  * Fix typo: rename `min` to `sub`

1.8.0 / 2017-03-09
==================

  * Add User Defined Variables

1.7.1 / 2017-02-23
==================

  * Refactor `generate_auth_token`
  * Update utils documentation.
  * Add URL authorization token. 
  * Rename token function.
  * Support nested keys in CLOUDINARY_URL
  * Allow tests to run concurrently

1.7.0 / 2017-02-08
==================

New functionality
-----------------

  * Add access mode API

Other changes
-------------

  * Rework tests cleanup
  * Use TRAVIS_JOB_ID to make test tags unique

1.6.0 / 2017-01-30
==================

New functionality
-----------------

  * Add Akamai token generator
  * Add Search resource by context

Other changes
-------------

  * Use http library when api protocol is set to http patch 
  * Added timeouts to spec in order to force consistency
  * Fix publish API test cleanup
  * Use random suffix in api tests
  * Use binary encoding for signature
  * Add coffee watch
  * Fixed async issues with before queue
  * Add missing options to explicit api call

1.5.0 / 2016-12-29
==================

New functionality
-----------------

  * `add_context` & `remove_all_context` API
  * Add `data-max-chunk-size` to input created by `image_upload_tag`
  * Add `moderation` and `phash` parameters to explicit API
  
    
Other changes
-------------

  * Modify Travis configuration to test NodeJS v4 and v6 only.
  * Modify `TEST_TAG`
  * Use Sinon spy in `start_at` test
  * Support context as hash argument in context API
  * Delete streaming profiles after tests
  * Fix signing URL tests, Fixes #89
  * Add timeout to delete streaming profile test
  * add tests for add_context & remove_all_context
  * add add_context & remove_all_context methods
  * fix test description
  * add test to phash in an explicit call
  * add test to moderation parameter in an explicit call
  * Add test to accepts {effect: art:incognito}
  * support phash in explicit call
  * Fix missing moderation parameter in an explicit call
  * Fix `nil` to `null`. Call `config()` with parameter name.

1.4.6 / 2016-11-25
==================

  * Merge pull request #118 from cloudinary/explicit-eager-transformations
    * Support multiple eager transformations with explicit api

1.4.5 / 2016-11-25
==================

New functionality
-----------------

  * Add `remove_all_tags` API
  * Add `streaming_profile` transformation parameter.

Other changes
-------------

  * Fix face coordinates test
  * Sort parameters
  * Support `http` mode for tests.
  * Add tests for gravity modes

1.4.4 / 2016-10-27
==================

New functionality
-----------------

  * Add streaming profiles API

Other changes
-------------

  * Change email address in sample project's bower.json
  * Add files to `.npmignore`

1.4.3 / 2016-10-27
==================

1.4.2 / 2016-09-14
==================

New functionality
-----------------

  * Add publish API: `publish_by_prefix`, `publish_by_public_ids`, `publish_by_tag`.
  * Add `to_type` to `rename`.

Other changes
-------------

  * Get version in `utils` from `package.json`
  * Fix tests.

1.4.1 / 2016-06-22
==================

Other changes
-------------

  * Fix #105 #106 - url generation broken width numeric width parameter

1.4.0 / 2016-06-22
==================

New functionality
-----------------

  * New configuration parameter `:client_hints`
  * Enhanced auto `width` values
  * Enhanced `quality` values
  * Add `next_cursor` to `transformation`

Other changes
-------------

  * Remove redundant `max_results` from `upload_preset`
  * Add tests for `max_results` and `next_cursor`
  * Refactor explicit with invalidate test
  * Fix double slash replacement
  * Fix "should allow listing resources by start date" test

1.3.1 / 2016-04-04
==================

New functionality
-----------------

  * Conditional transformations

Other changes
-------------

  * Add error handling to test
  * Fix categorization test
  * Update sample project to use the new cloudinary_js library.
  * Change explicit test to simple eager instead of twitter
  * Add `*.js` and `*.map` to gitignore.
  * Merge pull request #87 from bompus/util-speedup-2
    * optimized speed of generate_transformation_string, removed js/map files.
    * optimized speed of generate_transformation_string
  * Replace `_.include` with `_.includes` - It was removed in lodash 4.0. PR #83
  * Merge pull request #1 from cloudinary/master
  * Merge pull request #76 from joneslee85/renaming-tests
    * Use snakecase naming for spec files
  * Fix dependency of sample projects on cloudinary. Fixes #80.
  * Remove `promised-jugglingdb` - it has been deprecated. Fixes #81.

1.3.0 / 2016-01-08
==================

New functionality
-----------------

  * Add Archive functionality
  * Add responsive breakpoints.
  * Add structured text layers
  * Add upload mapping API
  * Add Restore API
  * Add new USER_AGENT format - CloudinaryNodeJS/ver
  * Add Support for `aspect_ratio` transformation parameter
  * Add invalidate to explicit. Encode public_ids array with `[]` in URL. Replace cleanup code with TEST_TAG.
  * Add "invalidate" flag to rename
  * Add support invalidate=>true in explicit for social resources
  * Support uploading large files using the new Content-Range based upload API.

Other changes
-------------
  * Use `target_tags` instead of `tags` in tests.
  * Utilize spechelper
  * Add license to package, add Sinon.JS, update mocha
  * Increase timeout in tests.
  * Merge pull request #77 from joneslee85/consolidate-test-runner
  * get rid of Cakefile

1.2.6 / 2015-11-19
==================

  * Fix API timeout from 60ms to 60000ms

1.2.5 / 2015-10-14
==================

  * Add timeout to test. Compiled CoffeeScript and whitespace changes
  * Add dev dependency on `coffee-script`
  * Updated upload_large_stream tols return a stream and let the caller control the piping to it, similar to upload_stream.
  * fixes #65 - upload_large using chunk_size is corrupting data - also adds the very useful upload_large_stream function. upload_large tests now verify data integrity.
  * Add bower to the photo_album sample project.
  * Add CHANGELOG.md

1.2.4 / 2015-08-09
==================

  * Fix npmignore entries

1.2.3 / 2015-08-09
==================

  * Adding samples and test to .npmignore

1.2.2 / 2015-07-19
==================

  * Fix upload_large, change api signature to v2, update dependencies
  * Fix typo
  * Add tests to see if options are mutated
  * Update cloudinary.js to copy over options instead of mutating

1.2.1 / 2015-04-16
==================

  * Add and arrange `var` keywords. Edit video() documentation.
  * Better error handling of read stream errors

1.2.0 / 2015-04-07
==================

  * return delete token on direct upload in sample project
  * Reapply node 0.12 compatibility fix. Test minor cleanup
  * Correct use of _.extend
  * Support video tag generation. Support html5 attributes
  * Video support, underscore -> lodash, tests, zoom parameter, eager
  * Spelling, Tag fixes
  * Add video support
  * Fix issue with admin api on node >= 0.12
  * Override lodash's _.first to maintain compatibility with underscore version.
  * Change underscore to lodash
  * added lodash to package.json
  * compile changes after migrating from underscore to lodash
  * remove underscore from pacakge.json
  * update from underscore to lodash

1.1.2 / 2015-02-26
==================

  * Test fixes - resilient to test order change. Cleanup
  * Update coffeescript configuration
  * remove duplicate object key
  * remove duplicate object key
  * Support root path for shared CDN
  * added failed http.Agent test
  * override https agent
  * Allow request agent to be customized
  * fixed issue #42 Bug in samples/basic , api fully supports node.js stream api
  * Add method to generate a webhook signature.

1.1.1 / 2014-12-22
==================

  * invalidate in bulk deltes
  * after code review
  * precompiling coffeescript
  * all tests pass
  * fixed default type and public_id
  * utils cloudinary_url supports new signature & dns sharding
  * upload supports tags

1.1.0 / 2014-12-02
==================

  * Update README.md
  * Update README.md
  * fix #34 Upload stream does not support pipe

1.0.13 / 2014-11-09
===================

  * fixed #32 Reject promise for error codes https://github.com/cloudinary/cloudinary_npm/issues/32
  * bug fix
  * fixed #27 cloudinary.utils.sign_request doesn't read config properly

1.0.12 / 2014-08-28
===================

  * Skipping folder listing test in default
  * - support unsigned upload - redirect to upload form when no image was provided
  * comments
  * set explicit format (jpg)
  * moved image_upload_tag & cloudinary_js_config to view (ejs)
  * case fix
  * using Cloudinary gem to generate images and urls
  * - added cloudinary to response locals - added cloudinary configuration logging
  * ignoring bin directories (support node_monules .bin symlinks)
  * fixed v2 missing methods
  * - added root_folders & sub_folders management api + tests - fixed v2 module (requiring v2 would override v1) - fixed api promises reject a result with error attribute - added dotenv for test environment
  * ignoring bin folder
  * updated demo
  * node photo album
  * fix: changed to public api cloudinary.url
  * Fix mis-spell of deferred
  * added promise support
  * 2space indent
  * package description
  * basic samples + fix to v2 api
  * git ignore

1.0.11 / 2014-07-17
===================

  * Support custom_coordinates in upload, explicit and update, coordinates flag in resource details
  * Support return_delete_token flag in upload
  * Encode utf-8 when signing requests. Issue #20
  * Correctly encode parameters as utf8 in uploader API
  * Support node style callbacks and parameter order in cloudinary.v2.uploader and cloudinary.v2.api - issue #18
  * Support browserify via coffeeify.
