require('sylvester');
var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('glm');

suite.addBatch({
  "BinomialLogit": {
    topic: function() { return glm.GLM; },
    "should properly train a GLM model with binomial distribution and logisitic link function": function(GLM) {
      var glm_model = GLM(families.Binomial(links.Logit()));
      glm_model.fit([1,2], [1,2]);
      assert.deepEqual(glm_model.predict([2,3]), $V([2,3]));
    },
  }
});

suite.export(module);
