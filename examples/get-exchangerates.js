import {
    Client,
    FileContentsQuery,
    PrivateKey,
    AccountId,
    ExchangeRates,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

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

    const exchangeRates = ExchangeRates.fromBytes(resp);

    console.log(`Current numerator ${exchangeRates.currentRate.cents}`);
    console.log(`Current denominator ${exchangeRates.currentRate.hbars}`);
    console.log(
        `Current expiration time ${exchangeRates.currentRate.expirationTime.toString()}`
    );
    console.log(
        `Current Exchange Rate ${exchangeRates.currentRate.exchangeRateInCents}`
    );

    console.log(`Next numerator ${exchangeRates.nextRate.cents}`);
    console.log(`Next denominator ${exchangeRates.nextRate.hbars}`);
    console.log(
        `Next expiration time ${exchangeRates.nextRate.expirationTime.toString()}`
    );
    console.log(
        `Next Exchange Rate ${exchangeRates.nextRate.exchangeRateInCents}`
    );
}

void main();
