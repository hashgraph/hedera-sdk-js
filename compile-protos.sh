#!/bin/sh

export PATH=./bin/linux/:$PATH
export OUT_DIR=src/generated

rm -rf ${OUT_DIR:?}/*
mkdir -p $OUT_DIR

protoc --proto_path=src/proto src/proto/* \
--js_out=import_style=typescript:$OUT_DIR \
--grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR