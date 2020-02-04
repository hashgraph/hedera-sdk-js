### Hosting your own Envoy Proxy

This SDK talks to Hedera Hashgraph through [the gRPC-Web protocol] which allows it to function
in a browser. By default, the SDK points to a public free proxy that connects through to
`0.testnet.hedera.com:50211`. If you want to change this endpoint or simply host your own proxy,
a script to easily start an Envoy proxy in Docker is provided:

```shell script
# this script assumes that `envoy.yaml` is in the current working directory
$ ./scripts/start-envoy.sh
```

You can modify the endpoint to connect to in `envoy.yaml`.

[the gRPC-Web protocol]: https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md

#### Updating Protobufs

If the protobuf files are ever found to be out of sync, you can update them easily as follows:

```shell script
$ ./scripts/update-protos.sh
```

This will temporarily clone https://github.com/hashgraph/hedera-protobuf and copy the protobufs from
there.

#### NOTE: some Protobufs have to be manually patched

In most places where `sint64` or `uint64` is used in the protobufs, they have to be patched
to annotate these fields as `[jstype=JS_STRING]` or the Protobufs-JS library will try to decode
them as JS `number` types which can only represent exact integers in the range `[-2^53, 2^53 - 1]`.

(This is only really necessary for values which may conceivably fall outside that range, like 
tinybar amounts. We're assuming for now that shard/realm/entity numbers will not exceed this range 
for a very long time.)

Since `update-protos.sh` will inevitably clobber these modifications, it has the feature of
automatically applying patches defined in `patches` to the files in `src/protos` after overwriting.
These patch files have the original filename and extension and then an additional `.patch` 
extension, e.g. `src/protos/CryptoCreate.proto` has a patch file at the path 
`patches/CryptoCreate.proto.patch`.

If you find a **new** file needs to be modified, you can make the modification in `src/protos`, and 
**before committing it**, run the following:

```shell script
$ git diff src/proto/[proto file] > patches/[proto file].patch 
```

Then check-in the `.patch` file that was created and commit it as well as the change to the Protobuf
file. Your modification will then be preserved across `update-protos.sh` runs.

If you need to add modifications to an **existing** patch file, you need to recreate the patch file
that contains both existing modifications as well as new modifications. If you run into this and
don't know how to proceed, don't be afraid to ask for help.