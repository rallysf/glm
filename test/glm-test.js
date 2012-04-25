require('sylvester');
var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('glm');

suite.addBatch({
  "BinomialLogit": {
    topic: function () { return glm.GLM; },
    "should properly train a GLM model with binomial distribution and logisitic link function": function (GLM) {
      var glm_model = GLM(glm.families.Binomial(glm.links.Logit()));
      glm_model.fit([[1],[2],[3],[4]], [1,1,2,2]); // binary varibles in {1, 2}
      console.log(glm_model.weights);
      assert.deepEqual(glm_model.predict([[0], [5]]), $V([1, 2]));
    }
  }
});

suite.addBatch({
  "Gaussian": {
    topic: function () { return glm.GLM; },
    "should train a linear model": function (GLM) {
      var glm_model = GLM(glm.families.Gaussian());
      glm_model.fit([[1, 1], [1, 2]], [1, 2]);
      assert.deepEqual(glm_model.predict([[1, 3], [1, 4]]), $V([3, 4]));
    },
    "should train a linear model with gaussian noise": function (GLM) {
      var glm_model = GLM(glm.families.Gaussian());
      glm_model.fit([[1, 1], [1, 2]], [1, 2]);
      assert.deepEqual(glm_model.predict([[1, 3], [1, 4]]), $V([3, 4]));
    },
    "should train a two-dimensional linear model": function (GLM) {
      var glm_model = GLM(glm.families.Gaussian());
      glm_model.fit([[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 1, 5], [1, 1, 6], [1, 1, 7], [1, 1, 8]], [1, 2, 3, 4, 5, 6, 7]);
      assert.deepEqual(glm_model.predict([[1, 1, 3], [1, 1, 5]]), $V([3, 5]));
    }
  }
});

suite.export(module);
