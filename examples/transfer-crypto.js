#!/usr/bin/env node

const {Client} = require("@hashgraph/sdk");

const privateKey = process.env['OPERATOR_KEY'];

if (!privateKey) {
    throw new Error('missing env var OPERATOR_KEY');
}

const client = new Client({
    operator: {
        account: { shard: 0, realm: 0, account: 2 },
        privateKey
    }
});

(async function () {
    console.log('balance before transfer', await client.getAccountBalance());
    await client.transferCryptoTo({ shard: 0, realm: 0, account: 3 }, 10000);
    console.log('balance after transfer', await client.getAccountBalance());
})();
