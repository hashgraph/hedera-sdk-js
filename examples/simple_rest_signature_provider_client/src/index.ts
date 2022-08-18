import * as hashgraph from "@hashgraph/sdk";
import { SimpleRestSigner } from "./signer";

async function main() {
    const signer = await SimpleRestSigner.connect();

    // Free query
    const balance = await signer.getAccountBalance();
    console.log(`balance: ${balance.hbars.toString()}`);

    // Paid query
    const info = await signer.getAccountInfo();
    console.log(`key: ${info.key.toString()}`);

    // Transaction
    const transaction = await new hashgraph.TransferTransaction()
        .addHbarTransfer("0.0.3", hashgraph.Hbar.fromTinybars(1))
        .addHbarTransfer(
            signer.getAccountId(),
            hashgraph.Hbar.fromTinybars(1).negated()
        )
        .freezeWithSigner(signer);
    const response = await transaction.executeWithSigner(signer);
    const hash = Buffer.from(response.transactionHash).toString("hex");
    console.log(`hash: ${hash}`);
}

void main();
