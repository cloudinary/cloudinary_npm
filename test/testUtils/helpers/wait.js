/**
 * @description Used when chained to promises, new Promise().then(wait(1000)).then(wait(2500)).then(log)
 * @param {number }ms
 * @return {function(...item): Promise<...item>}
 */
function wait(ms = 0) {
  return (...rest) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(...rest);
      }, ms);
    });
  }
}

module.exports = wait;
