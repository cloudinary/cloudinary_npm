const { RETRY } = require('../testConstants');
const wait = require('./wait')

/**
 * Creates a proxy to retry the function call until it succeeds.
 * Custom retry function is used to be able to retry only assert-related
 * code segments of the tests and use delays between retries.
 *
 * @param {function} fn The function to retry.
 * @param {number} [limit=3] The number of attempts.
 * @param {number} [delay=1000] The delay between attempts, ms.
 *
 * @returns {function}
 */
module.exports = async function retry(fn, limit = RETRY.LIMIT, delay= RETRY.DELAY) {
  while (limit--) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (e) {
      if (!limit) {
        throw e;
      }
    }

    // eslint-disable-next-line no-await-in-loop
    await wait(delay)
  }
}
