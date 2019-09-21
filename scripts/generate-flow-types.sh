#!/usr/bin/env bash

set -m

run_flowgen() {
  output=$( flowgen $f -o "${f%.ts}".js.flow 2>&1 )
  echo "$output"
}

for f in index-*.ts exports.ts src/*.ts src/**/*.ts; do
  run_flowgen "$f" &
done

for job in $(jobs -p)
do
    wait "$job"
done
