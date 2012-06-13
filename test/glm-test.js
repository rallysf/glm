var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('glm');

suite.addBatch({
  "Linear regression with gaussian error": {
    topic: function () { return glm.GLM; },
    "should train a linear model": function (GLM) {
      var glm_model = GLM(GLM.families.Gaussian());
      glm_model.fit([1, 2], [[1], [2]]);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict([3, 4]), [3, 4]));
    },
    "should train a linear model with gaussian noise": function (GLM) {
      var glm_model = GLM(GLM.families.Gaussian());
      glm_model.fit([1, 1.1, 0.95, 2], [1, 1.05, 1.05, 2]);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict([3, 4]), [3, 4], 0.05));
    },
    "should fit a two-dimensional linear model": function (GLM) {
      var glm_model = GLM(GLM.families.Gaussian());
      glm_model.fit([1, 2, 3, 4], [[1.1, 2], [1, 3], [1, 4], [2, 5]]);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict([[2, 3], [2, 4]]), [2, 3], 1e-4));
    }
  }
});

suite.addBatch({
  "Logistic regression with binomial error": {
    topic: function () { return glm.GLM; },
    "should properly fit a GLM model with binomial distribution and logisitic link function with the same parameters and results as the R function": function (GLM) {
      var data = require('./data/mtcars.json');
      var glm_model = GLM(GLM.families.Binomial(GLM.links.Logit()));
      glm_model.fit(data.mtcars.hp_gt_125, data.mtcars.wt);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.weights, data.R_binomial_glm_fit_parameters, 1e-2));
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict(data.mtcars.wt), data.R_binomial_glm_predict_values, 1e-3));
    },
  }
});

suite.export(module);
