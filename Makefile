JS_TESTER = ./node_modules/vows/bin/vows
JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

all: glm.min.js package.json

glm.js: \
	src/glm.js \
	src/SVD.js \
	src/version.js \
	src/testing.js \
	src/utils.js \
	src/families.js \
	src/links.js \
	src/optimization.js \
	Makefile

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

%.js:
	@rm -f $@
	@echo '(function(exports){' > $@
	cat $(filter %.js,$^) >> $@
	@echo '})(this);' >> $@
	@chmod a-w $@

package.json: glm.js src/package.js
	@rm -f $@
	node src/package.js > $@
	@chmod a-w $@

clean:
	rm -f glm.js

test: all
	@$(JS_TESTER)
