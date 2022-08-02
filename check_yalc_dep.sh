#!/usr/bin/env bash

grep "\"${1}\": \"file:.yalc/${1}\"" package.json > /dev/null
if [[ $? -eq 0 ]]; then
    test -d .yalc/${1}
fi
