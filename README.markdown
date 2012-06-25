glm
===

Responsive [generalized linear models](http://en.wikipedia.org/wiki/Generalized_linear_model) in pure Javascript. This tool can be used for fitting linear models in browser or server side with node.js. 

The purpose of this library is to have one self contained generalized linear model library. Other javascript libraries can be used for to create additional models. See the execellent [brain](https://github.com/harthur/brain) library for neural networks and [classifier.js](https://github.com/harthur/classifier) library for Bayesian classifiers.

```javascript
var glm_model = glm.GLM(glm.GLM.families.Gaussian());
var feature_vectors = [[1], [2]];
var target_values = [3, 4];
glm_model.fit(target_values, feature_vectors);
console.log(glm_model.predict([10, 100]));  // == 12, 102
```

Applications
------------
 * Data visualizations
 * Interactive data cleansing tools (example: outlier removal)
 * Interactive feature manipulation or discretization
 * Fitting models with Node.js
 * Teaching & education with linear model examples

Future Plans
------------
We will soon have support for regularization and Probit regression. After this, we plan on optimizing the runtime performance of the system. It would be neat to have support for MAP or fully Bayesian GLMs, but we currently don't see any reason to work on this functionality.

API changes will probably be made to make GLM.js more in line with the other popular Javascript Machine Learning libraries.

Usage & Architecture
====================
There is one main function called GLM which expects a distribution to be passed in to it. The families can be found in the families attribute of this GLM function. For example: `GLM(GLM.families.Gaussian())` will initialize a GLM with Gaussian distribution and `GLM(GLM.families.Binomial())` will initialize a GLM object with a Binomial distribution. Simply initializing `GLM()` with no arguments will default to Gaussian.

Each of these distributions can take 

This is essentially a port of a python GLM implementation that uses the iteratively reweighted least squares algorithm in the excellent [statsmodels](http://statsmodels.sourceforge.net/) library.

In Node
---------------------
```
$ npm install glm
$ node
> var glm = require('glm');
```

In browser
----------
Just include `glm.js` as a script in your HTML code. All objects in the library are attached to the main GLM object.

Examples
--------
Run `python -m SimpleHTTPServer` in the root of this repo and navigate your browser to `http://localhost:8000/examples/`

Compiling
=========
To compile, first install the dependencies with npm and then run make. To test, run `make test`.
