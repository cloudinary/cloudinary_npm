"use strict";

/**
 * Returns an ensureOption function that relies on the provided `defaults` argument
 * for default values.
 * @private
 * @param {object} defaults
 * @return {function(*, *, *=): *}
 */
function defaults(defaults) {
  return function ensureOption(options, name, defaultValue) {
    var value = options[name] || defaults[name] || defaultValue;
    if (value === undefined) {
      throw `Must supply ${name}`;
    }
    return value;
  };
}

/**
 * Get the option `name` from options, the global config, or the default value.
 * If the value is not defined and no default value was provided,
 * the method will throw an error.
 * @private
 * @param {object} options
 * @param {string} name
 * @param {*} [defaultValue]
 * @return {*} the value associated with the provided `name` or the default.
 *
 */
module.exports = defaults({});

module.exports.defaults = defaults;