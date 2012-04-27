exports.GLM = function (family, regularization) {
  // default family is Gaussian (linear model)
  if (!family) { family = exports.families.Gaussian(); }
  // default to no regularization (none supported yet)
  if (!regularization) { regularization = 'none'; }

  // the returned model
  var model = {};
  model.family = family;
  model.weights = null; 
  model.fit = function (endogenous, exogenous) {
    model.weights = exports.optimization.IRLS(endogenous, exogenous, model.family);
    return this;
  };
  model.predict = function (endogenous) {
    var linear = numeric.dot(endogenous, model.weights);
    return model.family.fitted(linear);
  };
  return model;
}
