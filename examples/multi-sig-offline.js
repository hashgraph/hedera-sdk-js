import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    TransferTransaction,
    Transaction,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

/** @type {PrivateKey | undefined} */
let user1Key;

/** @type {PrivateKey | undefined} */
let user2Key;

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

    user1Key = PrivateKey.generate();
    user2Key = PrivateKey.generate();

    console.log(`private key for user 1= ${user1Key.toString()}`);
    console.log(`public key for user 1= ${user1Key.publicKey.toString()}`);
    console.log(`private key for user 2= ${user2Key.toString()}`);
    console.log(`public key for user 2= ${user2Key.publicKey.toString()}`);

    // create a multi-sig account
    const keyList = new KeyList([user1Key, user2Key]);

    const createAccountTransaction = new AccountCreateTransaction()
        .setInitialBalance(new Hbar(2)) // 5 h
        .setKey(keyList);

    const response = await createAccountTransaction.execute(client);

    let receipt = await response.getReceipt(client);

    console.log(`account id = ${receipt.accountId.toString()}`);

    // create a transfer from new account to 0.0.3
    const transferTransaction = new TransferTransaction()
        .setNodeAccountIds([new AccountId(3)])
        .addHbarTransfer(receipt.accountId, -1)
        .addHbarTransfer("0.0.3", 1)
        .freezeWith(client);

    // convert transaction to bytes to send to signatories
    const transactionBytes = transferTransaction.toBytes();
    const transactionToExecute = Transaction.fromBytes(transactionBytes);

    // ask users to sign and return signature
    const user1Signature = user1Signs(transactionBytes);
    const user2Signature = user2Signs(transactionBytes);

    // recreate the transaction from bytes
    await transactionToExecute.signWithOperator(client);
    transactionToExecute.addSignature(user1Key.publicKey, user1Signature);
    transactionToExecute.addSignature(user2Key.publicKey, user2Signature);

    const result = await transactionToExecute.execute(client);
    receipt = await result.getReceipt(client);
    console.log(receipt.status.toString());
}

/**
 * @param {Uint8Array} transactionBytes
 * @returns {Uint8Array}
 */
function user1Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    return user1Key.signTransaction(transaction);
}

/**
 * @param {Uint8Array} transactionBytes
 * @returns {Uint8Array}
 */
function user2Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    return user2Key.signTransaction(transaction);
}

void main();
