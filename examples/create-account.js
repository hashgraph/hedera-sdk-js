#!/usr/bin/env node

const {Client, generateMnemonic} = require("@hashgraph/sdk");

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

(async function () {
    const {mnemonic, generateKey} = generateMnemonic();
    const privateKey = await generateKey();

    console.log("privateKey:", privateKey.toString());
    console.log("mnemonic:", mnemonic);

    console.log(await client.createAccount(privateKey.publicKey));
})();
