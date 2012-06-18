var util = require("util"),
    glm = require("../glm");

util.puts(JSON.stringify({
  "name": "glm",
  "version": glm.GLM.version,
  "description": "Generalized Linear Models",
  "keywords": ["glm", "statistics", "model", "machine-learning"],
  "homepage": "https://github.com/rallysf/glm",
  "main": "./glm.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/rallysf/glm.js.git"
  },
  "devDependencies": {
    "vows": "0.6.1",
    "uglify-js": "1.2.5"
  }
}, null, 2));
