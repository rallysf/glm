require('sylvester');
var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('families');

suite.addBatch({
  "binomial": {
    topic: function() { return glm.families.Binomial; },
    "should properly return a starting mu value": function (binomial) {      
      assert.deepEqual(binomial(glm.links.Logit()).initialMu([0.5, 1.5]), $V([0.5, 1.0]));
    },
    "should be able to compute binomial deviance": function(binomial) {
      var fam = binomial(glm.links.Logit());
      assert.deepEqual(fam.deviance([1,0], [3,4]), 1);
    },
    "should accept a logit link function": function(binomial) {
      var fam = binomial(glm.links.Logit());
      assert.deepEqual(fam.link.f([0.5, 0.5]), $V([Math.log(1), Math.log(1)]));
    }
  }
});

suite.export(module);
