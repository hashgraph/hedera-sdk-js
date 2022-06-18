import {
    Wallet,
    LocalProvider,
    FileContentsQuery,
    ExchangeRates,
} from "@hashgraph/sdk";

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

    const resp = await new FileContentsQuery()
        .setFileId("0.0.112")
        .executeWithSigner(wallet);

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
