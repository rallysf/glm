require('sylvester');
var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('links');

suite.addBatch({
  "Logit": {
    topic: function() { return glm.links.Logit; },
    "should correctly compute logistic values": function(logit) {
      assert.deepEqual(logit().f([0.5, 0.5]), $V([Math.log(1), Math.log(1)]));
    },
    "should correctly compute the inverse of logistic function": function (logit) {
      assert.deepEqual(logit().inverse([Math.log(1), Math.log(1)]), $V([0.5, 0.5]));
    },
    "should correctly compute the derivative of logistic function": function (logit) {
      assert.deepEqual(logit().derivative([0.5, 0.5]), $V([4, 4]));
    },
  }
});

suite.export(module);
