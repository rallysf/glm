exports.GLM.testing = exports.GLM.testing || {};

exports.GLM.testing.arrayEqual = function (lhs, rhs) {
  if (lhs.length != rhs.length) { return false;}
  for (var i = 0; i < lhs.length; i++) {
    if (lhs[i] != rhs[i]) {
      return false;
    }
  }
  return true;
};

exports.GLM.testing.fuzzyArrayEqual = function (lhs, rhs, tolerance) {
  if (!tolerance) { tolerance = 1e-4; }
  if (!exports.GLM.testing.arrayEqual(exports.GLM.utils.shape(lhs), exports.GLM.utils.shape(rhs))) { return false; }
  if (exports.GLM.utils.isArray(lhs[0])) {
    for (var i = 0; i < lhs.length; i++) {
      if (!exports.GLM.testing.fuzzyArrayEqual(lhs[i], rhs[i], tolerance)) {
        return false;
      }
    }
  } else {
    for (var i = 0; i < lhs.length; i++) {
      if (Math.abs(lhs[i] - rhs[i]) > tolerance) {
        return false;
      }
    }
  }
  return true;
};
