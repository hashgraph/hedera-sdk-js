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

/** @type {PrivateKey | undefined} */
let user3Key;

/** @type {PrivateKey | undefined} */
let user4Key;

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
        PrivateKey.fromStringDer(process.env.OPERATOR_KEY),
    );

    user1Key = PrivateKey.generateECDSA();
    user2Key = PrivateKey.generate();
    user3Key = PrivateKey.generate();
    user4Key = PrivateKey.generateECDSA();

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
        .setNodeAccountIds([
            new AccountId(3),
            new AccountId(4),
            new AccountId(5),
        ])
        .addHbarTransfer(receipt.accountId, -1)
        .addHbarTransfer("0.0.3", 1)
        .freezeWith(client);

    // convert transaction to bytes to send to signatories
    const transactionBytes = transferTransaction.toBytes();
    const transactionToExecute = Transaction.fromBytes(transactionBytes);

    // ask users to sign and return signature
    const user1Signature = user1Signs(transactionBytes);
    const user2Signature = user2Signs(transactionBytes);
    const user3Signature = user3Signs(transactionBytes);
    const user4Signature = user4Signs(transactionBytes);

    try {
        await transactionToExecute.signWithOperator(client);
        transactionToExecute.addSignature(user2Key.publicKey, user2Signature);
        transactionToExecute.addSignature(user1Key.publicKey, user1Signature);
        transactionToExecute.addSignature(user4Key.publicKey, user4Signature);
        transactionToExecute.addSignature(user3Key.publicKey, user3Signature);
        console.log("\nSIGNATURES BEFORE SERIALIZATION");
        // Iterate over the signed transactions and print the signatures BEFORE serialization
        for (const transaction of transactionToExecute._signedTransactions
            .list) {
            if (transaction.sigMap && transaction.sigMap.sigPair) {
                for (const sigPair of transaction.sigMap.sigPair) {
                    if (sigPair.ed25519) {
                        console.log(
                            PrivateKey.fromBytesED25519(
                                sigPair.ed25519,
                            ).toStringDer(),
                        );
                    } else if (sigPair.ECDSASecp256k1) {
                        console.log(
                            PrivateKey.fromBytesECDSA(
                                sigPair.ECDSASecp256k1,
                            ).toStringDer(),
                        );
                    }
                }
            }
        }

        console.log("\n");
        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
        console.log("\n");

        const transactionBytes = transactionToExecute.toBytes();

        // recreate the transaction from bytes
        let transactionFromBytes = Transaction.fromBytes(transactionBytes);

        console.log("SIGNATURES AFTER SERIALIZATION");
        // Iterate over the signed transactions and print the signatures AFTER serialization
        for (const transaction of transactionFromBytes._signedTransactions
            .list) {
            if (transaction.sigMap && transaction.sigMap.sigPair) {
                for (const sigPair of transaction.sigMap.sigPair) {
                    if (sigPair.ed25519) {
                        console.log(
                            PrivateKey.fromBytesED25519(
                                sigPair.ed25519,
                            ).toStringDer(),
                        );
                    } else if (sigPair.ECDSASecp256k1) {
                        console.log(
                            PrivateKey.fromBytesECDSA(
                                sigPair.ECDSASecp256k1,
                            ).toStringDer(),
                        );
                    }
                }
            }
        }

        const result = await transactionFromBytes.execute(client);
        receipt = await result.getReceipt(client);
        console.log(`Status: ${receipt.status.toString()}`);
    } catch (error) {
        console.error(error);
    }

    client.close();
}

/**
 * @param {Uint8Array} transactionBytes
 * @returns {Uint8Array}
 */
function user1Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    try {
        return user1Key.signTransaction(transaction);
    } catch (error) {
        console.log(error);
    }
}

/**
 * @param {Uint8Array} transactionBytes
 * @returns {Uint8Array}
 */
function user2Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    return user2Key.signTransaction(transaction);
}

/**
 * @param {Uint8Array} transactionBytes
 * @returns {Uint8Array}
 */
function user3Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    return user3Key.signTransaction(transaction);
}

/**
 * @param {Uint8Array} transactionBytes
 * @returns {Uint8Array}
 */
function user4Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    return user4Key.signTransaction(transaction);
}

void main();
