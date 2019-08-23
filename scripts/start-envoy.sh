#!/usr/bin/env bash

docker run -dt -v "$(pwd)"/envoy.yaml:/etc/envoy/envoy.yaml:ro --name envoy -p 11205:11205 envoyproxy/envoy
