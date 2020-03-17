![](https://www.hedera.com/logo-capital-hbar-wordmark.jpg)

# Hedera™ Hashgraph JavaScript/TypeScript SDK

[![Actions Status](https://github.com/hashgraph/hedera-sdk-js/workflows/Node/badge.svg)](https://github.com/hashgraph/hedera-sdk-js/actions?query=workflow%3ANode)
[![npm](https://img.shields.io/npm/v/@hashgraph/sdk)](https://www.npmjs.com/package/@hashgraph/sdk)
[![Documentation](https://img.shields.io/badge/typedoc-reference-informational)](https://hashgraph.github.io/hedera-sdk-js/)
![NPM](https://img.shields.io/npm/l/@hashgraph/sdk)

> The Javascript/Typescript SDK for interacting with [Hedera Hashgraph]: the official distributed consensus
> platform built using the hashgraph consensus algorithm for fast, fair and secure
> transactions. Hedera enables and empowers developers to build an entirely new
> class of decentralized applications.

[Hedera Hashgraph]: https://hedera.com/

## Usage

This SDK supports both running in the browser (with Webpack) and in Node.

(Code examples using `await` assume an `async` context.)

#### Installation
```shell script
# with NPM
$ npm install --save @hashgraph/sdk
# with Yarn
$ yarn add @hashgraph/sdk
```

#### Creating a client
```typescript
import {Client} from "@hashgraph/sdk";

const client = new Client({ 
    // this key defaults to this url, a public free proxy to the Hedera public testnet
    // generously hosted by MyHederaWallet.com
    network: { "https://grpc-web.myhederawallet.com": "0.0.3" },
    operator: {
        // the account which signs transactions and query payments by default
        account: { shard: 0, realm: 0, account: ___ },
        // the private key used to sign the transactions, either encoded as a string
        // or as an `Ed25519PrivateKey` type 
        privateKey: "..."
    },
});
```

#### Checking your balance

```typescript
console.log('current account balance:', await client.getAccountBalance());
```

#### Sending a transfer

```typescript
// the amount parameter can either be a `number` or a bignumber.js type
new CryptoTransferTransaction()
    .addSender({ shard: 0, realm: 0, account: ___ }, 10_000_000)
    .addRecipient({ shard: 0, realm: 0, account: ___ }, 10_000_000)
    .build(client)
    .execute(client);
```

#### Creating a new Account

```typescript
import { Ed25519PrivateKey } from "@hashgraph/sdk";

const privateKey = await Ed25519PrivateKey.generate();
const publicKey = privateKey.publicKey;

const tx = new AccountCreateTransaction()
    .setKey(privateKey.publicKey)
    .setInitialBalance(0)
    .build(client);

await tx.execute(client);
const receipt = await tx.getReceipt(client);
const newAccount = receipt.accountId;

console.log('new account: ', newAccount, 'public key: ', publicKey.toString(), ' private key: ', privateKey.toString());
```

## Running locally

Do you want to run this SDK locally or help contribute? 

Checkout the [DEVELOPING.md](DEVELOPING.md) file to get started!

## Proxying from a browser

By default, you can specify which nodes you'd like to submit to, but this assumes that you're running in a server environment. If you're running from the browser, the SDK defaults to a gRPC proxy hosted by [myhbarwallet](https://myhbarwallet.com/) and the [LaunchBadge](https://launchbadge.com/) team. If you'd like to run your own proxy, please checkout the [PROXY.md](PROXY.md) file to get setup!

### DISCLAIMER

This project is actively under development and not recommended for production use. Join the [Hedera discord](https://hedera.com/discord) for the latest updates and announcements.

### LICENSE

Copyright 2019 Hedera Hashgraph LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
