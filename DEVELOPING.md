## Development

To build the SDK from source, you must have the official Protobufs compiler, `protoc`, installed:

Arch (with Pikaur):

```shell script
# Pacman
$ sudo pacman -S protobuf
# with Pikaur
$ pikaur -S protobuf
```

Ubuntu/Debian:

```shell script
# libprotobuf-dev contains the Protobuf definitions for standard types
$ sudo apt-get install protobuf-compiler libprotobuf-dev
```

Mac OSX:

```shell script
# Homebrew
$ brew install protobuf
```

## Running unit tests

```sh
$ yarn test:unit
```


## Running integration tests

Integration tests are run against the Hedera test network by default. You can override this by setting the `CONFIG_FILE` environment variable to point to a JSON file with the overrides.

```sh
$ env CONFIG_FILE="path/to/custom/config.json" yarn test:e2e
```

An example configuration file can be found in the repo [here](__tests__/e2e/client-config-with-operator.json).

The format of the configuration file should be as follows:
```json
{
    "network": {
        "<NodeAddress>": "<NodeAccountId>",
        ... 
    },
    "operator": {
        "accountId": "<shard.realm.num>",
        "privateKey": "<PrivateKey>"
    }
}
```

If you don't override the config you still need to provide operator id and key, which you can do with `OPERATOR_ID` and `OPERATOR_KEY` environment variables, respectively.