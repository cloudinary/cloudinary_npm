var PUBLIC_ID, PUBLIC_ID_1, PUBLIC_ID_2, PUBLIC_ID_3, PUBLIC_ID_PREFIX, Q, SEARCH_TAG, SUFFIX, cloudinary, expect, helper;

require('dotenv').load({
  silent: true
});

expect = require('expect.js');

cloudinary = require('../cloudinary');

helper = require("./spechelper");

Q = require('q');

SUFFIX = helper.SUFFIX;

PUBLIC_ID_PREFIX = "npm_api_test";

PUBLIC_ID = PUBLIC_ID_PREFIX + SUFFIX;

PUBLIC_ID_1 = PUBLIC_ID + "_1";

PUBLIC_ID_2 = PUBLIC_ID + "_2";

PUBLIC_ID_3 = PUBLIC_ID + "_3";

SEARCH_TAG = 'npm_advanced_search_' + SUFFIX;

describe("search_api", function() {
  describe("unit", function() {
    it('should create empty json', function() {
      var query_hash;
      query_hash = cloudinary.v2.search.instance().to_query();
      return expect(query_hash).to.eql({});
    });
    it('should always return same object in fluent interface', function() {
      var i, instance, len, method, ref, results1, same_instance;
      instance = cloudinary.v2.search.instance();
      ref = ['expression', 'sort_by', 'max_results', 'next_cursor', 'aggregate', 'with_field'];
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        method = ref[i];
        same_instance = instance[method]('emptyarg');
        results1.push(expect(instance).to.eql(same_instance));
      }
      return results1;
    });
    it('should add expression to query', function() {
      var query;
      query = cloudinary.v2.search.expression('format:jpg').to_query();
      return expect(query).to.eql({
        expression: 'format:jpg'
      });
    });
    it('should add sort_by to query', function() {
      var query;
      query = cloudinary.v2.search.sort_by('created_at', 'asc').sort_by('updated_at', 'desc').to_query();
      return expect(query).to.eql({
        sort_by: [
          {
            created_at: 'asc'
          },
          {
            updated_at: 'desc'
          }
        ]
      });
    });
    it('should add max_results to query', function() {
      var query;
      query = cloudinary.v2.search.max_results('format:jpg').to_query();
      return expect(query).to.eql({
        max_results: 'format:jpg'
      });
    });
    it('should add next_cursor to query', function() {
      var query;
      query = cloudinary.v2.search.next_cursor('format:jpg').to_query();
      return expect(query).to.eql({
        next_cursor: 'format:jpg'
      });
    });
    it('should add aggregate arguments as array to query', function() {
      var query;
      query = cloudinary.v2.search.aggregate('format').aggregate('size_category').to_query();
      return expect(query).to.eql({
        aggregate: ['format', 'size_category']
      });
    });
    return it('should add with_field to query', function() {
      var query;
      query = cloudinary.v2.search.with_field('context').with_field('tags').to_query();
      return expect(query).to.eql({
        with_field: ['context', 'tags']
      });
    });
  });
  return describe("integration", function() {
    this.timeout(helper.TIMEOUT_LONG);
    before("Verify Configuration", function() {
      var config;
      config = cloudinary.config(true);
      if (!(config.api_key && config.api_secret)) {
        return expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
      }
    });
    before(function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      Q.allSettled([
        cloudinary.v2.uploader.upload(helper.IMAGE_FILE,
        {
          public_id: PUBLIC_ID_1,
          tags: [...helper.UPLOAD_TAGS,
        SEARCH_TAG],
          context: "stage=in_review"
        }),
        cloudinary.v2.uploader.upload(helper.IMAGE_FILE,
        {
          public_id: PUBLIC_ID_2,
          tags: [...helper.UPLOAD_TAGS,
        SEARCH_TAG],
          context: "stage=new"
        }),
        cloudinary.v2.uploader.upload(helper.IMAGE_FILE,
        {
          public_id: PUBLIC_ID_3,
          tags: [...helper.UPLOAD_TAGS,
        SEARCH_TAG],
          context: "stage=validated"
        })
      ]).finally(function() {
        return setTimeout(done, 3000); // wait for the server to update
      });
      return true;
    });
    after(function(done) {
      var config;
      this.timeout(helper.TIMEOUT_LONG);
      if (cloudinary.config().keep_test_products) {
        done();
      } else {
        config = cloudinary.config();
        if (!(config.api_key && config.api_secret)) {
          expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
        }
        cloudinary.v2.api.delete_resources_by_tag(SEARCH_TAG).finally(function() {
          return done();
        });
      }
      return true;
    });
    it(`should return all images tagged with ${SEARCH_TAG}`, function() {
      return cloudinary.v2.search.expression(`tags:${SEARCH_TAG}`).execute(function(err, results) {
        return expect(results['resources'].length).to.eql(3);
      });
    });
    it(`should return resource ${PUBLIC_ID_1}`, function() {
      return cloudinary.v2.search.expression(`public_id:${PUBLIC_ID_1}`).execute(function(err, results) {
        return expect(results['resources'].length).to.eql(1);
      });
    });
    it('should paginate resources limited by tag and orderd by ascing public_id', function() {
      var instance;
      instance = cloudinary.v2.search.max_results(1).expression(`tags:${SEARCH_TAG}`).sort_by('public_id', 'asc');
      return instance.execute(function(err, results) {
        expect(results['resources'].length).to.eql(1);
        expect(results['resources'][0]['public_id']).to.eql(PUBLIC_ID_1);
        expect(results['total_count']).to.eql(3);
        return cloudinary.v2.search.max_results(1).expression(`tags:${SEARCH_TAG}`).sort_by('public_id', 'asc').next_cursor(results['next_cursor']).execute(function(err, results) {
          expect(results['resources'].length).to.eql(1);
          expect(results['resources'][0]['public_id']).to.eql(PUBLIC_ID_2);
          expect(results['total_count']).to.eql(3);
          return cloudinary.v2.search.max_results(1).expression(`tags:${SEARCH_TAG}`).sort_by('public_id', 'asc').next_cursor(results['next_cursor']).execute(function(err, results) {
            expect(results['resources'].length).to.eql(1);
            expect(results['resources'][0]['public_id']).to.eql(PUBLIC_ID_3);
            expect(results['total_count']).to.eql(3);
            return expect(results).not.to.have.key('next_cursor');
          });
        });
      });
    });
    it('should include context', function() {
      return cloudinary.v2.search.expression(`tags:${SEARCH_TAG}`).with_field('context').execute(function(err, results) {
        var i, len, ref, res, results1;
        expect(results['resources'].length).to.eql(3);
        ref = results['resources'];
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          res = ref[i];
          results1.push(expect(Object.keys(res['context'])).to.eql(['stage']));
        }
        return results1;
      });
    });
    return it('should include context, tags and image_metadata', function() {
      return cloudinary.v2.search.expression(`tags:${SEARCH_TAG}`).with_field('context').with_field('tags').with_field('image_metadata').execute(function(err, results) {
        var i, len, ref, res, results1;
        expect(results['resources'].length).to.eql(3);
        ref = results['resources'];
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          res = ref[i];
          expect(Object.keys(res['context'])).to.eql(['stage']);
          expect(res.image_metadata).to.exist;
          results1.push(expect(res['tags'].length).to.eql(4));
        }
        return results1;
      });
    });
  });
});
