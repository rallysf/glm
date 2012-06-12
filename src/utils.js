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

exports.GLM.utils.isArray = function (potentialArray) {
  return potentialArray.constructor == Array;
};

exports.GLM.utils.atleast_2d = function (A) {
  // will make sure JS array is at least 2 dimensional
  // assumption is that 1-d vectors are column vectors
  if (exports.GLM.utils.isArray(A[0])) {
    return A;
  } else {
    return [A];
  }
};

exports.GLM.utils.add_constant = function (ary) {
  exports.GLM.utils.map(ary, function (x) { x.push(1);});
  return ary;
};

exports.GLM.utils.dot = function (a, b) {
  var r, aIsM = exports.GLM.utils.isArray(a[0]), bIsM = exports.GLM.utils.isArray(b[0]);
  console.log(" DOT ");
  console.log("a ", a);
  console.log("b ", b);
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
    return r;
  } else if (aIsM | bIsM) {
    return exports.GLM.utils.dot(exports.GLM.utils.atleast_2d(a), exports.GLM.utils.atleast_2d(b));
  } else {
    r = 0.0;
    for (var i = 0; i < a.length; i++) {
      r += a[i] * b[i];
    }
    return r;
  }
};

exports.GLM.utils.transpose = function (A) {
  var r = [];
  A = exports.GLM.utils.atleast_2d(A);
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
