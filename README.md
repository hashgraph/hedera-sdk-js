# Introduction

## Hedera Hashgraph Javascript/Typescript SDK

> The Javascript/Typescript SDK for interacting with [Hedera Hashgraph](https://hedera.com/): the official distributed consensus platform built using the hashgraph consensus algorithm for fast, fair and secure transactions. Hedera enables and empowers developers to build an entirely new class of decentralized applications.

## Usage

This SDK supports both running in the browser \(with Webpack\) and in Node.

\(Code examples using `await` assume an `async` context.\)

## **Installation**

{% tabs %}
{% tab title="NPM" %}
```bash
$ npm install --save @hashgraph/sdk
```
{% endtab %}

{% tab title="Yarn" %}
```bash
$ yarn add @hashgraph/sdk
```
{% endtab %}
{% endtabs %}



```text
#### Creating a client
```typescript
import {Client} from "@hashgraph/sdk";

const client = new Client({ 
    // this key defaults to this url, a public free proxy to the Hedera public testnet
    // generously hosted by MyHederaWallet.com
    url: "https://grpc-web.myhederawallet.com",
    operator: {
        // the account which signs transactions and query payments by default
        account: { shard: 0, realm: 0, account: ___ },
        // the private key used to sign the transactions, either encoded as a string
        // or as an `Ed25519PrivateKey` type 
        privateKey: "..."
    },
});
```

**Checking your balance**

```typescript
console.log('current account balance:', await client.getAccountBalance());
```

**Sending a transfer**

```typescript
// the amount parameter can either be a `number` or a bignumber.js type
await client.transferCryptoTo({ shard: 0, realm: 0, account: ___ }, 10_000_000);
```

**Creating a new Account**

```typescript
import {Ed25519PrivateKey} from "@hashgraph/sdk";

// generate a new, cryptographically random private key
const privateKey = await Ed25519PrivateKey.generate();
const publicKey = privateKey.publicKey;

// second parameter is optional initial balance for new account, transferred from operator account
const newAccount = await client.createAccount(publicKey, 10_000_000);

console.log('new account: ', newAccount, 'public key: ', publicKey.toString(), ' private key: ', privateKey.toString());
```

### Development

To build the SDK from source, you must have the official Protobufs compiler, `protoc`, installed:

Arch \(with Pikaur\): \`\`\`shell script

## Pacman

$ sudo pacman -S protobuf

## with Pikaur

$ pikaur -S protobuf

```text
Ubuntu/Debian:
```shell script
# libprotobuf-dev contains the Protobuf definitions for standard types
$ sudo apt-get install protobuf-compiler libprotobuf-dev
```

#### Hosting your own Envoy Proxy

This SDK talks to Hedera Hashgraph through [the gRPC-Web protocol](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md) which allows it to function in a browser. By default, the SDK points to a public free proxy that connects through to `0.testnet.hedera.com:50211`. If you want to change this endpoint or simply host your own proxy, a script to easily start an Envoy proxy in Docker is provided:

\`\`\`shell script

## this script assumes that `envoy.yaml` is in the current working directory

$ ./scripts/start-envoy.sh

```text
You can modify the endpoint to connect to in `envoy.yaml`.

#### Updating Protobufs
If the protobuf files are ever found to be out of sync, you can update them easily as follows:
```shell script
$ ./scripts/update-protos.sh
```

This will temporarily clone [https://github.com/hashgraph/hedera-protobuf](https://github.com/hashgraph/hedera-protobuf) and copy the protobufs from there.

**NOTE: some Protobufs have to be manually patched**

In most places where `sint64` or `uint64` is used in the protobufs, they have to be patched to annotate these fields as `[jstype=JS_STRING]` or the Protobufs-JS library will try to decode them as JS `number` 



