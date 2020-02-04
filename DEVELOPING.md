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
