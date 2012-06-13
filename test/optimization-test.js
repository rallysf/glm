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
    topic: function () { return glm.GLM.optimization.linearSolve; },
    "should properly converge": function (wlssolver) {
      var s = wlssolver([1,3,4,5,2,3,4], glm.GLM.utils.add_constant(glm.GLM.utils.transpose(glm.GLM.utils.atleast_2d([1,2,3,4,5,6,7]))), [1,2,3,4,5,6,7]);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(s, [ 0.0952381 ,  2.91666667]));
    }
  }
});

suite.export(module);
