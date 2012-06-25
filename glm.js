(function(exports){
exports.GLM = function (family) {
  /* Set defaults */
  // default family is Gaussian (linear model)
  if (!family) { family = exports.GLM.families.Gaussian(); }

  // the returned model
  var model = {};
  model.family = family;
  model.weights = null; 
  model.fit = function (endogenous, exogenous) {
    exogenous = constantize(exogenous);
    model.weights = exports.GLM.optimization.IRLS(endogenous, exogenous, model.family);
    return this;
  };
  model.predict = function (exogenous) {
    exogenous = constantize(exogenous)
    var linear = exports.GLM.utils.dot(exogenous, model.weights);
    return model.family.fitted(linear);
  };
  return model;
};

exports.GLM.ElasticNet = function (parameters) {
  /* Set defaults */
  // default family is Gaussian (linear model)
  parameters = elastic_net_parameters(parameters);

  // the returned model
  var model = {};
  model.family = parameters.family;
  model.elastic_net_parameter = parameters.elastic_net_parameter;
  model.learning_rate = parameters.learning_rate;
  model.weights = null; 
  model.fit = function (endogenous, exogenous) {
    model.data = constantize(exogenous);
    model.target = endogenous;
    model.weights = exports.GLM.optimization.CoordinateDescent(model.target, model.data, model.learning_rate, model.elastic_net_parameter);
    return this;
  };
  model.predict = function (exogenous) {
    exogenous = constantize(exogenous)
    var linear = exports.GLM.utils.dot(exogenous, model.weights);
    return model.family.fitted(linear);
  };
  return model;
};

exports.GLM.Lasso = function (parameters) {
  if (!parameters) { parameters = {}; }
  parameters.elastic_net_parameter = 1.0;
  return exports.GLM.ElasticNet(parameters);
};

exports.Ridge = function (family) {
  if (!parameters) { parameters = {}; }
  parameters.elastic_net_parameter = 0.0;
  return exports.GLM.ElasticNet(parameters);
};

function elastic_net_parameters(custom_parameters) {
  var params = {
    'learning_rate': 1.0,
    'elastic_net_parameter': 0.5,
    'family': exports.GLM.families.Gaussian()
  };
  for (var key in custom_parameters) {
    params[key] = custom_parameters[key];
  }
  return params;
}

function constantize(exogenous) {
  if (!exports.GLM.utils.isArray(exogenous[0])) { 
    exogenous = exports.GLM.utils.transpose(exports.GLM.utils.atleast_2d(exogenous));
  }
  return exports.GLM.utils.add_constant(exogenous);
}

/******************************************************************\
For an m-by-n matrix A with m >= n, the Thin Singular Value Decomposition
(See: http://en.wikipedia.org/wiki/Singular_value_decomposition#Thin_SVD )
returns:
- an m-by-n matrix U with orthogonal columns, 
- an n-by-n diagonal matrix S, 
- and an n-by-n orthogonal matrix V 
such that A = U*S*V'. (here V' indicates the transposed of V)

The function thinsvd(A), for m >=n, returns an array containing:
- an m x n bidimensional array U with orthogonal columns
- an m-sized unidimensional array containing the n singular values, sorted in descending order
- an n x n bidimensional orthogonal array containing V (NOTE: _not_ V' as NumPy's linalg.svd(A,full_matrices=0) does!!)
If m < n, it returns an array containing:
- an m x m bidimensional array containing U 
- an m-sized unidimensional array containing the n singular values, sorted in descending order
- an m x n bidimensional array V with orthogonal columns

The Singular Values s[] allow to compute the following values of the input argument: 
- Two norm l2n = s[0]
- Condition number cn = l2n / s[Math.min(m,n)-1]
- Rank r = number of singular values larger than cn * eps, 
      (eps being 2.22E-16 i.e. Math.pow(2.0,-52.0)
      
With square random matrices, complexity grows as O(n^3)
Decomposing a 100x100 matrix typically takes, with a 
single-core 1.7GHz Pentium M:
- Chrome 3.0.195.27: 880 ms
- Firefox 3.5.4: 950 ms 
- Safari 4.0.3: 1,360 ms
- MSIE 8.0: 9,554 ms (and three "slow script" warnings)
\******************************************************************/

var hypot = function(a, b) {
    var at = Math.abs(a);
    var bt = Math.abs(b);
    var q;
    if( at > bt ) {
        q = bt / at;
        return at * Math.sqrt( 1.0 + q*q );
    } else {
        if ( bt > 0.0 ){
            q = at / bt;
            return bt * Math.sqrt( 1.0 + q*q );
        } else {
            return 0.0;
        }
    }
};

exports.GLM.thinsvd = function (A) {

    // Derived from JAMA public domain code: http://math.nist.gov/javanumerics/jama/
    var i, j, k, t, f, g, cs, sn; 
    var lowrise = (A.length < A[0].length);  // if true, then rows < columns. in that case, transpose A and exchange U and V on return

    // make a copy, so the original matrix will be preserved 
    var AT = [];
    if(lowrise) {
        for(i=0; i<A[0].length; i++) {
            AT[i] = [];
            for(j=0; j<A.length; j++) {
                    AT[i][j] = A[j][i]; // swap rows with columns
            }
        }
    } else {
        for(i=0; i<A.length; i++) {
            AT[i] = [];
            for(j=0; j<A[0].length; j++) {
                    AT[i][j] = A[i][j]; // swap rows with columns
            }
        }
    }
    A = AT;
    
    var m = A.length;
    var n = A[0].length;

    var nu = Math.min(m,n);
    var s = [];
    var U = [];
    for(i=0; i<m; i++) {
        U[i] = [];
        for(j=0; j<n; j++) {
            U[i][j] = 0.;
        }
    }

    var V = [];
    for(i=0; i<n; i++) {
        V[i] = [];
    }

    var e = [];
    var work = [];
    var wantu = true;
    var wantv = true;

    // Reduce A to bidiagonal form, storing the diagonal elements
    // in s and the super-diagonal elements in e.

    var nct = Math.min(m-1,n);
    var nrt = Math.max(0,Math.min(n-2,m));
    for (k = 0; k < Math.max(nct,nrt); k++) {
    if (k < nct) {
        // Compute the transformation for the k-th column and
        // place the k-th diagonal in s[k].
        // Compute 2-norm of k-th column without under/overflow.
        s[k] = 0;
        for (i = k; i < m; i++) {
            s[k] = hypot(s[k],A[i][k]);
        }
        if (s[k] !== 0.0) {
        if (A[k][k] < 0.0) {
            s[k] = -s[k];
        }
        for (i = k; i < m; i++) {
            A[i][k] /= s[k];
        }
            A[k][k] += 1.0;
        }
            s[k] = -s[k];
        }

        for (j = k+1; j < n; j++) {
            if ((k < nct) && (s[k] !== 0.0))  {

                // Apply the transformation.

                t = 0;
                for (i = k; i < m; i++) {
                    t += A[i][k]*A[i][j];
                }
                t = -t/A[k][k];
                for (i = k; i < m; i++) {
                    A[i][j] += t*A[i][k];
                }
            }

            // Place the k-th row of A into e for the
            // subsequent calculation of the row transformation.

            e[j] = A[k][j];
        }

        if (wantu && (k < nct)) {
            // Place the transformation in U for subsequent back
            // multiplication.
            for (i = k; i < m; i++) {
                U[i][k] = A[i][k];
            }
        }

        if (k < nrt) {
            // Compute the k-th row transformation and place the
            // k-th super-diagonal in e[k].
            // Compute 2-norm without under/overflow.
            e[k] = 0;
            for (i = k+1; i < n; i++) {
                e[k] = hypot(e[k],e[i]);
            }

            if (e[k] !== 0.0) {
                if (e[k+1] < 0.0) {
                    e[k] = -e[k];
                }
                for (i = k+1; i < n; i++) {
                    e[i] /= e[k];
                }
                e[k+1] += 1.0;
            }

            e[k] = -e[k];

            if ((k+1 < m) && (e[k] !== 0.0)) {
                // Apply the transformation.

                for (i = k+1; i < m; i++) {
                    work[i] = 0.0;
                }
                for (j = k+1; j < n; j++) {
                    for (i = k+1; i < m; i++) {
                        work[i] += e[j]*A[i][j];
                    }
                }
                for (j = k+1; j < n; j++) {
                    t = -e[j]/e[k+1];
                    for (i = k+1; i < m; i++) {
                        A[i][j] += t*work[i];
                    }
                }
            }

            if (wantv) {
                // Place the transformation in V for subsequent
                // back multiplication.
                for (i = k+1; i < n; i++) {
                    V[i][k] = e[i];
                }
            }
        }
    }

    // Set up the final bidiagonal matrix or order p.
    var p = Math.min(n,m+1);
    if (nct < n) {
        s[nct] = A[nct][nct];
    }
    if (m < p) {
        s[p-1] = 0.0;
    }
    if (nrt+1 < p) {
        e[nrt] = A[nrt][p-1];
    }
    e[p-1] = 0.0;

    // If required, generate U.

    if (wantu) {
        for (j = nct; j < nu; j++) {
            for (i = 0; i < m; i++) {
                U[i][j] = 0.0;
            }
            U[j][j] = 1.0;
        }
        for (k = nct-1; k >= 0; k--) {
            if (s[k] !== 0.0) {
                for (j = k+1; j < nu; j++) {
                    t = 0;
                    for (i = k; i < m; i++) {
                        t += U[i][k]*U[i][j];
                    }
                    t = -t/U[k][k];
                    for (i = k; i < m; i++) {
                        U[i][j] += t*U[i][k];
                    }
                }
                for (i = k; i < m; i++ ) {
                    U[i][k] = -U[i][k];
                }
                U[k][k] = 1.0 + U[k][k];
                for (i = 0; i < k-1; i++) {
                    U[i][k] = 0.0;
                }
            } else {
                for (i = 0; i < m; i++) {
                    U[i][k] = 0.0;
                }
                U[k][k] = 1.0;
            }
        }
    }

    // If required, generate V.

    if (wantv) {
        for (k = n-1; k >= 0; k--) {
            if ((k < nrt) && (e[k] !== 0.0)) {
                for (j = k+1; j < nu; j++) {
                    t = 0;
                    for (i = k+1; i < n; i++) {
                        t += V[i][k]*V[i][j];
                    }
                    t = -t/V[k+1][k];
                    for (i = k+1; i < n; i++) {
                        V[i][j] += t*V[i][k];
                    }
                }
            }
            for (i = 0; i < n; i++) {
                V[i][k] = 0.0;
            }
            V[k][k] = 1.0;
        }
    }

    // Main iteration loop for the singular values.

    var pp = p-1;
    var iter = 0;
    var totiter = 0;
    var eps =  2.2205E-16; // Math.pow(2.0,-52.0);
    var tiny = 1.6034E-291; // Math.pow(2.0,-966.0);
    while (p > 0) {
        var kase;

        // Here is where a test for too many iterations would go.

        // This section of the program inspects for
        // negligible elements in the s and e arrays.  On
        // completion the variables kase and k are set as follows.

        // kase = 1     if s(p) and e[k-1] are negligible and k<p
        // kase = 2     if s(k) is negligible and k<p
        // kase = 3     if e[k-1] is negligible, k<p, and
        //              s(k), ..., s(p) are not negligible (qr step).
        // kase = 4     if e(p-1) is negligible (convergence).

        for (k = p-2; k >= -1; k--) {
            if (k == -1) {
                break;
            }
            if (Math.abs(e[k]) <= tiny + eps*(Math.abs(s[k]) + Math.abs(s[k+1]))) {
                e[k] = 0.0;
                break;
            }
        }

        if (k == p-2) {
            kase = 4;
        } else {
            var ks;
            for (ks = p-1; ks >= k; ks--) {
                if (ks == k) {
                    break;
                }
                t = (ks != p ? Math.abs(e[ks]) : 0.0) + (ks != k+1 ? Math.abs(e[ks-1]) : 0.0);
                if (Math.abs(s[ks]) <= tiny + eps*t)  {
                    s[ks] = 0.0;
                    break;
                }
            }
            if (ks == k) {
                kase = 3;
            } else if (ks == p-1) {
                kase = 1;
            } else {
                kase = 2;
                k = ks;
            }
        }
        k++;

        // Perform the task indicated by kase.

        if(kase == 1) {
            // Deflate negligible s(p).
            f = e[p-2];
            e[p-2] = 0.0;
            for (j = p-2; j >= k; j--) {
                t = hypot(s[j],f);
                cs = s[j]/t;
                sn = f/t;
                s[j] = t;
                if (j != k) {
                    f = -sn*e[j-1];
                    e[j-1] = cs*e[j-1];
                }
                if (wantv) {
                    for (i = 0; i < n; i++) {
                        t = cs*V[i][j] + sn*V[i][p-1];
                        V[i][p-1] = -sn*V[i][j] + cs*V[i][p-1];
                        V[i][j] = t;
                    }
                }
            }
        } else if (kase == 2) {
            f = e[k-1];
            e[k-1] = 0.0;
            for (j = k; j < p; j++) {
                t = hypot(s[j],f);
                cs = s[j]/t;
                sn = f/t;
                s[j] = t;
                f = -sn*e[j];
                e[j] = cs*e[j];
                if (wantu) {
                    for (i = 0; i < m; i++) {
                        t = cs*U[i][j] + sn*U[i][k-1];
                        U[i][k-1] = -sn*U[i][j] + cs*U[i][k-1];
                        U[i][j] = t;
                    }
                }
            }
        } else if (kase == 3) {

            // Calculate the shift.

            var scale = Math.max(Math.max(Math.max(Math.max(
                Math.abs(s[p-1]),Math.abs(s[p-2])),Math.abs(e[p-2])),
                Math.abs(s[k])),Math.abs(e[k]));
            var sp = s[p-1]/scale;
            var spm1 = s[p-2]/scale;
            var epm1 = e[p-2]/scale;
            var sk = s[k]/scale;
            var ek = e[k]/scale;
            var b = ((spm1 + sp)*(spm1 - sp) + epm1*epm1)/2.0;
            var c = (sp*epm1)*(sp*epm1);
            var shift = 0.0;
            if ((b !== 0.0) || (c !== 0.0)) {
                shift = Math.sqrt(b*b + c);
                if (b < 0.0) {
                    shift = -shift;
                }
                shift = c/(b + shift);
            }
            f = (sk + sp)*(sk - sp) + shift;
            g = sk*ek;

            // Chase zeros.

            for (j = k; j < p-1; j++) {
                t = hypot(f,g);
                cs = f/t;
                sn = g/t;
                if (j != k) {
                    e[j-1] = t;
                }
                f = cs*s[j] + sn*e[j];
                e[j] = cs*e[j] - sn*s[j];
                g = sn*s[j+1];
                s[j+1] = cs*s[j+1];
                if (wantv) {
                    for (i = 0; i < n; i++) {
                        t = cs*V[i][j] + sn*V[i][j+1];
                        V[i][j+1] = -sn*V[i][j] + cs*V[i][j+1];
                        V[i][j] = t;
                    }
                }
                t = hypot(f,g);
                cs = f/t;
                sn = g/t;
                s[j] = t;
                f = cs*e[j] + sn*s[j+1];
                s[j+1] = -sn*e[j] + cs*s[j+1];
                g = sn*e[j+1];
                e[j+1] = cs*e[j+1];
                if (wantu && (j < m-1)) {
                    for (i = 0; i < m; i++) {
                        t = cs*U[i][j] + sn*U[i][j+1];
                        U[i][j+1] = -sn*U[i][j] + cs*U[i][j+1];
                        U[i][j] = t;
                    }
                }
            }
            e[p-2] = f;
            iter = iter + 1;
        } else if(kase == 4) {

            // Convergence.
            // Make the singular values positive.

            if (s[k] <= 0.0) {
                s[k] = (s[k] < 0.0 ? -s[k] : 0.0);
                if (wantv) {
                    for (i = 0; i <= pp; i++) {
                        V[i][k] = -V[i][k];
                    }
                }
            }

            // Order the singular values.

            while (k < pp) {
                if (s[k] >= s[k+1]) {
                    break;
                }
                t = s[k];
                s[k] = s[k+1];
                s[k+1] = t;
                if (wantv && (k < n-1)) {
                    for (i = 0; i < n; i++) {
                        t = V[i][k+1]; V[i][k+1] = V[i][k]; V[i][k] = t;
                    }
                }
                if (wantu && (k < m-1)) {
                    for (i = 0; i < m; i++) {
                        t = U[i][k+1]; U[i][k+1] = U[i][k]; U[i][k] = t;
                    }
                }
                k++;
            }
            totiter += iter;
            iter = 0;
            p--;
        }
    }
    if(lowrise) {
        return [V,s,U,totiter];
    } else {
        return [U,s,V,totiter];
    }
    /*
        Two norm: s[0] 
        Two norm condition number: s[0]/s[Math.min(m,n)-1]
        Rank:
            function rank (s) {
              var eps = 2.22E-16; // Math.pow(2.0,-52.0);
              tol = Math.max(m,n)*s[0]*eps;
              var r = 0;
              for (i = 0; i < s.length; i++) {
                 if (s[i] > tol) {
                    r++;
                 }
              }
              return r;
            }
        
    */
}
exports.GLM.version = "1.0.0";
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
  function xisNaN(x) {
    return x.toString() == 'NaN';
  }
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
      if (xisNaN(lhs[i]) || xisNaN(rhs[i])) {
        return false;
      }
      if (Math.abs(lhs[i] - rhs[i]) > tolerance) {
        return false;
      }
    }
  }
  return true;
};
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

exports.GLM.utils.sum = function (array) {
  var s = array[0];
  for (var i = 1; i < array.length; i++) {
    s += array[i];
  }
  return s;
};

exports.GLM.utils.sign = function (f) {
  if (f == 0.0) {
    return 0;
  } else if (f > 0) {
    return 1.0;
  } else {
    return -1.0;
  }
};

exports.GLM.utils.norminf = function (array) {
  // will return infinity norm of input array
  var a = [];
  for (var i = 0; i < array.length; i++) {
    a.push(Math.abs(array[i]));
  }
  return Math.max(a);
};

exports.GLM.utils.norm2 = function (array) {
  // will return 2 norm of input array
  var a = 0.0;
  for (var i = 0; i < array.length; i++) {
    a += Math.pow(array[i], 2);
  }
  return Math.sqrt(a);
};

exports.GLM.utils.norm1 = function (array) {
  // will return 1 norm of input array
  var a = 0.0;
  for (var i = 0; i < array.length; i++) {
    a += Math.abs(array[i]);
  }
  return a;
};

exports.GLM.utils.sub = function (A, B) {
  // pairwise subtraction of two vectors
  var r = [];
  for (var i = 0; i < A.length; i++) {
    r.push(A[i] - B[i]);
  }
  return r;
};

exports.GLM.utils.scalarmul = function (x, A) {
  // multiply scalar to vector
  return exports.GLM.utils.map(A, function(a) { return x * a; });
};
exports.GLM.families = exports.GLM.families || {};

exports.GLM.families.Binomial = function (link) {
  // default to logit
  if (!link) { link = exports.GLM.links.Logit(); }

  model = {};

  model.initialMu = function (y) {
    var init = [];
    for (var i = 0; i < y.length; i++) { init.push((y[i] + 0.5) / 2); }
    return init;
  };

  model.deviance = function(endogenous, mu) {
    // formula for binomial deviance
    // 2 * sum{i \in y,mu}(log(Y/mu) + (n-Y)*log((n-Y)/(n-mu)))
    var dev = 0.0; 
    for (var i = 0; i < mu.length; i++) {
      var one = endogenous[i] == 1 ? 1 : 0; 
      dev += one * Math.log(mu[i] + 1e-200) + (1 - one) * Math.log(1 - mu[i] + 1e-200);
    }
    return 2 * dev;
  };

  // assign input link function
  model.link = link;
  model.predict = function (mu) {
    return model.link(mu);
  };
  model.weights = function (mu) {
    function fix(z) { if (z < 1e-10) { return 1e-10; } else { if (z > (1 - 1e-10)) { return 1 - 1e-10; } else { return z; } } }
    var variance = exports.GLM.utils.map(mu, function(m) { return fix(m) * (1 - fix(m)) ;} );
    return exports.GLM.utils.map(model.link.derivative(mu), function (m, i) { return 1.0 / (Math.pow(m, 2) * variance[i] ); });
  };
  model.fitted = function (eta) {
    return model.link.inverse(eta);
  };
  return model;
};

exports.GLM.families.Gaussian = function (link) {
  // default to identity link function
  if (!link) { link = exports.GLM.links.Identity(); }
  var model = {};

  model.deviance = function (endogenous, mu) {
    var dev = 0.0;
    for (var i = 0; i < endogenous.length; i++) {
      dev += Math.pow(endogenous[i] - mu[i], 2);
    }
    return dev;
  };

  model.initialMu = function (y) {
    var y_mean = exports.GLM.utils.mean(y), mu = [];
    for (var i = 0; i < y.length; i++) { mu.push((y[i] + y_mean) / 2.0); }
    return mu;
  };

  model.link = link;
  model.predict = function (mu) {
    return model.link(mu);
  };
  model.weights = function (mu) {
    // TODO write test & cleanup
    var variance = exports.GLM.utils.makeArray(mu.length, 1);
    return exports.GLM.utils.map(model.link.derivative(mu), function (m, i) { return 1.0 / (Math.pow(m, 2) / variance[i] ); });
  };
  model.fitted = function (eta) {
    return model.link.inverse(eta);
  };
  return model;
};
exports.GLM.links = exports.GLM.links || {};

var linkBuilder = function (func, inv, deriv) {
  var f = function (P) { return exports.GLM.utils.map(P, func); }
  f.inverse = function (P) { return exports.GLM.utils.map(P, inv); }
  f.derivative = function (P) { return exports.GLM.utils.map(P, deriv); }
  return f;
};

exports.GLM.links.Logit = function () {
  var f = function (P) { return exports.GLM.utils.map(P, function (p) { return Math.log(p / (1.0 - p)); }) };
  f.inverse = function (P) { return exports.GLM.utils.map(P, function (p) { var t = Math.exp(p); return t / (1.0 + t); }); };
  f.derivative = function (P) { return exports.GLM.utils.map(P, function (p) { return 1.0 / (p * (1.0 - p)); }); };
  return f;
};

exports.GLM.links.Power = function (power) {
  var f = function (P) { return exports.GLM.utils.map(P, function (p) { return Math.pow(p, power); }); }
  f.inverse = function (P) { return exports.GLM.utils.map(P, function (p) { return Math.pow(p, 1.0 / power); }); }
  f.derivative = function (P) { return exports.GLM.utils.map(P, function (p) { return power * Math.pow(p, power - 1); }); }
  return f;
};

exports.GLM.links.Identity = function () {
  return exports.GLM.links.Power(1.0);
};

exports.GLM.links.Log = function () {
  var f = function (P) { return exports.GLM.utils.map(P, Math.log); }
  f.inverse = function (P) { return exports.GLM.utils.map(P, Math.exp); }
  f.derivative = function (P) { return exports.GLM.utils.map(P, function (p) { return 1.0 / p; }); }
  return f;
};

exports.GLM.links.NegativeBinomial = function (alpha) {
  var f = function (P) {
    return exports.GLM.utils.map(P, function (p) { return Math.log(p / (p + 1.0 / alpha)); });
  };
  f.inverse = function (P) {
    return exports.GLM.utils.map(P, function (p) { return Math.exp(p) / (alpha * (1 - Math.exp(p))); });
  }
  f.derivative = function (P) {
    return exports.GLM.utils.map(P, function (p) { return 1.0 / (p + alpha * Math.pow(p, 2)); });
  }
  return f;
};
exports.GLM.optimization = exports.optimization || {};

/* TODO: test this, support non-gaussian families */
exports.GLM.optimization.CoordinateDescent = function (endogenous,
                                                       exogenous,
                                                       learning_rate,
                                                       elastic_net_parameter,
                                                       maxIterations) {
  // initialize defaults
  if (!learning_rate) { learning_rate = 0.1; } // alpha
  if (!elastic_net_parameter) { elastic_net_parameter = 0.5; } // rho
  if (!maxIterations) { maxIterations = 1000; }

  var n_features = exogenous[0].length,
      n_samples = exogenous.length;

  var alpha = learning_rate * elastic_net_parameter * n_samples,
      beta = learning_rate * (1.0 - elastic_net_parameter) * n_samples;

  var converged = false,
      iteration = 0,
      weights = exports.GLM.utils.zeros(n_features),
      exogenousT = exports.GLM.utils.transpose(exogenous),
      column_norms = exports.GLM.utils.map(exogenousT, function (x) {
        return exports.GLM.utils.sum(exports.GLM.utils.map(x, function (xx) { return Math.pow(xx, 2); }));
      }),
      R = exports.GLM.utils.map(exports.GLM.utils.dot(exogenous, weights), function (v, i) { return endogenous[i] - v; }),
      tmp, d_w_max, d_w_ii, w_max, gap;

  var tol = 1e-4;
  tol = tol * Math.pow(exports.GLM.utils.norm2(endogenous), 2);
  while (!converged) {
    /* column iteration */
    for (var feature_id = 0; feature_id < n_features; feature_id++) {
      var w_ii = weights[feature_id];
      if (column_norms[feature_id] == 0.0) { continue; }
      if (w_ii != 0.0) {
        exports.GLM.utils.map(exogenousT[feature_id], function (x_ii, i) {
          R[i] += w_ii * x_ii;
        });
      }
      tmp = exports.GLM.utils.sum(exports.GLM.utils.map(exogenousT[feature_id], function (v, i) { return v * R[i]; }));

      weights[feature_id] = exports.GLM.utils.sign(tmp) * Math.max(Math.abs(tmp) - alpha, 0) / (column_norms[feature_id] + beta);

      exports.GLM.utils.map(exogenousT[feature_id], function (x_ii, i) {
        R[i] -= weights[feature_id] * x_ii;
      });
      d_w_ii = Math.abs(weights[feature_id] - w_ii);
      d_w_max = Math.max(d_w_ii, d_w_max);
      w_max = Math.max(w_max, Math.abs(weights[feature_id]));
    }
    iteration += 1;
    if (w_max == 0.0 || d_w_max / w_max < 1e-5 || iteration == maxIterations) {
      var dual_norm_XtA = exports.GLM.utils.norminf(exports.GLM.utils.sub(exports.GLM.utils.dot(exogenousT, R), exports.GLM.utils.scalarmul(beta, weights)));
      var R_norm = exports.GLM.utils.norm2(R);
      var w_norm = exports.GLM.utils.norm2(weights);
      if (dual_norm_XtA > alpha) {
        var c = alpha / dual_norm_XtA;
        var A_norm = R_norm * c;
        gap = 0.5 * (Math.pow(R_norm, 2) + Math.pow(A_norm, 2));
      } else {
        var c = 1.0;
        var gap = Math.pow(R_norm, 2);
        gap += alpha * exports.GLM.utils.norm1(weights) - exports.GLM.utils.scalarmul(c, exports.GLM.utils.dot(exports.GLM.utils.transpose(R), endogenous)) +  0.5 * beta * (1 + Math.pow(c, 2)) * (Math.pow(w_norm, 2));
      }
      converged = gap < tol || iteration == maxIterations;
    }
  }
  return weights;
};

exports.GLM.optimization.IRLS = function (endogenous,
                                          exogenous,
                                          family) {
  var converged = false,
      iterations = 0,
      maxIterations = 5,
      mu = family.initialMu(endogenous),
      eta = family.predict(mu),
      deviance = family.deviance(endogenous, mu),
      wlsResults = null,
      dataWeights = exports.GLM.utils.makeArray(endogenous.length, 1);

  while (!converged) {
    var weights = exports.GLM.utils.mul(dataWeights, family.weights(mu));
    oldDeviance = deviance;
    var ddot = 0.0,
        muprime = family.link.derivative(mu);
    var wlsEndogenous = exports.GLM.utils.map(eta, function(x, i) { return x + muprime[i] * (endogenous[i] - mu[i]); });
    wlsResults = exports.GLM.optimization.linearSolve(wlsEndogenous, exogenous, weights);
    eta = exports.GLM.utils.dot(exogenous, wlsResults);
    mu = family.fitted(eta);
    deviance = family.deviance(endogenous, mu);
    converged = exports.GLM.utils.checkConvergence(deviance, oldDeviance, iterations, maxIterations);
    iterations += 1;
  }
  return wlsResults;
};

exports.GLM.optimization.linearSolve = function (A, b, weights) {
  // linear solver using Moore-Penrose pseudoinverse SVD method
  function whiten(X, weights) {
    if (exports.GLM.utils.isArray(X[0])) {
      // 2d matrix
      return exports.GLM.utils.map(weights, function (w, i) { return exports.GLM.utils.map(X[i], function(z) { return Math.sqrt(w) * z; }); } );
    } else {
      return exports.GLM.utils.map(weights, function (w, i) { return Math.sqrt(w) * X[i]; });
    }
  }

  A = whiten(A, weights);
  b = whiten(b, weights);
  /* solve Ax=b for x using svd pseudoinverse */
  function project_and_invert(V) {
    var id_matrix = exports.GLM.utils.identity(V.length);
    for (var i = 0; i < V.length; i++) { id_matrix[i][i] /= V[i]; } 
    return id_matrix;
  }   
  var decomposition = exports.GLM.thinsvd(exports.GLM.utils.dot(exports.GLM.utils.transpose(b), b)),
      U = decomposition[0],
      S_inverse = project_and_invert(decomposition[1]),
      V = decomposition[2],
      psuedoinv = exports.GLM.utils.dot(U, exports.GLM.utils.dot(S_inverse, exports.GLM.utils.inverse(V))),
      solution = exports.GLM.utils.dot(exports.GLM.utils.dot(psuedoinv, exports.GLM.utils.transpose(b)), A);
  return solution;
}
})(this);
