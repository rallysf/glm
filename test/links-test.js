var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('links');

suite.addBatch({
  "Logit": {
    topic: function () { return glm.GLM.links.Logit; },
    "should correctly compute logistic values": function (logit) {
      assert.deepEqual(logit()([0.5, 0.5]), [Math.log(1), Math.log(1)]);
    },
    "should correctly compute the inverse of logistic function": function (logit) {
      assert.deepEqual(logit().inverse([Math.log(1), Math.log(1)]), [0.5, 0.5]);
    },
    "should correctly compute the derivative of logistic function": function (logit) {
      assert.deepEqual(logit().derivative([0.5, 0.5]), [4, 4]);
    },
  }
});

suite.addBatch({
  "Power": {
    topic: function () { return glm.GLM.links.Power; },
    "compute squred power function": function (power) {
      assert.deepEqual(power(2.0)([2.0, 0.5]), [4.0, 0.25]);
    },
    "compute inverse of squred power function": function (power) {
      assert.deepEqual(power(2.0).inverse([4.0, 0.25]), [2.0, 0.5]);
    },
    "compute derivative of cubic power function": function (power) {
      assert.deepEqual(power(3).derivative([2.0, 0.5]), [12.0, 0.75]);
    },
  }
});

suite.addBatch({
  "Log": {
    topic: function () { return glm.GLM.links.Log; },
    "compute fn, inv, and derivative correctly": function (log) {
      assert.deepEqual(log()([1, 2]), [0, Math.log(2)]);
      assert.deepEqual(log().inverse([0, Math.log(2)]), [1, 2]);
      assert.deepEqual(log().derivative([1, 2]), [1, 0.5]);
    }
  }
});

suite.addBatch({
  "NegativeBinomial": {
    topic: function () { return glm.GLM.links.NegativeBinomial; },
    "compute fn, inv, and derivative correctly": function (nb) {
      assert.deepEqual(nb(2.0)([0.5]), [Math.log(0.5)]);
      assert.deepEqual(nb(2.0).inverse([Math.log(0.5)]), [0.5]);
      assert.deepEqual(nb(1.0).derivative([1]), [0.5]);
    }
  }
});

suite.export(module);
