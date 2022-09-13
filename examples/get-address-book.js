import { Client, FileId, AddressBookQuery } from "@hashgraph/sdk";

import fs from "node:fs/promises";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (process.env.HEDERA_NETWORK == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const client = Client.forName(process.env.HEDERA_NETWORK);

    if (process.env.HEDERA_NETWORK.toLowerCase() === "mainnet") {
        client
            .setMirrorNetwork(["mainnet-public.mirrornode.hedera.com:5600"])
            .setTransportSecurity(true);
    }

    const addressBook = await new AddressBookQuery()
        .setFileId(FileId.ADDRESS_BOOK)
        .execute(client);

    console.log(JSON.stringify(addressBook.toJSON(), null, 2));

    await fs.writeFile("address-book.proto.bin", addressBook.toBytes());
}

void main();
