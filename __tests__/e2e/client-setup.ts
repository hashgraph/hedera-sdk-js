import { Client, AccountId, Ed25519PrivateKey } from "../../src/index-node";
import * as fs from "fs";
import * as util from "util";
import { assert } from "console";

export async function getClientForIntegrationTest(): Promise<Client> {
    let client: Client;

    if (process.env.CONFIG_FILE != null) {
        const configPath = process.env.CONFIG_FILE;

        try {
            const file = await util.promisify(fs.readFile)(configPath);
            client = Client.fromJson(file.toString());
        } catch {
            // fallback to testnet
            console.log("Failed to use client network. Using testnet instead.");
            client = Client.forTestnet();
        }
    } else {
        client = Client.forTestnet();
    }

    if (process.env.OPERATOR_ID != null && process.env.OPERATOR_KEY != null) {
        try {
            const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
            const operatorKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
            client.setOperator(operatorId, operatorKey);
        } catch (error) {
            console.error(error);
        }
    }

    assert(client._getOperatorAccountId() != null, "operator account id was not provided in config file or environment");
    assert(client._getOperatorKey() != null, "operator key was not provided in config file or environment");

    return client;
}
