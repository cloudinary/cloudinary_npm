const registeredTests = {};

function registerReusableTest(name, testFn) {
  registeredTests[name] = testFn;
}

function callReusableTest(name, ...args) {
  registeredTests[name].apply(this, args);
}

module.exports = {registerReusableTest, callReusableTest};
