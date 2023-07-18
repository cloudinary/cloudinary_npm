const api = require('./api');
const config = require('../config');
const ensureOption = require('../utils/ensureOption').defaults(config());
const {
  isEmpty,
  isNumber,
  api_sign_request,
  compact_and_sort,
  compute_hash,
  build_distribution_domain,
  clear_blank
} = require('../utils');
const {DEFAULT_SIGNATURE_ALGORITHM} = require("../utils/consts");
const {sign} = require("crypto");
const {base64Encode} = require("../utils/encoding/base64Encode");

const Search = class Search {
  constructor() {
    this.query_hash = {
      sort_by: [],
      aggregate: [],
      with_field: []
    };
    this._ttl = 300;
  }

  static instance() {
    return new Search();
  }

  static expression(value) {
    return this.instance().expression(value);
  }

  static max_results(value) {
    return this.instance().max_results(value);
  }

  static next_cursor(value) {
    return this.instance().next_cursor(value);
  }

  static aggregate(value) {
    return this.instance().aggregate(value);
  }

  static with_field(value) {
    return this.instance().with_field(value);
  }

  static sort_by(field_name, dir = 'asc') {
    return this.instance().sort_by(field_name, dir);
  }

  static ttl(newTtl) {
    return this.instance().ttl(newTtl);
  }

  expression(value) {
    this.query_hash.expression = value;
    return this;
  }

  max_results(value) {
    this.query_hash.max_results = value;
    return this;
  }

  next_cursor(value) {
    this.query_hash.next_cursor = value;
    return this;
  }

  aggregate(value) {
    const found = this.query_hash.aggregate.find(v => v === value);

    if (!found) {
      this.query_hash.aggregate.push(value);
    }

    return this;
  }

  with_field(value) {
    const found = this.query_hash.with_field.find(v => v === value);

    if (!found) {
      this.query_hash.with_field.push(value);
    }

    return this;
  }

  sort_by(field_name, dir = "desc") {
    let sort_bucket;
    sort_bucket = {};
    sort_bucket[field_name] = dir;

    // Check if this field name is already stored in the hash
    const previously_sorted_obj = this.query_hash.sort_by.find((sort_by) => sort_by[field_name]);

    // Since objects are references in Javascript, we can update the reference we found
    // For example,
    if (previously_sorted_obj) {
      previously_sorted_obj[field_name] = dir;
    } else {
      this.query_hash.sort_by.push(sort_bucket);
    }

    return this;
  }

  ttl(newTtl) {
    if (isNumber(newTtl)) {
      this._ttl = newTtl;
      return this;
    }

    throw new Error('New TTL value has to be a Number.');
  }

  to_query() {
    Object.keys(this.query_hash).forEach((k) => {
      let v = this.query_hash[k];
      if (!isNumber(v) && isEmpty(v)) {
        delete this.query_hash[k];
      }
    });
    return this.query_hash;
  }

  execute(options, callback) {
    if (callback === null) {
      callback = options;
    }
    options = options || {};
    return api.search(this.to_query(), options, callback);
  }

  to_url(ttl, next_cursor, options = {}) {
    const apiSecret = 'api_secret' in options ? options.api_secret : config().api_secret;
    if (!apiSecret) {
      throw new Error('Must supply api_secret');
    }

    const signingAlgorithm = options.signature_algorithm || config().signature_algorithm || DEFAULT_SIGNATURE_ALGORITHM;

    const urlTtl = ttl || this._ttl;

    const query = this.to_query();

    let urlCursor = next_cursor;
    if (query.next_cursor && !next_cursor) {
      urlCursor = query.next_cursor;
      delete query.next_cursor;
    }

    let data = clear_blank(query);
    const encodedQuery = base64Encode(JSON.stringify(data));

    const urlPrefix = build_distribution_domain(options);

    const signature = compute_hash(`${urlTtl}${encodedQuery}${apiSecret}`, signingAlgorithm, 'hex');

    return urlCursor ? `${urlPrefix}/search/${signature}/${urlTtl}/${encodedQuery}/${urlCursor}` : `${urlPrefix}/search/${signature}/${urlTtl}/${encodedQuery}/`;
  }
};

module.exports = Search;
