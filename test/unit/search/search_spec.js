const assert = require('assert');
const cloudinary = require('../../../cloudinary');

describe('Search', () => {
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
      'with_field',
      'fields'
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
    const query = cloudinary.v2.search.with_field('context').with_field('tags').to_query();
    expect(query).to.eql({
      with_field: ['context', 'tags']
    });
  });

  it('should allow adding multiple with_field values to query', function () {
    const query = cloudinary.v2.search.with_field(['context', 'tags']).to_query();
    expect(query).to.eql({
      with_field: ['context', 'tags']
    });
  });

  it('should remove duplicates with_field values from query', () => {
    const search = cloudinary.v2.search.with_field(['field1', 'field1', 'field2']);
    search.with_field('field1');
    search.with_field('field3');
    const query = search.to_query();
    expect(query).to.eql({
      with_field: ['field1', 'field2', 'field3']
    });
  });

  it('should add fields to query', function () {
    const query = cloudinary.v2.search.fields('context').fields('tags').to_query();
    expect(query).to.eql({
      fields: ['context', 'tags']
    });
  });

  it('should allow adding multiple fields values to query', function () {
    const query = cloudinary.v2.search.fields(['context', 'tags']).to_query();
    expect(query).to.eql({
      fields: ['context', 'tags']
    });
  });

  it('should remove duplicates fields values from query', () => {
    const search = cloudinary.v2.search.fields(['field1', 'field1', 'field2']);
    search.fields('field1');
    search.fields('field3');
    const query = search.to_query();
    expect(query).to.eql({
      fields: ['field1', 'field2', 'field3']
    });
  });

  it('should run without an expression', function () {
    assert.doesNotThrow(
      () => {
        cloudinary.v2.search.execute();
      }
    );
  });

  describe('to_url', () => {
    const cloudName = 'test123';

    const commonUrlOptions = {
      secure: true,
      cloud_name: cloudName,
      api_secret: 'secret',
      api_key: 'key'
    };

    beforeEach(() => {
      cloudinary.v2.config(commonUrlOptions);
    });

    const expression = 'resource_type:image AND tags=kitten AND uploaded_at>1d AND bytes>1m';
    const search = cloudinary.v2.search.expression(expression).sort_by('public_id', 'desc').max_results(30);

    const encodedSearchPayload = 'eyJleHByZXNzaW9uIjoicmVzb3VyY2VfdHlwZTppbWFnZSBBTkQgdGFncz1raXR0ZW4gQU5EIHVw' +
      'bG9hZGVkX2F0PjFkIEFORCBieXRlcz4xbSIsIm1heF9yZXN1bHRzIjozMCwic29ydF9ieSI6W3sicHVibGljX2lkIjoiZGVzYyJ9XX0=';
    const ttl300Sig = '431454b74cefa342e2f03e2d589b2e901babb8db6e6b149abf25bc0dd7ab20b7';
    const ttl1000Sig = '25b91426a37d4f633a9b34383c63889ff8952e7ffecef29a17d600eeb3db0db7';
    const defaultTtl = 300;
    const newTtl = 1000;
    const nextCursor = 'db27cfb02b3f69cb39049969c23ca430c6d33d5a3a7c3ad1d870c54e1a54ee0faa5acdd9f6d288666986001711759d10';

    it('should build cached search url', () => {
      const actual = search.to_url();
      const expected = `https://res.cloudinary.com/${cloudName}/search/${ttl300Sig}/${defaultTtl}/${encodedSearchPayload}`;
      expect(actual).to.eql(expected);
    });

    it('should build cached search url including ttl', () => {
      const actual = search.to_url(newTtl);
      const expected = `https://res.cloudinary.com/${cloudName}/search/${ttl1000Sig}/${newTtl}/${encodedSearchPayload}`;
      expect(actual).to.eql(expected);
    });

    it('should build cached search url including next_cursor', () => {
      const actual = search.to_url(undefined, nextCursor);
      const expected = `https://res.cloudinary.com/${cloudName}/search/${ttl300Sig}/${defaultTtl}/${encodedSearchPayload}/${nextCursor}`;
      expect(actual).to.eql(expected);
    });

    it('should build cached search url including next_cursor and ttl', () => {
      const actual = search.to_url(newTtl, nextCursor);
      const expected = `https://res.cloudinary.com/${cloudName}/search/${ttl1000Sig}/${newTtl}/${encodedSearchPayload}/${nextCursor}`;
      expect(actual).to.eql(expected);
    });

    it('should build cached search url including next_cursor and ttl set on instance', () => {
      const actual = search.next_cursor(nextCursor).ttl(newTtl).to_url();
      const expected = `https://res.cloudinary.com/${cloudName}/search/${ttl1000Sig}/${newTtl}/${encodedSearchPayload}/${nextCursor}`;
      expect(actual).to.eql(expected);
    });

    it('should build cached search url when private cdn configured', () => {
      cloudinary.v2.config({
        private_cdn: true
      });
      const actual = search.to_url(defaultTtl);
      const expected = `https://${cloudName}-res.cloudinary.com/search/${ttl300Sig}/${defaultTtl}/${encodedSearchPayload}`;
      expect(actual).to.eql(expected);
    });
  });
});
