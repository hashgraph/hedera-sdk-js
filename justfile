export PATH := "./node_modules/.bin:" + env_var('PATH')

default:
    just --choose

install:
    pnpm i

docs:
    typedoc --excludeInternal --excludePrivate --excludeProtected --out docs --validation.invalidLink --entryPoints src/index.js src/browser.js src/native.js

build: install format lint
    babel src -d lib --out-file-extension .cjs

lint: install lint-types lint-dpdm lint-format lint-js

lint-types:
    tsc

lint-dpdm:
    dpdm src/index.js --circular true --tree false --warning false > /dev/null

lint-format:
    prettier src "test/unit/*.js" "test/integration/*.js" "*.json" "src/*.js" --check > /dev/null

lint-js:
    eslint --fix "src/**/*.js" "test/integration/**/*.js" "test/unit/**/*.js"

format:
    prettier src "test/unit/*.js" "test/integration/*.js" "*.json" "src/*.js" --write > /dev/null

bundle-browser:
    vite -c vite.config.cjs build

test-unit: test-unit-node test-unit-browser

test-unit-node TEST=".*":
    mocha --inline-diffs -r @babel/register -r chai/register-expect.js "test/unit/*.js" -g "{{TEST}}"

test-integration-node:
    nyc mocha -r @babel/register -r chai/register-expect.js "test/integration/AccountCreate*.js"

test-unit-browser:
    #!/usr/bin/env bash
    vite --clearScreen false -c vite.config.cjs serve --port 9001 . &
    VITE_PID=$!
    sleep 1
    npx playwright install
    npx playwright test test/browser.test.js
    PLAYWRIGHT_STATUS=$?
    kill -9 $VITE_PID
    exit $PLAYWRIGHT_STATUS

release-test: install build format lint test-unit-node test-unit-browser
    just -f examples/justfile build
    just -f examples/simple_rest_signature_provider/justfile build
    just -f common_js_test/justfile build test

publish TAG="latest": release-test
    pnpm publish --tag "{{TAG}}"

update-proto:
    just -f packages/proto/justfile update
    pnpm add link:packages/proto
