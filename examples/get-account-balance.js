#!/usr/bin/env node

const { Client } = require("@hashgraph/sdk");

const privateKey = process.env.OPERATOR_KEY;

if (!privateKey) {
    throw new Error("missing env var OPERATOR_KEY");
}

const client = new Client({
    operator: {
        account: { shard: 0, realm: 0, account: 82078 },
        privateKey
    }
});

(async function() {
    console.log("account balance:", (await client.getAccountBalance()).toString());
}());
