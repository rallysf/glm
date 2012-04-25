exports.families = exports.families || {};

exports.families.Binomial = function (link) {
  if (!link) { link = exports.links.Logit(); }

  var model = {};
  model.initialMu = function (y) {
    return $V(y).map(function(x) { return (x + 0.5) / 2; });
  };
  model.deviance = function(endogenous, mu) {
    // formula for binomial deviance
    // 2 * sum{i \in y,mu}(log(Y/mu) + (n-Y)*log((n-Y)/(n-mu)))
    var dev = 0.0; 
    $V(mu).map(function (m, i) {
      var one = endogenous[i - 1] == 1 ? 1 : 0; 
      dev += one * Math.log(m + 1e-200) + (1 - one) * Math.log(1 - m + 1e-200);
    });
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
  // default to log link function
  if (!link) { link = exports.links.Identity(); }

  var model = {};
  model.deviance = function(endogenous, mu) {
    var dev = 0.0;
    $V(endogenous).map(function (x, i) {
      dev += Math.pow(x - mu[i - 1], 2);
    });
    return dev;
  };
  model.link = link;
  model.fitted = function (eta) {
    return model.link.inverse(eta);
  };
  return model;
};
