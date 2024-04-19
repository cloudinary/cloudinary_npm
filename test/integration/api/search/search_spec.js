const Q = require('q');
const cloudinary = require('../../../../cloudinary');
const helper = require("../../../spechelper");
const testConstants = require('../../../testUtils/testConstants');
const describe = require('../../../testUtils/suite');
const exp = require("constants");
const cluster = require("cluster");
const assert = require("assert");
const {
  TIMEOUT,
  TAGS,
  PUBLIC_IDS,
  UNIQUE_JOB_SUFFIX_ID
} = testConstants;

const {
  PUBLIC_ID_1,
  PUBLIC_ID_2,
  PUBLIC_ID_3
} = PUBLIC_IDS;

const {
  UPLOAD_TAGS
} = TAGS;

const SEARCH_TAG = 'npm_advanced_search_' + UNIQUE_JOB_SUFFIX_ID;
const ASSET_IDS = [];

describe("search_api", function () {
  describe("integration", function () {
    this.timeout(TIMEOUT.LONG);
    before(function () {
      return Q.allSettled([
        cloudinary.v2.uploader.upload(helper.IMAGE_FILE,
          {
            public_id: PUBLIC_ID_1,
            tags: [...UPLOAD_TAGS,
              SEARCH_TAG],
            context: "stage=in_review"
          }),
        cloudinary.v2.uploader.upload(helper.IMAGE_FILE,
          {
            public_id: PUBLIC_ID_2,
            tags: [...UPLOAD_TAGS,
              SEARCH_TAG],
            context: "stage=new"
          }),
        cloudinary.v2.uploader.upload(helper.IMAGE_FILE,
          {
            public_id: PUBLIC_ID_3,
            tags: [...UPLOAD_TAGS,
              SEARCH_TAG],
            context: "stage=validated"
          })
      ]).delay(10000)
        .then((uploadResults) => {
          uploadResults.forEach(({value}) => {
            ASSET_IDS.push(value.asset_id);
          });
        });
    });

    after(function () {
      if (!cloudinary.config().keep_test_products) {
        let config = cloudinary.config();

        cloudinary.v2.api.delete_resources_by_tag(SEARCH_TAG);
      }
    });
    it(`should return all images tagged with ${SEARCH_TAG}`, function () {
      return cloudinary.v2.search.expression(`tags:${SEARCH_TAG}`)
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(3);
        });
    });
    it(`should return resource ${PUBLIC_ID_1}`, function () {
      return cloudinary.v2.search.expression(`public_id:${PUBLIC_ID_1}`)
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(1);
        });
    });

    it(`should allow search by exact asset_id`, function () {
      const [exampleAssetId] = ASSET_IDS;
      return cloudinary.v2.search.expression(`asset_id=${exampleAssetId}`)
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(1);
        });
    });

    it(`should allow search by tokenized asset_id`, function () {
      const [exampleAssetId] = ASSET_IDS;
      return cloudinary.v2.search.expression(`asset_id:${exampleAssetId}`)
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(1);
        });
    });

    it('should paginate resources limited by tag and orderd by ascing public_id', function () {
      return cloudinary.v2.search.max_results(1).expression(`tags:${SEARCH_TAG}`)
        .sort_by('public_id', 'asc')
        .execute().then(function (results) {
          expect(results.resources.length).to.eql(1);
          expect(results.resources[0].public_id).to.eql(PUBLIC_ID_1);
          expect(results.total_count).to.eql(3);
          return cloudinary.v2.search.max_results(1).expression(`tags:${SEARCH_TAG}`)
            .sort_by('public_id', 'asc')
            .next_cursor(results.next_cursor).execute();
        }).then(function (results) {
          expect(results.resources.length).to.eql(1);
          expect(results.resources[0].public_id).to.eql(PUBLIC_ID_2);
          expect(results.total_count).to.eql(3);
          return cloudinary.v2.search.max_results(1).expression(`tags:${SEARCH_TAG}`).sort_by('public_id', 'asc').next_cursor(results.next_cursor).execute();
        }).then(function (results) {
          expect(results.resources.length).to.eql(1);
          expect(results.resources[0].public_id).to.eql(PUBLIC_ID_3);
          expect(results.total_count).to.eql(3);
          expect(results).not.to.have.key('next_cursor');
        });
    });

    it('Should eliminate duplicate fields when using sort_by, aggregate, with_field or fields', function () {
      // This test ensures we can't push duplicate values into sort_by, aggregate or with_fields
      const search_query = cloudinary.v2.search.max_results(10).expression(`tags:${SEARCH_TAG}`)
        .sort_by('public_id', 'asc')
        .sort_by('public_id', 'asc')
        .sort_by('public_id', 'asc')
        .sort_by('public_id', 'asc')
        .sort_by('public_id', 'desc')
        .sort_by('public_id', 'desc')
        .aggregate('foo')
        .aggregate('foo')
        .aggregate('foo2')
        .with_field('foo')
        .with_field('foo')
        .with_field('foo2')
        .with_field(['foo', 'foo2', 'foo3'])
        .fields('foo')
        .fields('foo')
        .fields('foo2')
        .fields(['foo', 'foo2', 'foo3'])
        .to_query();

      expect(search_query.aggregate.length).to.be(2);
      expect(search_query.with_field.length).to.be(3);
      expect(search_query.fields.length).to.be(3);
      expect(search_query.sort_by.length).to.be(1);

      expect(search_query.aggregate[0]).to.be('foo');
      expect(search_query.aggregate[1]).to.be('foo2');
      expect(search_query.with_field[0]).to.be('foo');
      expect(search_query.with_field[1]).to.be('foo2');
      expect(search_query.with_field[2]).to.be('foo3');
      expect(search_query.fields[0]).to.be('foo');
      expect(search_query.fields[1]).to.be('foo2');
      expect(search_query.fields[2]).to.be('foo3');

      expect(search_query.sort_by[0].public_id).to.be('desc');
    });

    it('should include context', function () {
      return cloudinary.v2.search.expression(`tags:${SEARCH_TAG}`).with_field('context')
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(3);
          results.resources.forEach(function (res) {
            expect(Object.keys(res.context)).to.eql(['stage']);
          });
        });
    });
    it('should include context, tags and image_metadata', function () {
      return cloudinary.v2.search.expression(`tags:${SEARCH_TAG}`)
        .with_field('context')
        .with_field('tags')
        .with_field('image_metadata')
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(3);
          results.resources.forEach(function (res) {
            expect(Object.keys(res.context)).to.eql(['stage']);
            expect(res.image_metadata).to.be.ok();
            expect(res.tags.length).to.eql(4);
          });
        });
    });

    it('should only include selected keys when using fields', function () {
      return cloudinary.v2.search.expression(`tags:${SEARCH_TAG}`).fields('context')
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(3);
          results.resources.forEach(function (res) {
            const alwaysIncluded = ['public_id', 'asset_id', 'created_at', 'status', 'type', 'resource_type', 'folder'];
            const additionallyIncluded = ['context'];
            const expectedKeys = [...alwaysIncluded, ...additionallyIncluded];
            const actualKeys = Object.keys(res);
            assert.deepStrictEqual(actualKeys.sort(), expectedKeys.sort());
          });
        });
    });
  });
});
