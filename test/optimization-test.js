var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('optimization');

suite.addBatch({
  "CoordinateDescentPenalizedWeightedLeastSqures": {
    topic: function () { return glm.optimization.CoordinateDescentPenalizedWeightedLeastSquares; },
    "should properly optimize a linear model": function (optimization) {

    }
  }
});

suite.export(module);
