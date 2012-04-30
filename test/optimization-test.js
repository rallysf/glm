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

suite.export(module);
