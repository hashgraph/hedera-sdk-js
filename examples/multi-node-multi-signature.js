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

let user1Key;
let user2Key;

async function main() {
    /**
     *
     *  Step 1: Create Client
     *
     **/
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

    /**
     *
     * Step 2: Create keys for the two users
     *
     **/
    user1Key = PrivateKey.generate();
    user2Key = PrivateKey.generate();

    const keyList = new KeyList([user1Key.publicKey, user2Key.publicKey]);

    /**
     *
     * Step 3: Create an account with the keyList
     *
     **/
    const createAccountTransaction = new AccountCreateTransaction()
        .setInitialBalance(new Hbar(2)) // 2 Hbars
        .setKey(keyList);

    const createResponse = await createAccountTransaction.execute(client);
    const createReceipt = await createResponse.getReceipt(client);

    /**
     *
     * Step 4: Create a transfer transaction with multiple nodes
     *
     **/
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

    /**
     *
     * Step 5:  Serialize the transaction
     *  & Collect multiple signatures (Uint8Array[]) from one key
     *
     **/

    const transferTransactionBytes = transferTransaction.toBytes();

    const user1Signatures = user1Key.signTransaction(transferTransaction);
    const user2Signatures = user2Key.signTransaction(transferTransaction);

    /**
     *
     * Step 6:  Deserialize the transaction
     *  & Add the previously collected signatures
     *
     **/
    const signedTransaction = Transaction.fromBytes(transferTransactionBytes);

    signedTransaction.addSignature(user1Key.publicKey, user1Signatures);
    signedTransaction.addSignature(user2Key.publicKey, user2Signatures);

    console.log("ADDED user signatures below: \n");

    if (Array.isArray(user1Signatures) && Array.isArray(user2Signatures)) {
        console.log(
            "user1Signatures =>",
            user1Signatures.map((user1Sig) =>
                PrivateKey.fromBytes(user1Sig).toStringDer(),
            ),
        );

        console.log(
            "user2Signatures =>",
            user2Signatures.map((user1Sig) =>
                PrivateKey.fromBytes(user1Sig).toStringDer(),
            ),
        );
    }

    const signaturesInTheTransaction = [];
    for (const transaction of signedTransaction._signedTransactions.list) {
        if (transaction.sigMap && transaction.sigMap.sigPair) {
            for (const sigPair of transaction.sigMap.sigPair) {
                if (sigPair.ed25519) {
                    signaturesInTheTransaction.push(
                        PrivateKey.fromBytesED25519(
                            sigPair.ed25519,
                        ).toStringDer(),
                    );
                } else if (sigPair.ECDSASecp256k1) {
                    signaturesInTheTransaction.push(
                        PrivateKey.fromBytesECDSA(
                            sigPair.ECDSASecp256k1,
                        ).toStringDer(),
                    );
                }
            }
        }
    }

    console.log("\n\nSignatures in the transaction: ");
    console.log(signaturesInTheTransaction);

    /**
     *
     * Step 7: Execute and take the receipt
     *
     **/
    const result = await signedTransaction.execute(client);

    const receipt = await result.getReceipt(client);

    console.log(`\n  \nTransaction status: ${receipt.status.toString()}`);

    client.close();
}

void main();
