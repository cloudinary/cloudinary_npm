const helper = require("../../spechelper");
const DummyCacheStorage = require('./DummyCacheStorage');
const KeyValueCacheAdapter = require(`../../../${helper.libPath}/cache/KeyValueCacheAdapter`);

var cache;
var parameters = ["public_id", "upload", "image", "w_100", "jpg"];
var value = [100, 200, 300, 399];
var parameters2 = ["public_id2", "fetch", "image", "w_200", "png"];
var value2 = [101, 201, 301, 398];

describe("KeyValueCacheAdapter", () => {
  before(() => {
    cache = new KeyValueCacheAdapter(new DummyCacheStorage());
  });
  it("should generate cache keys", () => {
    [
      [ // valid values
        "467d06e5a695b15468f9362e5a58d44de523026b",
        ["public_id", "upload", "image", "w_100", "jpg"]
      ],
      [ // allow empty values
        "1576396c59fc50ac8dc37b75e1184268882c9bc2",
        ["public_id", "upload", "image", null, null]
      ]
    ].forEach(([key, args]) => {
      expect(KeyValueCacheAdapter.generateCacheKey.apply(this, args)).to.eql(key);
    });
  });
  it("should set and get values", () => {
    cache.set(...parameters, value);
    let actualValue = cache.get(...parameters);

    expect(actualValue).to.eql(value);
  });
  it("should delete values from the cache", () => {
    cache.set(...parameters, value);
    let actualValue = cache.get(...parameters);
    expect(actualValue).to.eql(value);
    cache.delete(...parameters);
    actualValue = cache.get(...parameters);
    expect(actualValue).to.be(null);
  });
  it("should flush all entries from cache", () => {
    cache.set(...parameters, value);
    cache.set(...parameters2, value2);
    cache.flushAll();
    let deletedValue = cache.get(...parameters);
    let deletedValue2 = cache.get(...parameters2);
    expect(deletedValue).to.be(null);
    expect(deletedValue2).to.be(null);
  });
});
