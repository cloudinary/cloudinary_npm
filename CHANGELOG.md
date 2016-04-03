
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
