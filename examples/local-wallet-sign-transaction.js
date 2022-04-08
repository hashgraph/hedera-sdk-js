import { Wallet, LocalProvider, TransferTransaction } from "@hashgraph/sdk";

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

    let transaction = await new TransferTransaction()
        .addHbarTransfer("0.0.3", 1)
        .addHbarTransfer(wallet.getAccountId(), -1)
        .freezeWithSigner(wallet);

    transaction = await transaction.signWithSigner(wallet);
    const response = await transaction.executeWithSigner(wallet);
    const receipt = await wallet.getProvider().waitForReceipt(response);

    console.log(`status: ${receipt.status.toString()}`);
}

void main();
