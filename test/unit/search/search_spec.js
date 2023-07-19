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

  describe('to_url', () => {
    const cloudName = 'test-cloud';

    const commonUrlOptions = {
      secure: true,
      cloud_name: cloudName,
      api_secret: 'test-secret',
      api_key: 'test-key'
    };

    beforeEach(() => {
      cloudinary.v2.config(commonUrlOptions);
    });

    const expression = 'resource_type:image AND tags=kitten AND uploaded_at>1d AND bytes>1m';
    const search = cloudinary.v2.search.expression(expression).sort_by('public_id', 'desc').max_results('30');

    const encodedSearchPayload = 'eyJleHByZXNzaW9uIjoicmVzb3VyY2VfdHlwZTppbWFnZSBBTkQgdGFncz1raXR0ZW4gQU5EIH' +
      'VwbG9hZGVkX2F0PjFkIEFORCBieXRlcz4xbSIsIm1heF9yZXN1bHRzIjoiMzAiLCJzb3J0X2J5IjpbeyJwdWJsaWNfaWQiOiJkZXNjIn1dfQ==';
    const ttl300Sig = '4a239e6a6461eebb9ee48617245a1efb01d362dd8263f42861f92611491b47eb';
    const ttl1000Sig = '4bdf0749f71b875bea640ed037a0f809dd7498db1ef8d6e4231887eec88d9a2c';
    const defaultTtl = 300;
    const newTtl = 1000;

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
      const actual = search.to_url(undefined, 'next_cursor');
      const expected = `https://res.cloudinary.com/${cloudName}/search/${ttl300Sig}/${defaultTtl}/${encodedSearchPayload}/next_cursor`;
      expect(actual).to.eql(expected);
    });

    it('should build cached search url including next_cursor and ttl', () => {
      const actual = search.to_url(newTtl, 'next_cursor');
      const expected = `https://res.cloudinary.com/${cloudName}/search/${ttl1000Sig}/${newTtl}/${encodedSearchPayload}/next_cursor`;
      expect(actual).to.eql(expected);
    });

    it('should build cached search url including next_cursor and ttl set on instance', () => {
      const actual = search.next_cursor('next_cursor').ttl(newTtl).to_url();
      const expected = `https://res.cloudinary.com/${cloudName}/search/${ttl1000Sig}/${newTtl}/${encodedSearchPayload}/next_cursor`;
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
