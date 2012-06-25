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
    },
    "should be able to refit a model": function (GLM) {
      var glm_model = GLM(GLM.families.Gaussian());
      glm_model.fit([1, 2, 3, 4], [[1.1, 2], [1, 3], [1, 4], [2, 5]]);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict([[2, 3], [2, 4]]), [2, 3], 1e-4));
      glm_model.fit([1, 1.1, 0.95, 2], [1, 1.05, 1.05, 2]);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict([3, 4]), [3, 4], 0.05));
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
      /* check the fitted parameters */
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.weights, data.R_binomial_glm_fit_parameters, 1e-2));
      /* check predictions */
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict(data.mtcars.wt), data.R_binomial_glm_predict_values, 1e-3));
    },
  }
});

suite.addBatch({
  "Lasso": {
    topic: function () { return glm.GLM.Lasso; },
    "should train a basic l1 norm regularized linear model": function (Lasso) {
      var random_data = [[1, 2], [2, 3], [3, 4]];
      var target = [1, 2, 3];
      var glm_model = Lasso({'learning_rate': 0.1});
      glm_model.fit(target, random_data);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict(random_data), [1.15, 2.0, 2.85], 0.01));
    },
    "should train an l1 norm regularized linear model similar to R's glmnet": function (Lasso) {
      var random_data = require('./data/rand_100_5.json').randn_100_5,
          target = random_data.target,
          features = random_data.data;
      var lasso_model = Lasso({'learning_rate': 0.1});
      lasso_model.fit(target, features);
      console.log(lasso_model.weights);
      assert.deepEqual(random_data.glmnet_lasso_linear_fit_parameters, lasso_model.weights);
      //assert.deepEqual(random_data.glmnet_lasso_predict_parameters, lasso_model.weights);
    },
  }
});

suite.addBatch({
  "ElasticNet": {
    topic: function () { return glm.GLM.ElasticNet; },
    "should train a basic elastic net regularized linear model": function (ElasticNet) {
      var random_data = [[1, 2], [2, 3], [3, 4]];
      var target = [1, 2, 3];
      var glm_model = ElasticNet({'learning_rate': 0.1});
      glm_model.fit(target, random_data);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(glm_model.predict(random_data), [1.15, 2.0, 2.85], 0.05));
    }
  }
});

suite.export(module);
