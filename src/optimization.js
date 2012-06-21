exports.GLM.optimization = exports.optimization || {};

/* TODO: test this, support non-gaussian families */
exports.GLM.optimization.CoordinateDescent = function (exogenous,
                                                       endogenous,
                                                       learning_rate,
                                                       elastic_net_parameter,
                                                       maxIterations) {
  // initialize defaults
  /* TODO: find correct initial parameters */
  if (!learning_rate) { learning_rate = 0.1; } // alpha
  if (!elastic_net_parameter) { elastic_net_parameter = 0.9; } // rho
  if (!maxIterations) { maxIterations = 1000; }

  var n_features = endogenous[0].length,
      n_samples = endogenous.length;

  var alpha = learning_rate * elastic_net_parameter * n_samples,
      beta = learning_rate * (1.0 - elastic_net_parameter) * n_samples;

  var converged = false,
      iteration = 0,
      weights = exports.GLM.utils.zeros(n_features),
      endogenousT = exports.GLM.utils.transpose(endogenous),
      column_norms = exports.GLM.utils.map(endogenousT, function (x) {
        return exports.GLM.utils.sum(exports.GLM.utils.map(x, function (xx) { return Math.pow(xx, 2); }));
      }),
      R = exports.GLM.utils.map(exports.GLM.utils.dot(endogenous, weights), function (v, i) { return exogenous[i] - v; }),
      tmp, d_w_max, d_w_ii, w_max;

  while (!converged) {
    /* column iteration */
    for (var feature_id = 0; feature_id < n_features; feature_id++) {
      var w_ii = weights[feature_id];
      if (w_ii != 0.0) {
        exports.GLM.utils.map(endogenousT[feature_id], function (x_ii, i) {
          R[i] += w_ii * x_ii;
        });
      }
      tmp = exports.GLM.utils.sum(exports.GLM.utils.map(endogenousT[feature_id], function (v, i) { return v * R[i]; }));

      weights[feature_id] = exports.GLM.utils.sign(tmp) * Math.max(Math.abs(tmp) - alpha, 0) / (column_norms[feature_id] + beta);

      exports.GLM.utils.map(endogenousT[feature_id], function (x_ii, i) {
        R[i] -= weights[feature_id] * x_ii;
      });
      d_w_ii = Math.abs(weights[feature_id] - w_ii);
      d_w_max = Math.max(d_w_ii, d_w_max);
      w_max = Math.max(w_max, Math.abs(weights[feature_id]));
    }
    iteration += 1;
    converged = (w_max == 0.0 || d_w_max / w_max < 1e-5 || iteration == maxIterations);
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
