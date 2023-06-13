const Q = require('q');
const cloudinary = require('../../../../cloudinary');
const helper = require("../../../spechelper");
const testConstants = require('../../../testUtils/testConstants');
const describe = require('../../../testUtils/suite');
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
  describe("unit", function () {
    it('should create empty json', function () {
      var query_hash = cloudinary.v2.search.instance().to_query();
      expect(query_hash).to.eql({});
    });
    it('should always return same object in fluent interface', function () {
      let instance = cloudinary.v2.search.instance();
      [
        'expression',
        'sort_by',
        'max_results',
        'next_cursor',
        'aggregate',
        'with_field'
      ].forEach(method => expect(instance).to.eql(instance[method]('emptyarg')));
    });
    it('should add expression to query', function () {
      var query = cloudinary.v2.search.expression('format:jpg').to_query();
      expect(query).to.eql({
        expression: 'format:jpg'
      });
    });
    it('should add sort_by to query', function () {
      var query = cloudinary.v2.search.sort_by('created_at', 'asc').sort_by('updated_at', 'desc').to_query();
      expect(query).to.eql({
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
    it('should add max_results to query', function () {
      var query = cloudinary.v2.search.max_results('format:jpg').to_query();
      expect(query).to.eql({
        max_results: 'format:jpg'
      });
    });
    it('should add next_cursor to query', function () {
      var query = cloudinary.v2.search.next_cursor('format:jpg').to_query();
      expect(query).to.eql({
        next_cursor: 'format:jpg'
      });
    });
    it('should add aggregate arguments as array to query', function () {
      var query = cloudinary.v2.search.aggregate('format').aggregate('size_category').to_query();
      expect(query).to.eql({
        aggregate: ['format', 'size_category']
      });
    });
    it('should add with_field to query', function () {
      var query = cloudinary.v2.search.with_field('context').with_field('tags').to_query();
      expect(query).to.eql({
        with_field: ['context', 'tags']
      });
    });
  });
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
          uploadResults.forEach(({ value }) => {
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

    it('Should eliminate duplicate fields when using sort_by, aggregate or with_fields', function () {
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
        .to_query();

      expect(search_query.aggregate.length).to.be(2);
      expect(search_query.with_field.length).to.be(2);
      expect(search_query.sort_by.length).to.be(1);

      expect(search_query.aggregate[0]).to.be('foo');
      expect(search_query.aggregate[1]).to.be('foo2');
      expect(search_query.with_field[0]).to.be('foo');
      expect(search_query.with_field[1]).to.be('foo2');

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
  });
});
