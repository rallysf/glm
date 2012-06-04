exports.GLM.utils = exports.GLM.utils || {};

exports.GLM.utils.mean = function (vector) {
  var sum = 0.0;
  for (var i = 0; i < vector.length; i++) { sum += vector[i]; }
  return sum / vector.length;
};

exports.GLM.utils.checkConvergence = function (newDev, oldDev, iterations, maxIterations) {
  var tol = 1e-8;
  return (oldDev != null && (Math.abs(newDev - oldDev) < tol)) || (iterations > maxIterations);
};

exports.GLM.utils.softThreshold = function (z, gamma) {
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

exports.GLM.utils.makeArray = function (n_zeros, initialValue) {
  var vector = [];
  for (var i = 0; i < n_zeros; i++) { vector.push(initialValue); }
  return vector;
};

exports.GLM.utils.zeros = function (n_zeros) {
  return exports.GLM.utils.makeArray(n_zeros, 0);
};

exports.GLM.utils.map = function (ary, fn) {
  var out = [];
  for (var i = 0; i < ary.length; i++) {
    out.push(fn(ary[i], i));
  }
  return out;
};

exports.GLM.utils.atleast_2d = function (ary) {
  // will make sure JS array is at least 2 dimensional
  if (ary[0].constructor == Array) {
    return ary;
  } else {
    return exports.GLM.utils.map(ary, function (x) { return [x]; });
  }
};

exports.GLM.utils.add_constant = function (ary) {
  exports.GLM.utils.map(ary, function (x) { x.push(1);});
  return ary;
};

exports.GLM.utils.dot = function (a, b) {
  var r, aIsM = a[0].hasOwnProperty("length"), bIsM = b[0].hasOwnProperty("length");
  if (aIsM & bIsM) { // both matrices
    r = [];
    for (var i = 0; i < a.length; i++) {
      r[r.length] = exports.GLM.utils.zeros(b[0].length);
      for (var j = 0; j < b[0].length; j++) {
        for (var k = 0; k < a.length; k++) {
          r[i][j] += a[i][k] * b[k][j];
        }
      }
    }
  } else {
    r = 0.0;
    for (var i = 0; i < a.length; i++) {
      r += a[i] * b[i];
    }
  }
  return r;
};

exports.GLM.utils.transpose = function (A) {
  console.log(A.length);
  var r = [];
  for (var i = 0; i < A[0].length; i++) {
    r[i] = exports.GLM.utils.zeros(A.length);
  }
  for (var i = 0; i < A.length; i++) {
    for (var j = 0; j < A[0].length; j++) {
      r[j][i] = A[i][j];
    }
  }
  return r;
};
