import { LocalWallet } from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    const wallet = new LocalWallet();

    const info = await wallet.getAccountInfo();

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
