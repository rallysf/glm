exports.GLM = function (family) {
  /* Set defaults */
  // default family is Gaussian (linear model)
  if (!family) { family = exports.GLM.families.Gaussian(); }

  // the returned model
  var model = {};
  model.family = family;
  model.weights = null; 
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
};

exports.GLM.ElasticNet = function (parameters) {
  /* Set defaults */
  // default family is Gaussian (linear model)
  parameters = elastic_net_parameters(parameters);

  // the returned model
  var model = {};
  model.family = parameters.family;
  model.elastic_net_parameter = parameters.elastic_net_parameter;
  model.learning_rate = parameters.learning_rate;
  model.weights = null; 
  model.fit = function (endogenous, exogenous) {
    model.data = constantize(exogenous);
    model.target = endogenous;
    model.weights = exports.GLM.optimization.CoordinateDescent(model.target, model.data, model.learning_rate, model.elastic_net_parameter);
    return this;
  };
  model.predict = function (exogenous) {
    exogenous = constantize(exogenous)
    var linear = exports.GLM.utils.dot(exogenous, model.weights);
    return model.family.fitted(linear);
  };
  return model;
};

exports.GLM.Lasso = function (parameters) {
  if (!parameters) { parameters = {}; }
  parameters.elastic_net_parameter = 1.0;
  return exports.GLM.ElasticNet(parameters);
};

exports.Ridge = function (family) {
  if (!parameters) { parameters = {}; }
  parameters.elastic_net_parameter = 0.0;
  return exports.GLM.ElasticNet(parameters);
};

function elastic_net_parameters(custom_parameters) {
  var params = {
    'learning_rate': 1.0,
    'elastic_net_parameter': 0.5,
    'family': exports.GLM.families.Gaussian()
  };
  for (var key in custom_parameters) {
    params[key] = custom_parameters[key];
  }
  return params;
}

function constantize(exogenous) {
  if (!exports.GLM.utils.isArray(exogenous[0])) { 
    exogenous = exports.GLM.utils.transpose(exports.GLM.utils.atleast_2d(exogenous));
  }
  return exports.GLM.utils.add_constant(exogenous);
}

