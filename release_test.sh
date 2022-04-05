#!/bin/env bash

if [ "$(git diff --name-only | wc -l)" -gt 0 ]; then
    echo "Uncommited changes"
    exit 1
fi

pnpm i
pnpm compile
pnpm format
pnpm lint
pnpm test:unit:node

pushd examples
pnpm i
pnpm format
pnpm lint
popd

pushd common_js_test
pnpm i
pnpm test
popd
