GLM.js
======

Responsive [generalized linear models](http://en.wikipedia.org/wiki/Generalized_linear_model) in pure Javascript. This tool is useful for responsive feedback when doing data cleansing or adjusting parameters that actually change the data.

This is essentially a port of Wes Mckinney's python GLM implementation that uses the iteratively reweighted least squares algorithm in the excellent [statsmodels](http://statsmodels.sourceforge.net/) library.

Applications
============
 * Visualization
 * Data processing
 * Teaching / education linear models


Example usage in browser
========================
type "python -m SimpleHTTPServer" in the root of this repo and navigate your browser to "http://localhost:8000"


Example usage in Node
=====================
> glm = require('glm');
> var glm_model = GLM(GLM.families.Gaussian());
> glm_model.fit([1, 2], [[1], [2]]);
> console.log(glm_model.predict([3, 4]), [3, 4]));

Compiling
=========
To compile, first install the dependencies with npm and then run make. To test, run "make test".
