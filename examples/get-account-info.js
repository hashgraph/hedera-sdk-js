#!/usr/bin/env node

const {AccountInfoQuery, Client} = require("@hashgraph/sdk");

const privateKey = process.env['OPERATOR_KEY'];

if (!privateKey) {
    throw new Error('missing env var OPERATOR_KEY');
}

const client = new Client({
    operator: {
        account: {shard: 0, realm: 0, account: 2},
        privateKey
    }
});

const accountId = { shard: 0, realm: 0, account: 3 };

(async function () {
    console.log('account info:', JSON.stringify(await new AccountInfoQuery(client).setAccountId(accountId).execute()));
})();
