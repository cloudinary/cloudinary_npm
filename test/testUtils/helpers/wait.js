/**
 * @description Used when chained to promises, new Promise().then(wait(1000)).then(wait(2500)).then(log)
 * @param {number }ms
 * @return {function(...item): Promise<...item>}
 */
function wait(ms = 0) {
  return (value) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(value);
      }, ms);
    });
  }
}

module.exports = wait;
