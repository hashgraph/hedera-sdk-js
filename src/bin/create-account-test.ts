#!/usr/bin/env node

import {Client} from "../Client";
import {generateKeyAndMnemonic} from "../Keys";

import {grpc} from "@improbable-eng/grpc-web";
import {NodeHttpTransport} from "@improbable-eng/grpc-web-node-http-transport/lib";

grpc.setDefaultTransport(NodeHttpTransport());

const privateKey = process.env['OPERATOR_KEY'];

if (!privateKey) {
    throw new Error('missing env var OPERATOR_KEY');
}

const client = new Client({
    account: { shard: 0, realm: 0, account: 2 },
    privateKey
});

(async function() {
    const { publicKey, keyString, mnemonic } = await generateKeyAndMnemonic();

    console.log("privateKey:", keyString);
    console.log("mnemonic:", mnemonic);

    console.log(await client.createAccount(publicKey));
})();
