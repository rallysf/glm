exports.optimization = exports.optimization || {};

/* TODO: this is broken and incomplete
exports.optimization.CoordinateDescentPenalizedWeightedLeastSquares = function (endogenous, exogenous, gradientFunction, regularizationParameter, elasticnetParameter, maxIterations) {
  // initialize defaults
  if (!regularizationParameter) { regularizationParameter = 0.01; }
  if (!elasticnetParameter) { elasticnetParameter = 0.5; } // defaults to half lasso, half ridge
  if (!maxIterations) { maxIterations = 1000; }

  var converged = false,
      iteration = 0,
      n_features = endogenous[0].length;
      weights = exports.utils.zeros(endogenous[0].length);

  while (!converged) {
    var currentFeatureId = iteration % n_features,
        oldWeights = numeric.clone(weights),
        gradient = gradientFunction(endogenous, exogenous, weights, currentFeatureId, regularizationParameter, elasticnetParameter); // compute gradient along given axis

    weights[currentFeatureId] = gradient;

    iteration += 1;
    converged = exports.utils.checkConvergence(weights, oldWeights, iteration, maxIterations);
  }
  return weights;
};
*/

exports.optimization.IRLS = function (endogenous,
                                      exogenous,
                                      family) {
  function linearSolve(A, b) {
    /* solve Ax=b for x using svd pseudoinverse */
    function project_and_invert(V) {
      var id_matrix = numeric.identity(V.length);
      for (var i = 0; i < V.length; i++) { id_matrix[i][i] /= V[i]; } 
      return id_matrix;
    }   
    var decomposition = numeric.svd(numeric.dot(numeric.transpose(exogenous), exogenous)),
        U = decomposition.U,
        S_inverse = project_and_invert(decomposition.S),
        V = decomposition.V,
        psuedoinv = numeric.dot(U, numeric.dot(S_inverse, numeric.inv(V))),
        solution = numeric.dot(numeric.dot(psuedoinv, numeric.transpose(exogenous)), endogenous);
    return solution;
  }

  var converged = false,
      iterations = 0,
      maxIterations = 5,
      mu = family.initialMu(endogenous),
      eta = family.predict(mu),
      deviance = family.deviance(endogenous, mu),
      wlsResults = null;

  while (!converged) {
    oldDeviance = deviance;
    var ddot = 0.0, muprime = family.link.derivative(mu);
    for (var i = 0; i < endogenous.length; i++) { ddot += muprime[i] * (endogenous[i] - mu[i]); }
    var wlsEndogenous = exports.utils.map(eta, function(x) { return x + ddot; });
    wlsResults = linearSolve(wlsEndogenous, exogenous);
    eta = numeric.dot(exogenous, wlsResults);
    mu = family.fitted(eta);
    deviance = family.deviance(endogenous, mu);
    converged = exports.utils.checkConvergence(deviance, oldDeviance, iterations, maxIterations);
    iterations += 1;
  }
  return wlsResults;
};
