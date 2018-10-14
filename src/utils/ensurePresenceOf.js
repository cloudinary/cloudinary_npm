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
  let missing = Object.entries(parameters).filter(param => param[1] === undefined);
  if (missing.length) {
    console.error(missing.map(p=>p[0]).join(',') + " cannot be undefined");
  }
}

module.exports = ensurePresenceOf;
