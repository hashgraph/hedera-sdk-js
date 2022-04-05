#!/bin/env bash

pbjs -r hashgraph -t static-module -w es6 --force-long --no-beautify --no-convert --no-delimited --no-verify \
    -o src/proto.js src/proto/*/**.proto

pbts -n hashgraph -o src/proto.d.ts src/proto.js

perl -pi -e "s#(?<!api\.)proto\.#hashgraph.proto.#g" src/proto.d.ts
