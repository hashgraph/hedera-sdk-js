import { LocalWallet, TransferTransaction } from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    const wallet = new LocalWallet();

    let transaction = new TransferTransaction()
        .addHbarTransfer("0.0.3", 1)
        .addHbarTransfer(wallet.getAccountId(), -1);

    const populatedTransaction = await wallet.populateTransaction(transaction);
    const signedTransaction = await wallet.signTransaction(populatedTransaction);
    const response = await wallet.sendRequest(signedTransaction);
    const receipt = await wallet.getProvider().waitForReceipt(response);

    console.log(`status: ${receipt.status.toString()}`);
}

void main();
