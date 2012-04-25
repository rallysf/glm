require('sylvester');

exports.links = exports.links || {};

exports.links.Logit = function () {
  var funcs = {
    f: function (P) { return $V(P).map(function (p) { return Math.log(p / (1.0 - p)); }) },
    inverse: function (P) { return $V(P).map(function (p) { var t = Math.exp(p); return t / (1.0 + t); }) },
    derivative: function (P) { return $V(P).map(function (p) { return 1.0 / (p * (1.0 - p)); }); }
  };
  return funcs;
};

exports.links.Power = function (power) {
  var funcs = {
    f: function (P) { return $V(P).map(function (p) { return Math.pow(p, power); }); },
    inverse: function (P) { return $V(P).map(function (p) { return Math.pow(p, 1.0 / power); }); },
    derivative: function (P) { return $V(P).map(function (p) { return power * Math.pow(p, power - 1); }); }
  };
  return funcs;
};

exports.links.Identity = function () {
  return exports.links.Power(1.0);
};

exports.links.Log = function () {
  var funcs = {
    f: function (P) { return $V(P).map(Math.log) },
    inverse: function (P) { return $V(P).map(Math.exp) },
    derivative: function (P) { return $V(P).map(function (p) { return 1.0 / p; }); }
  };
  return funcs;
};
