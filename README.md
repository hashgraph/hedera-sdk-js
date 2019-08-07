### Prerequisites

You must have the official Protobufs compiler, `protoc`, installed:

Arch (with Pikaur):
```shell script
$ pikaur -S protobuf
```

You also need a Hedera testnet and an Envoy HTTP proxy running:

(Ask how to get the `testnet` image)

```shell script
$ docker run --name hedera --network host testnet
$ ./start-envoy.sh
```
