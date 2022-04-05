import { LocalWallet, TransferTransaction } from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    const wallet = new LocalWallet();

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
