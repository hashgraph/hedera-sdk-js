import { Wallet, LocalProvider, AccountBalanceQuery } from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (
        process.env.OPERATOR_ID == null ||
        process.env.OPERATOR_KEY == null ||
        process.env.HEDERA_NETWORK == null
    ) {
        throw new Error(
            "Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required."
        );
    }

    const wallet = new Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        new LocalProvider()
    );

    const balance = await new AccountBalanceQuery()
        .setAccountId(wallet.getAccountId())
        .executeWithSigner(wallet);

    console.log(
        `${wallet
            .getAccountId()
            .toString()} balance = ${balance.hbars.toString()}`
    );
}

void main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
