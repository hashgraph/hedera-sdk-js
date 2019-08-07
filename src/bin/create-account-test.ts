#!/usr/bin/env node

import {Client} from "../Client";

const client = new Client({
    account: { shard: 0, realm: 0, account: 2 },
    key: 'PRIVATE KEY HERE DONT COMMIT'
});

client.createAccount().then(
    account => console.log(account),
    error => console.log(error)
);
