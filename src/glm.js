exports.GLM = function (family, regularization) {
  /* Set defaults */
  // default family is Gaussian (linear model)
  if (!family) { family = exports.families.Gaussian(); }

  // default to no regularization (none supported yet)
  if (!regularization) { regularization = 'none'; }

  // the returned model
  var model = {};
  model.family = family;
  model.weights = null; 

  model.fit = function (endogenous, exogenous) {
    exogenous = exports.utils.atleast_2d(exogenous);
    exogenous = exports.utils.add_constant(exogenous);
    model.weights = exports.optimization.IRLS(endogenous, exogenous, model.family);
    return this;
  };

  model.predict = function (exogenous) {
    exogenous = exports.utils.atleast_2d(exogenous);
    exogenous = exports.utils.add_constant(exogenous);
    var linear = numeric.dot(exogenous, model.weights);
    return model.family.fitted(linear);
  };

  return model;
}
