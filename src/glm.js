exports.GLM = function (family, regularization) {
  /* Set defaults */
  // default family is Gaussian (linear model)
  if (!family) { family = exports.GLM.families.Gaussian(); }

  // default to no regularization (none supported yet)
  if (!regularization) { regularization = 'none'; }

  // the returned model
  var model = {};
  model.family = family;
  model.weights = null; 

  function constantize (exogenous) {
    if (!exports.GLM.utils.isArray(exogenous[0])) { 
      exogenous = exports.GLM.utils.transpose(exports.GLM.utils.atleast_2d(exogenous));
    }
    return exports.GLM.utils.add_constant(exogenous);
  }

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
}
