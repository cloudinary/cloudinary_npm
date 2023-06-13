const fs = require('fs');
const path = require('path');
const helper = require("../../spechelper");

const FileKeyValueStorage = require("../../../" + helper.libPath + "/cache/FileKeyValueStorage");

const KEY = "test_key";
const VALUE = "test_value";
const KEY2 = "test_key_2";
const VALUE2 = "test_value_2";

describe("FileKeyValueStorage", () => {
  var storage;
  var baseFolder;

  function getTestValue(key) {
    let storedValue = fs.readFileSync(storage.getFilename(key));
    return JSON.parse(storedValue);
  }

  before(() => {
    const cwd = process.cwd();
    const { sep } = path;
    baseFolder = fs.mkdtempSync(`${cwd}${sep}`);
    storage = new FileKeyValueStorage({ baseFolder });
  });

  after(() => {
    storage.deleteBaseFolder();
    expect(fs.existsSync(baseFolder)).to.be(false);
  });

  it("should set a value in a file", () => {
    storage.set(KEY, VALUE);
    let actual = getTestValue(KEY);
    expect(actual).to.eql(VALUE);
  });
  it("should get a value from a file", () => {
    storage.set(KEY, VALUE);
    let actual = storage.get(KEY);
    expect(actual).to.eql(VALUE);
  });
  it("should remove all files", () => {
    storage.set(KEY, VALUE);
    storage.set(KEY2, VALUE2);
    expect(storage.getFilename(KEY)).not.to.eql(storage.getFilename(KEY2));
    let actual = fs.existsSync(storage.getFilename(KEY)) && fs.existsSync(storage.getFilename(KEY2));
    expect(actual).to.be.ok();
    storage.clear();
    actual = fs.existsSync(storage.getFilename(KEY)) || fs.existsSync(storage.getFilename(KEY2));
    expect(actual).not.to.be.ok();
  });
});
