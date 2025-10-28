function allSettled(promises) {
  return Promise.all(
    promises.map((p = Promise.resolve()) => p.then((value) => ({ status: "fulfilled", value })).catch((reason) => ({ status: "rejected", reason }))
    )
  );
}

module.exports = allSettled;
