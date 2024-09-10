import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    TransferTransaction,
} from "@hashgraph/sdk";

import Transaction from "../src/transaction/Transaction.js";

import dotenv from "dotenv";

dotenv.config();

let user1Key;
let user2Key;

async function main() {
    if (
        process.env.OPERATOR_ID == null ||
        process.env.OPERATOR_KEY == null ||
        process.env.HEDERA_NETWORK == null
    ) {
        throw new Error(
            "Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.",
        );
    }

    const client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
        AccountId.fromString(process.env.OPERATOR_ID),
        PrivateKey.fromStringED25519(process.env.OPERATOR_KEY),
    );

    user1Key = PrivateKey.generate();
    user2Key = PrivateKey.generate();

    const keyList = new KeyList([user1Key.publicKey, user2Key.publicKey]);

    const createAccountTransaction = new AccountCreateTransaction()
        .setInitialBalance(new Hbar(2)) // 2 Hbars
        .setKey(keyList);

    const createResponse = await createAccountTransaction.execute(client);
    const createReceipt = await createResponse.getReceipt(client);

    console.log(`New account ID: ${createReceipt.accountId.toString()}`);

    const transferTransaction = new TransferTransaction()
        .addHbarTransfer(createReceipt.accountId, new Hbar(-1))
        .addHbarTransfer("0.0.3", new Hbar(1))
        // Set multiple nodes
        .setNodeAccountIds([
            new AccountId(3),
            new AccountId(4),
            new AccountId(5),
        ])
        .freezeWith(client);

    // Serialize the transaction
    const transferTransactionBytes = transferTransaction.toBytes();

    // Collect multiple signatures (Uint8Array[]) from one key
    const user1Signatures = user1Key.signTransaction(transferTransaction);
    const user2Signatures = user2Key.signTransaction(transferTransaction);

    // Deserialize the transaction
    const signedTransaction = Transaction.fromBytes(transferTransactionBytes);

    // @ts-ignore
    signedTransaction.addSignature(user1Key.publicKey, user1Signatures);
    // @ts-ignore
    signedTransaction.addSignature(user2Key.publicKey, user2Signatures);

    const removeUser1Signatures = signedTransaction.removeSignature(
        // @ts-ignore
        user1Key.publicKey,
    );

    // @ts-ignore
    signedTransaction.addSignature(user1Key.publicKey, removeUser1Signatures);

    // @ts-ignore
    const result = await signedTransaction.execute(client);
    // @ts-ignore
    const receipt = await result.getReceipt(client);

    console.log(`Transaction status: ${receipt.status.toString()}`);

    client.close();
}

void main();
