
develop:
	npx webpack serve

install-deps:
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

watch:
	npm run watch

lint:
	npx eslint .

.PHONY: test