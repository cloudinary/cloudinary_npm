const applyQCompat = require("../../../lib/utils/qPolyfill");

function allSettled(promises) {
  const settled = Promise.all(
    (promises || []).map((p) => Promise.resolve(p)
      .then((value) => ({ status: "fulfilled", value }))
      .catch((reason) => ({ status: "rejected", reason })))
  );
  return applyQCompat(settled);
}

module.exports = allSettled;
