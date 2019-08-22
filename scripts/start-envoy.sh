#!/usr/bin/env bash

docker run -dt -v "$(pwd)":/etc/envoy:ro --name envoy -p 11205:11205 envoyproxy/envoy
