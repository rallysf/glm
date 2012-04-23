var util = require("util"),
    glm = require("../glm");

util.puts(JSON.stringify({
  "name": "GLM",
  "version": glm.version,
  "description": "Generalized Linear Models",
  "keywords": ["glm", "statistics", "models"],
  "homepage": "https://rally.github.com/glm.js",
  "main": "./glm.js",
  "repository": {
    "type": "git",
    "url": "http://github.com/rally/glm.js.git"
  },
  "devDependencies": {
    "sylvester": "0.1.3",
    "vows": "0.6.1",
    "uglify-js": "1.2.5"
  }
}, null, 2));
