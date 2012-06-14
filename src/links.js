exports.GLM.links = exports.GLM.links || {};

var linkBuilder = function (func, inv, deriv) {
  var f = function (P) { return exports.GLM.utils.map(P, func); }
  f.inverse = function (P) { return exports.GLM.utils.map(P, inv); }
  f.derivative = function (P) { return exports.GLM.utils.map(P, deriv); }
  return f;
};

exports.GLM.links.Logit = function () {
  var f = function (P) { return exports.GLM.utils.map(P, function (p) { return Math.log(p / (1.0 - p)); }) };
  f.inverse = function (P) { return exports.GLM.utils.map(P, function (p) { var t = Math.exp(p); return t / (1.0 + t); }); };
  f.derivative = function (P) { return exports.GLM.utils.map(P, function (p) { return 1.0 / (p * (1.0 - p)); }); };
  return f;
};

exports.GLM.links.Power = function (power) {
  var f = function (P) { return exports.GLM.utils.map(P, function (p) { return Math.pow(p, power); }); }
  f.inverse = function (P) { return exports.GLM.utils.map(P, function (p) { return Math.pow(p, 1.0 / power); }); }
  f.derivative = function (P) { return exports.GLM.utils.map(P, function (p) { return power * Math.pow(p, power - 1); }); }
  return f;
};

exports.GLM.links.Identity = function () {
  return exports.GLM.links.Power(1.0);
};

exports.GLM.links.Log = function () {
  var f = function (P) { return exports.GLM.utils.map(P, Math.log); }
  f.inverse = function (P) { return exports.GLM.utils.map(P, Math.exp); }
  f.derivative = function (P) { return exports.GLM.utils.map(P, function (p) { return 1.0 / p; }); }
  return f;
};

exports.GLM.links.NegativeBinomial = function (alpha) {
  var f = function (P) {
    return exports.GLM.utils.map(P, function (p) { return Math.log(p / (p + 1.0 / alpha)); });
  };
  f.inverse = function (P) {
    return exports.GLM.utils.map(P, function (p) { return Math.exp(p) / (alpha * (1 - Math.exp(p))); });
  }
  f.derivative = function (P) {
    return exports.GLM.utils.map(P, function (p) { return 1.0 / (p + alpha * Math.pow(p, 2)); });
  }
  return f;
};
