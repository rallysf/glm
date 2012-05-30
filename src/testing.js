exports.GLM.testing = exports.GLM.testing || {};

exports.GLM.testing.fuzzyArrayEqual = function(lhs, rhs, tolerance) {
  if (!tolerance) { tolerance = 1e-4; }
  if (lhs.length != rhs.length) { return false; }
  for (var i = 0; i < lhs.length; i++) {
    if (Math.abs(lhs[i] - rhs[i]) > tolerance) {
      return false;
    }
  }
  return true;
};
