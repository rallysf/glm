exports.GLM = function (family) {
  var model = {
    fit: function(endogenous, exogenous) {
      var converged = false,
          iteration = 0,
          mu = family.initialMu(endogenous),
          wlsExogenous = exogenous,
          eta = family.predict(mu),
          dev = family.deviance(endogenous, mu);

      while (!converged) {
        //var weights = data_weights.multiply(family.weights);

        iteration += 1;
        // converged = _check_convergence
        converged = true;
      }
      return this;
    },
    predict: function(endogenous) {
      return this.family.fitted(this.weights.multiply(endogenous));
    }
  }
  return model;
}
