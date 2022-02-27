import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    Hbar,
    AccountId,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch (error) {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey.toString()}`);
    console.log(`public key = ${newKey.publicKey.toString()}`);

    const response = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(newKey.publicKey)
        .execute(client);

    const receipt = await response.getReceipt(client);

    console.log(`created account id = ${receipt.accountId.toString()}`);

    const transaction = new AccountDeleteTransaction()
        .setNodeAccountIds([response.nodeId])
        .setAccountId(receipt.accountId)
        .setTransferAccountId(client.operatorAccountId)
        .freezeWith(client);

    newKey.signTransaction(transaction);

    await transaction.execute(client);

    console.log(`deleted account id = ${receipt.accountId.toString()}`);
}

void main();
