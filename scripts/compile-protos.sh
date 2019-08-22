#!/bin/sh

# Directory to write generated code to (.js and .d.ts files)
OUT_DIR="./src/generated"

rm -rf src/generated
mkdir -p src/generated

protoc \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="service=true:${OUT_DIR}" \
    -I "src/proto" \
    src/proto/*
