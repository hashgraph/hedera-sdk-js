import { Wallet, LocalProvider, PrngTransaction } from "@hashgraph/sdk";

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

    const response = await new PrngTransaction()
        .setRange(100)
        .executeWithSigner(wallet);

    const record = await response.getRecordWithSigner(wallet);
    console.log(`The random number generated is: ${record.prngNumber}`);
}

void main();
