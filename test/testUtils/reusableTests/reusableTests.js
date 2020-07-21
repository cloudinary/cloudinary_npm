const registeredTests = {};

function registerReusableTest(name, testFn) {
  registeredTests[name] = testFn;
}

function callReusableTest(name, testArgs) {
  registeredTests[name](testArgs);
}

module.exports = {
  callReusableTest
};


module.exports = {registerReusableTest, callReusableTest};
