var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('utils');

suite.addBatch({
  "checkConvergence": {
    topic: function () { return glm.utils.checkConvergence; },
    "returns true when optimization procedure has converged": function (checkConvergence) {
      assert.isTrue(checkConvergence(1, 1, 1, 100));
    },
    "returns true when number of iterations has overlapped maximum": function (checkConvergence) {
      assert.isTrue(checkConvergence(1, 20, 101, 100));
    },
    "returns false when number of iterations has not yet overlapped maximum and not yet overlapped maximum": function (checkConvergence) {
      assert.isFalse(checkConvergence(1, 2, 1, 1));
    }
  },
  "softThreshold": {
    topic: function () { return glm.utils.softThreshold; },
    "will threshold values below gamma": function (softThreshold) {
      assert.equal(softThreshold(3, 1), 2);
      assert.equal(softThreshold(0.1, 1), 0);
      assert.equal(softThreshold(-3, 1), -2);
    }
  },
  "mean": {
    topic: function () { return glm.utils.mean; },
    "correctly computes the average of an input vector": function (mean) {
      assert.equal(mean([1]), 1);
      assert.equal(mean([1, 2]), 1.5);
      assert.equal(mean([0, 2, 4]), 2);
      assert.equal(mean([0, -2, -4]), -2);
    }
  }
});

suite.export(module);
