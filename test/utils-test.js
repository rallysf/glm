var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('utils');

suite.addBatch({
  "checkConvergence": {
    topic: function () { return glm.GLM.utils.checkConvergence; },
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
  "atleast_2d": {
    topic: function () { return glm.GLM.utils.atleast_2d; },
    "convert to 2d row vector": function (atleast_2d) {
      assert.deepEqual(atleast_2d([1, 2]), [[1, 2]]);
    }
  },
  "softThreshold": {
    topic: function () { return glm.GLM.utils.softThreshold; },
    "will threshold values below gamma": function (softThreshold) {
      assert.equal(softThreshold(3, 1), 2);
      assert.equal(softThreshold(0.1, 1), 0);
      assert.equal(softThreshold(-3, 1), -2);
    }
  },
  "mean": {
    topic: function () { return glm.GLM.utils.mean; },
    "correctly computes the average of an input vector": function (mean) {
      assert.equal(mean([1]), 1);
      assert.equal(mean([1, 2]), 1.5);
      assert.equal(mean([0, 2, 4]), 2);
      assert.equal(mean([0, -2, -4]), -2);
    }
  },
  "dot": {
    topic: function () { return glm.GLM.utils.dot; },
    "correctly computes dot product for two vectors": function (dot) {
      assert.equal(dot([3], [2]), 6);
      assert.equal(dot([3, 7], [2, 5]), 41);
    }, 
    "dot product of vector to matrix": function (dot) {
      assert.equal(dot([3, 7], [[2], [5]]), 41);
    }, 
    "dot product of matrix to vector": function (dot) {
      assert.equal(dot([[2], [5]], [3, 7]), 41);
    },
    "matrix to matrix multiplication for two square matricies": function (dot) {
      assert.deepEqual(dot([[2, 1], [5, 1]], [[3, 3], [7, 3]]), [[13, 9], [22, 18]]);
    }
  },
  "transpose": {
    topic: function () { return glm.GLM.utils.transpose; },
    "transpose a 2x2 square matrix": function (transpose) {
      assert.deepEqual(transpose([[2, 3], [4, 5]]), [[2, 4], [3, 5]]);
    },
    "transpose a 2x3 non-square matrix": function (transpose) {
      assert.deepEqual(transpose([[2, 3, 7], [4, 5, 8]]), [[2, 4], [3, 5], [7, 8]]);
    },
    "transpose a 1-d vector into column vector (2-d)": function (transpose) {
      assert.deepEqual(transpose([1,2,3]), [[1], [2], [3]]);
    }
  }
});

suite.export(module);
