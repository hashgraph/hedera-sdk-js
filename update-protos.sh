#!/usr/bin/env bash

# don't proceed if the clone fails
git clone https://github.com/hashgraph/hedera-protobuf || exit 1

# replace CRLFs with LFs in proto files in case they accidentally get mixed
for f in hedera-protobuf/src/main/proto/*; do
  # pull file into a variable so we're not reading and writing it in the same pipeline
  temp=$(cat "$f")
  echo "$temp" | tr -d '\r' > "$f"
done

git apply patches/*.patch || exit 1

rm -rf src/proto

cp -R hedera-protobuf/src/main/proto src

rm -rf hedera-protobuf
