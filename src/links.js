require('sylvester');

exports.links = exports.links || {};

exports.links.Logit = function() {
  var funcs = {
    f: function (P) { return $V(P).map(function (p) { return Math.log(p / (1.0 - p)); }) },
    inverse: function (Z) { return $V(Z).map(function (z) { var t = Math.exp(z); return t / (1.0 + t); }) },
    derivative: function (P) { return $V(P).map(function (p) { return 1.0 / (p * (1.0 - p)); }); }
  }
  return funcs;
}
