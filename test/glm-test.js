var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('glm');

suite.addBatch({
  "Logistic regression with binomial error": {
    topic: function () { return glm.GLM; },
    "should properly train a GLM model with binomial distribution and logisitic link function": function (GLM) {
      var glm_model = GLM(glm.families.Binomial(glm.links.Logit())),
          X = [[-1, 0], [0, 1], [1, 1]],
          Y = [0, 1, 1];
      glm_model.fit(Y, X);
      assert.deepEqual(glm_model.predict(X), Y);
    }
  },
  "Linear regression with gaussian error": {
    topic: function () { return glm.GLM; },
    "should train a linear model": function (GLM) {
      var glm_model = GLM(glm.families.Gaussian());
      glm_model.fit([1, 2], [[1, 1], [1, 2]]);
      assert.isTrue(glm.testing.fuzzyArrayEqual(glm_model.predict([[1, 3], [1, 4]]), [3, 4]));
    },
    "should train a linear model with gaussian noise": function (GLM) {
      var glm_model = GLM(glm.families.Gaussian());
      glm_model.fit([1, 1.1, 0.95, 2], [[1, 1], [1, 1.05], [1, 1.05], [1, 2]]);
      assert.isTrue(glm.testing.fuzzyArrayEqual(glm_model.predict([[1, 3], [1, 4]]), [3, 4], 0.05));
    },
    "should train a two-dimensional linear model": function (GLM) {
      var glm_model = GLM(glm.families.Gaussian());
      glm_model.fit([1, 2, 3, 4], [[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 2, 5]]);
      assert.isTrue(glm.testing.fuzzyArrayEqual(glm_model.predict([[1, 2, 3], [1, 2, 4]]), [2, 3], 1e-4));
    }
  }
});

suite.export(module);
