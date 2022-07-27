import {
    Wallet,
    LocalProvider,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const wallet = new Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        new LocalProvider()
    );

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey.toString()}`);
    console.log(`public key = ${newKey.publicKey.toString()}`);

    let transaction = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(newKey.publicKey)
        .freezeWithSigner(wallet);

    transaction = await transaction.signWithSigner(wallet);

    const response = await transaction.executeWithSigner(wallet);

    const receipt = await response.getReceiptWithSigner(wallet);

    console.log(`account id = ${receipt.accountId.toString()}`);
}

void main();
