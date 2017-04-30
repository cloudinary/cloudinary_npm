api = require('./api')
_ = require('lodash')

class Search
  constructor: ()->
    @query_hash = {sort_by: [], aggregate: [], with_field: []}

  @instance: ()->
    new Search

  @expression: (value)->
    @instance().expression(value)

  @max_results: (value)->
    @instance().max_results(value)

  @next_cursor: (value)->
    @instance().next_cursor(value)

  @aggregate: (value)->
    @instance().aggregate(value)

  @with_field: (value)->
    @instance().with_field(value)

  @sort_by: (field_name, dir = 'asc')->
    @instance().sort_by(field_name, dir)

  expression: (value)->
    @query_hash.expression = value
    this

  max_results: (value)->
    @query_hash.max_results = value
    this

  next_cursor: (value)->
    @query_hash.next_cursor = value
    this

  aggregate: (value)->
    @query_hash.aggregate.push(value)
    this

  with_field: (value)->
    @query_hash.with_field.push(value)
    this

  sort_by: (field_name, dir = "desc")->
    sort_bucket = {}
    sort_bucket[field_name] = dir
    @query_hash.sort_by.push(sort_bucket)
    this

  to_query: ()->
    for k,v of @query_hash
      delete @query_hash[k] if !_.isNumber(v) && _.isEmpty(v)
    @query_hash

  execute: (options, callback)->
    if callback == null
      callback = options
    options ||= {}
    api.search(this.to_query(), options, callback)

module.exports = Search
