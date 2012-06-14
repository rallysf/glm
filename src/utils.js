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
  for (var i = 0; i < n_zeros; i++) { vector.push(exports.GLM.utils.clone(initialValue)); }
  return vector;
};

exports.GLM.utils.zeros = function (n_zeros) {
  var currentFold;
  if (exports.GLM.utils.isArray(n_zeros)) {
    currentFold = exports.GLM.utils.makeArray(n_zeros[0], 0);
    for (var i = 1; i < n_zeros.length; i++) {
      currentFold = exports.GLM.utils.makeArray(n_zeros[i], currentFold);
    }
  } else {
    currentFold = exports.GLM.utils.makeArray(n_zeros, 0);
  }
  return currentFold;
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
  var r, aIsM = exports.GLM.utils.isArray(a[0]), bIsM = exports.GLM.utils.isArray(b[0]), n_rows = a.length, n_columns = b[0].length;
  if (aIsM & bIsM) { // both matrices
    r = exports.GLM.utils.zeros([n_columns, n_rows]);
    for (var i = 0; i < n_rows; i++) {
      for (var j = 0; j < n_columns; j++) {
        for (var k = 0; k < b.length; k++) {
          r[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return r;
  } else if (aIsM) {
    return exports.GLM.utils.transpose(exports.GLM.utils.dot(a, exports.GLM.utils.transpose([b])))[0];
  } else if (bIsM) {
    return exports.GLM.utils.dot([a], b);
  } else {
    r = 0.0;
    for (var i = 0; i < a.length; i++) {
      r += a[i] * b[i];
    }
    return r;
  }
};

exports.GLM.utils.shape = function (A) {
  if (exports.GLM.utils.isArray(A[0])) {
    return [A.length, A[0].length];
  } else {
    return [A.length];
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

exports.GLM.utils.identity = function (size) {
  var r = exports.GLM.utils.makeArray(size, exports.GLM.utils.makeArray(size, 0));
  for (var i = 0; i < size; i++) { r[i][i] = 1; }
  return r;
};

exports.GLM.utils.clone = function (obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = obj[attr];
    }
  }
  return copy;
};

exports.GLM.utils.mul = function (A, B) {
  return exports.GLM.utils.map(A, function (a, i) { return a * B[i]; });
};

exports.GLM.utils.inverse = function (matrix) {
  // taken from wikipedia
  var dimension = matrix.length, inverse = exports.GLM.utils.zeros([dimension, dimension]);
  for (var i = 0; i < dimension; i++) {
    for (var j = 0; j < dimension; j++) {
      inverse[i][j] = 0;
    }
  }
 
  for (var i = 0; i < dimension; i++) {
    inverse[i][i] = 1;
  }
 
  for (var k = 0; k < dimension; k++) {
    for (var i = k; i < dimension; i++) {
      var val = matrix[i][k];
      for (var j = k; j < dimension; j++) {
        matrix[i][j] /= val;
      }
      for (var j = 0; j < dimension; j++) {
        inverse[i][j] /= val;
      }
    }
    for (var i = k + 1; i < dimension; i++) {
      for (var j = k; j < dimension; j++) {
        matrix[i][j] -= matrix[k][j];
      }
      for (var j = 0; j < dimension; j++) {
        inverse[i][j] -= inverse[k][j];
      }
    }
  }
 
  for (var i = dimension - 2; i >= 0; i--) {
    for (var j = dimension - 1; j > i; j--) {
      for (var k = 0; k < dimension; k++) {
        inverse[i][k] -= matrix[i][j] * inverse[j][k]; 
      }
      for (var k = 0; k < dimension; k++) {
        matrix[i][k] -= matrix[i][j] * matrix[j][k]; 
      }
    }
  }
  return inverse;
};

exports.GLM.utils.linspace = function (lower, upper, number_of_steps) {
  var linear_array = [], step_size = (upper + 0.0 - lower) / number_of_steps;
  for (var i = 0; i < number_of_steps; i++) {
    linear_array.push(lower + i * step_size);
  }
  return linear_array;
}
