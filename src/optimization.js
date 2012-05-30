exports.GLM.optimization = exports.optimization || {};

/* TODO: this is broken and incomplete
exports.optimization.CoordinateDescentPenalizedWeightedLeastSquares = function (endogenous, exogenous, gradientFunction, regularizationParameter, elasticnetParameter, maxIterations) {
  // initialize defaults
  if (!regularizationParameter) { regularizationParameter = 0.01; }
  if (!elasticnetParameter) { elasticnetParameter = 0.5; } // defaults to half lasso, half ridge
  if (!maxIterations) { maxIterations = 1000; }

  var converged = false,
      iteration = 0,
      n_features = endogenous[0].length;
      weights = exports.GLM.utils.zeros(endogenous[0].length);

  while (!converged) {
    var currentFeatureId = iteration % n_features,
        oldWeights = numeric.clone(weights),
        gradient = gradientFunction(endogenous, exogenous, weights, currentFeatureId, regularizationParameter, elasticnetParameter); // compute gradient along given axis

    weights[currentFeatureId] = gradient;

    iteration += 1;
    converged = exports.GLM.utils.checkConvergence(weights, oldWeights, iteration, maxIterations);
  }
  return weights;
};
*/

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
    var weights = numeric.mul(dataWeights, family.weights(mu));
    oldDeviance = deviance;
    var ddot = 0.0,
        muprime = family.link.derivative(mu);
    var wlsEndogenous = exports.GLM.utils.map(eta, function(x, i) { return x + muprime[i] * (endogenous[i] - mu[i]); });
    wlsResults = exports.GLM.optimization.linearSolve(wlsEndogenous, exogenous, weights);
    eta = numeric.dot(exogenous, wlsResults);
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
    if (X[0].hasOwnProperty('length')) {
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
    var id_matrix = numeric.identity(V.length);
    for (var i = 0; i < V.length; i++) { id_matrix[i][i] /= V[i]; } 
    return id_matrix;
  }   
  var decomposition = numeric.svd(numeric.dot(numeric.transpose(b), b)),
      U = decomposition.U,
      S_inverse = project_and_invert(decomposition.S),
      V = decomposition.V,
      psuedoinv = numeric.dot(U, numeric.dot(S_inverse, numeric.inv(V))),
      solution = numeric.dot(numeric.dot(psuedoinv, numeric.transpose(b)), A);
  return solution;
}
