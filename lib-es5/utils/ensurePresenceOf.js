"use strict";

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
  var missing = Object.entries(parameters).filter(function (param) {
    return param[1] === undefined;
  });
  if (missing.length) {
    console.error(missing.map(function (p) {
      return p[0];
    }).join(',') + " cannot be undefined");
  }
}

module.exports = ensurePresenceOf;