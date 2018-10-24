const expect = require("expect.js");
const helper = require("../spechelper");

const fs = require('fs');
const path = require('path');
const FileKeyValueStorage = require("../../" + helper.libPath + "/cache/FileKeyValueStorage");
const KeyValueCacheAdapter = require("../../" + helper.libPath + "/cache/KeyValueCacheAdapter");
const cwd = process.cwd();
const KEY = "test_key";
const VALUE = "test_value";
const KEY2 = "test_key_2";
const VALUE2= "test_value_2";
var storage;
var tmpPath;
function getTestValue(key){
  let storedValue = fs.readFileSync(storage.getFilename(key));
  console.log("storedValue:", storedValue);
  return JSON.parse(storedValue);
}
describe("FileKeyValueStorage", ()=>{
  before(()=>{
    const { sep } = path;
    var tmpPath = fs.mkdtempSync(`${cwd}${sep}`);
    console.log("temp path:", tmpPath);
    storage = new FileKeyValueStorage(tmpPath);
  });
  it("should set a value in a file", ()=>{
    storage.set(KEY, VALUE);
    let actual = getTestValue(KEY);
    expect(actual).to.eql(VALUE);
  });
  it("should get a value from a file", ()=>{
    storage.set(KEY, VALUE);
    let actual = storage.get(KEY);
    expect(actual).to.eql(VALUE);
  });
  it("should remove all files", ()=>{
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