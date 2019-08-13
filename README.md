### Prerequisites

You must have the official Protobufs compiler, `protoc`, installed:

Arch (with Pikaur):
```shell script
$ pikaur -S protobuf
```

(Optional) Start the Hedera testnet image (ask someone for a copy):
```shell script
$ docker run --name hedera --network host testnet
```

You also need an Envoy HTTP proxy running (optionally change the endpoint in `envoy.yaml`):
```shell script
$ ./start-envoy.sh
```

### NOTE: Protobufs have to be manually patched
In most places where `sint64` or `uint64` is used in the protobufs, they have to be patched
to annotate these fields as `[jstype=JS_STRING]` or the Protobufs-JS library will try to decode
them as JS `number` types which can only represent exact integers in the range `[-2^53, 2^53 - 1]`.
