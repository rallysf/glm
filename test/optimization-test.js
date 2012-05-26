var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('optimization');

/*
suite.addBatch({
  "CoordinateDescentPenalizedWeightedLeastSqures": {
    topic: function () { return glm.optimization.CoordinateDescentPenalizedWeightedLeastSquares; },
    "should properly converge": function (optimization) {

      var gradientFunction = function (endogenous, exogenous, weights, featureId, elasticnetParameter) {
        return [0, 0];
      };

      var endogenous = [[1, 2], [3, 4]],
          exogenous = [1, 2],
          weights = optimization(endogenous, exogenous, gradientFunction);

      assert.deepEqual(weights, [1, 2]);
    }
  }
});
*/

suite.addBatch({
  "IRLS": {
    topic: function () { return glm.optimization.linearSolve; },
    "should properly converge": function (wlssolver) {
      var s = wlssolver([1,3,4,5,2,3,4], glm.utils.add_constant(glm.utils.atleast_2d([1,2,3,4,5,6,7])), [1,2,3,4,5,6,7]);
      function approxEqual(a1, a2) {
        for (var i = 0; i < a1.length; i++) {
          assert.ok(Math.abs(a1[i] - a2[i]) < 0.0001);
        }
      }
      approxEqual(s, [ 0.0952381 ,  2.91666667]);
    }
  }
});

suite.export(module);
