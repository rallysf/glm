exports.GLM = function (family) {

  var _checkConvergence = function (history, iterations, maxIterations) {
    return true;
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
  model.history = [];
  model.fit = function (endogenous, exogenous) {
    var converged = false,
        iteration = 0,
        n_examples = endogenous.length,
        n_columns = endogenous[0].length,
        weights = $V.zero(n_columns);

    while (!converged) {
      var currentPrediction = $V(weights).dot(endogenous[i]),
          partialResidualSum = 0.0,
          residual = exogenous[i] - currentPrediction /* + TODO */;
      for (var i = 0; i < weights; i++) { partialResidualSum += 0.0; /* TODO */  }

      weights = softThreshold(partialResidualSum / N, lambda * alpha) / (1 + lambda * (1 - alpha));
      iteration += 1;
      converged = _checkConvergence(history, iteration, maxIters);
    }
    return this;
  };
  model.predict = function (endogenous) {
    return this.family.fitted(this.weights.multiply(endogenous));
  };
  return model;
}
