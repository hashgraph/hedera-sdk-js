#!/usr/bin/env bash

docker run -dt -v "$(pwd)":/etc/envoy:ro --name envoy --network host envoyproxy/envoy
