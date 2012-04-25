exports.optimization = exports.optimization || {};

exports.optimization.CoordinateDescentPenalizedWeightedLeastSquares = function (endogenous, exogenous, gradientFunction, lambda, alpha, maxIterations) {
  // initialize defaults
  if (!maxIterations) { maxIterations = 1000; }

  var converged = false,
      weights = $V([exports.utils.zeros(endogenous[0].length)]);

  while (!converged) {
    var currentFeatureId = iteration % n_features,
        oldWeights = weights.dup(),
        gradient = gradientFunction(endogenous, exogenous, weights, currentFeatureId, lambda, alpha); // compute gradient along given axis

    weights.elements[currentFeatureId] = gradient;

    /*
    for (var i = 0; i < n_examples; i++) {
      partialResidualSum += exogenous[i] - weights.dot(endogenous[i]) + weights.elements[currentFeatureId] * endogenous[i][currentFeatureId];
    }
    weights.elements[currentFeatureId] = softThreshold(gradient / n_examples, lambda * alpha) / (1 + lambda * (1 - alpha));
    */

    iteration += 1;
    converged = exports.utils.checkConvergence(weights, oldWeights, iteration, maxIterations);
  }
  return weights;
};
