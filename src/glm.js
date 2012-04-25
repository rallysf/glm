exports.GLM = function (family) {
  // default family is Gaussian
  if (!family) { family = exports.families.Gaussian(); }

  var _checkConvergence = function (newWeights, oldWeights, iterations, maxIterations) {
    var change = 0.0, tol = 1e-9;
    newWeights.map(function(x, i) { change += Math.pow(x - oldWeights.e(i), 2); });
    return change < tol || (iterations > maxIterations);
  };

  var softThreshold = function (z, gamma) {
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

  // the returned model
  var model = {};
  model.family = family;
  model.weights = [];
  model.fit = function (endogenous, exogenous) {
    var converged = false,
        iteration = 0,
        n_examples = endogenous.length,
        n_features = endogenous[0].length,
        lambda = 0.5,
        alpha = 0.5,
        maxIters = 1000;
   
    // initialize weights
    model.weights = [];
    for (var i = 0; i < n_features; i++) { model.weights.push(0.5); }
    model.weights = $V(model.weights);

    while (!converged) {
      var currentFeatureId = iteration % n_features,
          partialResidualSum = 0.0,
          oldWeights = model.weights.dup();

      for (var i = 0; i < n_examples; i++) {
        partialResidualSum += exogenous[i] - model.weights.dot(endogenous[i]) + model.weights.e(currentFeatureId + 1) * endogenous[i][currentFeatureId];
      }
      model.weights = model.weights.map(function(w, i) {
        if (i == currentFeatureId + 1) {
          return softThreshold(partialResidualSum / n_examples, lambda * alpha) / (1 + lambda * (1 - alpha));
        } else {
          return w;
        }
      });
      iteration += 1;
      converged = _checkConvergence(model.weights, oldWeights, iteration, maxIters);
    }
    return this;
  };
  model.predict = function (endogenous) {
    var linear = $M(endogenous).multiply(model.weights);
    return model.family.fitted(linear);
  };
  return model;
}
