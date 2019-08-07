#!/usr/bin/env node

import {Client} from "../Client";
import {generateKeyAndMnemonic} from "../Keys";

import {grpc} from "@improbable-eng/grpc-web";
import {NodeHttpTransport} from "@improbable-eng/grpc-web-node-http-transport/lib";

grpc.setDefaultTransport(NodeHttpTransport());

const client = new Client({
    account: { shard: 0, realm: 0, account: 2 },
    // DO NOT COMMIT THIS LINE
    key: 'PRIVATE KEY HERE'
});

const { publicKey, keyString, mnemonic } = generateKeyAndMnemonic();

console.log("key:", keyString);
console.log("mnemonic:", mnemonic);

client.createAccount(publicKey).then(
    account => console.log(account),
    error => console.log(error)
);
