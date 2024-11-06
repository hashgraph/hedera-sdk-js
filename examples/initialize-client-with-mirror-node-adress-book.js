import {
    AccountCreateTransaction,
    Client,
    PrivateKey,
    Hbar,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

/**
 * @description Initialize a client with only mirror node network address and create account with it
 */

async function main() {
    // Ensure required environment variables are available
    dotenv.config();

    // Ensure that they are testnet variables
    if (
        !process.env.OPERATOR_KEY ||
        !process.env.OPERATOR_ID ||
        !process.env.HEDERA_NETWORK
    ) {
        throw new Error("Please set required keys in .env file.");
    }

    const accountKey = PrivateKey.generate();

    const client = (
        await Client.forMirrorNetwork("testnet.mirrornode.hedera.com:443")
    ).setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

    try {
        let transaction = new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10)) // 10 h
            .setKey(accountKey)
            .freezeWith(client);

        transaction = await transaction.sign(accountKey);

        const response = await transaction.execute(client);

        const receipt = await response.getReceipt(client);

        console.log(`account id = ${receipt.accountId.toString()}`);
    } catch (error) {
        console.log(error);
    }
}
void main();
