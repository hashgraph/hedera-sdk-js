import { Wallet, LocalProvider, AccountInfoQuery, Hbar } from "@hashgraph/sdk";

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

    const info = await new AccountInfoQuery()
        .setAccountId(wallet.getAccountId())
        .setQueryPayment(new Hbar(1))
        .executeWithSigner(wallet);

    console.log(`info.key                          = ${info.key.toString()}`);

    console.log(
        `info.isReceiverSignatureRequired  =`,
        info.isReceiverSignatureRequired
    );

    console.log(
        `info.expirationTime               = ${info.expirationTime
            .toDate()
            .toString()}`
    );
}

void main();
