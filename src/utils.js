exports.utils = exports.utils || {};

exports.utils.mean = function (vector) {
  var sum = 0.0;
  for (var i = 0; i < vector.length; i++) { sum += vector[i]; }
  return sum / vector.length;
};

exports.utils.checkConvergence = function (newDev, oldDev, iterations, maxIterations) {
  var tol = 1e-8;
  return (oldDev != null && (Math.abs(newDev - oldDev) < tol)) || (iterations > maxIterations);
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

exports.utils.makeArray = function (n_zeros, initialValue) {
  var vector = [];
  for (var i = 0; i < n_zeros; i++) { vector.push(initialValue); }
  return vector;
};

exports.utils.zeros = function (n_zeros) {
  return exports.utils.makeArray(n_zeros, 0);
};

exports.utils.map = function (ary, fn) {
  var out = [];
  for (var i = 0; i < ary.length; i++) {
    out.push(fn(ary[i], i));
  }
  return out;
};

exports.utils.atleast_2d = function (ary) {
  // will make sure JS array is at least 2 dimensional
  if (ary[0].constructor == Array) {
    return ary;
  } else {
    return exports.utils.map(ary, function (x) { return [x]; });
  }
};

exports.utils.add_constant = function (ary) {
  exports.utils.map(ary, function (x) { x.push(1);});
  return ary;
};
