exports.utils = exports.utils || {};

exports.utils.checkConvergence = function (newWeights, oldWeights, iterations, maxIterations) {
  var change = 0.0, tol = 1e-8;
  newWeights.map(function(x, i) { change += Math.pow(x - oldWeights.e(i), 2); });
  return change < tol || (iterations > maxIterations);
};

exports.utils.softThreshold = function (z, gamma) {
  var z_abs = Math.abs(z);
  if (gamma < z_abs) {
    if (z > 0) {
      return z - gamma;
    } else {
      return z + gamma;
    }
  } else {
    return 0;
  }
};

exports.utils.zeros = function (n_zeros) {
  var vector = [];
  for (var i = 0; i < n_zeros; i++) { vector.push(0); }
  return vector;
};
