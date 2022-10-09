#Makefile
install: # deploy environment 
	npm ci
lint: #start eslint
	npx eslint .
test: #start testing
	npm test
build:
	rm -rf dist
	NODE_ENV=production npx webpack
develop:
	npx webpack serve
.PHONY: test