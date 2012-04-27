exports.families = exports.families || {};

exports.families.Binomial = function (link) {
  if (!link) { link = exports.links.Logit(); }

  var model = {};
  model.initialMu = function (y) {
    var init = [];
    for (var i = 0; i < y.length; i++) { init.push((y[i] + 0.5) / 2); }
    return init;
  };
  model.deviance = function(endogenous, mu) {
    // formula for binomial deviance
    // 2 * sum{i \in y,mu}(log(Y/mu) + (n-Y)*log((n-Y)/(n-mu)))
    var dev = 0.0; 
    for (var i = 0; i < mu.length; i++) {
      var one = endogenous[i] == 1 ? 1 : 0; 
      dev += one * Math.log(mu[i] + 1e-200) + (1 - one) * Math.log(1 - mu[i] + 1e-200);
    }
    return 2 * dev;
  };
  // assign input link function
  model.link = link;
  model.predict = function (mu) {
    return model.link.f(mu);
  };
  model.fitted = function (eta) {
    return model.link.inverse(eta);
  };
  return model;
};

exports.families.Gaussian = function (link) {
  // default to identity link function
  if (!link) { link = exports.links.Identity(); }
  var model = {};
  model.deviance = function (endogenous, mu) {
    var dev = 0.0;
    for (var i = 0; i < endogenous.length; i++) {
      dev += Math.pow(endogenous[i] - mu[i], 2);
    }
    return dev;
  };
  model.initialMu = function (y) {
    var y_mean = exports.utils.mean(y), mu = [];
    for (var i = 0; i < y.length; i++) { mu.push((y[i] - y_mean) / 2.0); }
    return mu;
  };
  model.link = link;
  model.predict = function (mu) {
    return model.link.f(mu);
  };
  model.fitted = function (eta) {
    return model.link.inverse(eta);
  };
  return model;
};
