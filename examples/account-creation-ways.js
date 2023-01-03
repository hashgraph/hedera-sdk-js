import {
    AccountId,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {

    /*  ADD EXAMPLES FOR

        An account can have an account ID in shard.realm.accountNumber format (0.0.10)
        An account can have a public key alias in 0.0.CIQNOWUYAGBLCCVX2VF75U6JMQDTUDXBOLZ5VJRDEWXQEGTI64DVCGQ format
        An account can have an AccountId that is represented in 0x000000000000000000000000000000000000000a (for account ID 0.0.10) long zero format
        An account have be represented by an Ethereum public address 0xb794f5ea0ba39494ce839613fffba74279579268
    */

    const test1 = AccountId.fromString("0.0.2");
    const test2 = AccountId.fromString("0.0.302a300506032b6570032100114e6abc371b82dab5c15ea149f02d34a012087b163516dd70f44acafabf7777");
    const test3 = AccountId.fromString("0.0.b794f5ea0ba39494ce839613fffba74279579268");
    const test4 = AccountId.fromString("0xb794f5ea0ba39494ce839613fffba74279579268");

    console.log(`test1 ${JSON.stringify(test1)}`);
    console.log(`test2 ${JSON.stringify(test2)}`);
    console.log(`test3 ${JSON.stringify(test3)}`);
    console.log(`test4 ${JSON.stringify(test4)}`);


}

void main();