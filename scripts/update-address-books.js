import { Client, FileId, AddressBookQuery } from "../src/index.js";

import fs from "node:fs/promises";

async function main() {
    if (process.env.HEDERA_NETWORK == null) {
        throw new Error("Environment variable HEDERA_NETWORK is required.");
    }

    const networks = [
        { name: "previewnet" },
        { name: "testnet" },
        { name: "mainnet", url: "mainnet-public.mirrornode.hedera.com:5600" },
    ];

    for (const network of networks) {
        const client = Client.forName(network.name);

        if (network.url != null) {
            client.setMirrorNetwork([network.url]).setTransportSecurity(true);
        }

        const addressBook = await new AddressBookQuery()
            .setFileId(FileId.ADDRESS_BOOK)
            .execute(client);

        await fs.writeFile(
            `./src/client/addressbooks/${network.name}.js`,
            `export const addressBook = "${Buffer.from(
                addressBook.toBytes()
            ).toString("hex")}";`
        );
    }
}

void main();
