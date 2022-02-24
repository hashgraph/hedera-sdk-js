import {
    Client,
    FileContentsQuery,
    PrivateKey,
    AccountId,
    ExchangeRateSet
} from "@hashgraph/sdk";

import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch (error) {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const resp = await new FileContentsQuery()
        .setFileId("0.0.112")
        .execute(client);

    const exchangeRateSet = ExchangeRateSet.fromBytes(resp);

    console.log(`Current numerator ${exchangeRateSet.currentRate.cents}`);
    console.log(`Current denominator ${exchangeRateSet.currentRate.hbars}`);
    console.log(`Current expiration time ${exchangeRateSet.currentRate.expirationTime.toString()}`);
    console.log(`Current Exchange Rate ${exchangeRateSet.currentRate.exchangeRate}`);

    console.log(`Next numerator ${exchangeRateSet.nextRate.cents}`);
    console.log(`Next denominator ${exchangeRateSet.nextRate.hbars}`);
    console.log(`Next expiration time ${exchangeRateSet.nextRate.expirationTime.toString()}`);
    console.log(`Next Exchange Rate ${exchangeRateSet.nextRate.exchangeRate}`);

}

void main();
