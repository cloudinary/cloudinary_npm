"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Validate that the given values are defined
 * @private
 * @param {object} parameters where each key value pair is the name and value of the argument to validate.
 *
 * @example
 *
 *    function foo(bar){
 *      ensurePresenceOf({bar});
 *      // ...
 *    }
 */
function ensurePresenceOf(parameters) {
  var missing = (0, _keys2.default)(parameters).filter(function (key) {
    return parameters[key] === undefined;
  });
  if (missing.length) {
    console.error(missing.join(',') + " cannot be undefined");
  }
}

module.exports = ensurePresenceOf;