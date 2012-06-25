var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('optimization');

suite.addBatch({
  "CoordinateDescent": {
    topic: function () { return glm.GLM.optimization.CoordinateDescent; },
    "should properly converge given zeros for enet regressions": function (optimization) {
      var elastic_net_parameters = [0.0, 0.5, 1.0];
      for (var enet_parameter in elastic_net_parameters) {
        var endogenous = [[0, 0], [0, 0]],
            exogenous = [0, 0],
            weights = optimization(exogenous, endogenous, 0.1, enet_parameter);
        assert.deepEqual(weights, [0, 0]);
      }
    }
  }
});

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
