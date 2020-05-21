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

// Create a Testnet client. To create a mainnet client use `Client.forMainnet()`
// or if using a custom network use `Client.forNetwork()`
const client = Client.forTestnet()
    // Set operator AccountId and PrivateKey
    //
    // The account ID can be a string, or nubmer, or an `AccountId` type and is used
    // to sign transcations and query payments built with this client. This example
    // uses "0.0.101" is used as the operator account ID.
    //
    // The private key can be a string or an `Ed25519PrivateKey` type which will be used
    // to sign transactions built with the client.
    //
    // The private key is used to sign the transactions, either encoded as a string
    // or as an `Ed25519PrivateKey` type 
    .setOperator("0.0.101", "...");

// To validate the network is up and the client can connect to it you can call 
// the `Client.ping()` method. If the network is up nothing will happen, if
// the network is down, or the client failed to connect to the network for some
// other reason then this call would throw an error.
await client.ping();
```

#### Checking your balance

```typescript
console.log('current account balance:', await AccountBalanceQuery()
    .setAccountId("0.0.101")
    .execute(client)
);
```

#### Sending a transfer

```typescript
// The first parameter to `addSender()` or `.addRecipient()` can be a number,
// a string, or an `AccountId` type. This uses "0.0.101" and "0.0.102" as examples.
//
// The second paramter is the amount and it can be either a `number` or a `bignumber.js`
// type
new CryptoTransferTransaction()
    .addSender("0.0.101", 10_000_000)
    .addRecipient("0.0.102", 10_000_000)
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
