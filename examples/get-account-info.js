require("dotenv").config();

const { Client, AccountInfoQuery, Hbar } = require("@hashgraph/sdk");

async function main() {
    const client = Client.forTestnet().setOperator(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY
    );

    const info = await new AccountInfoQuery()
        .setAccountId("0.0.1001")
        .setQueryPayment(new Hbar(1))
        .execute(client);

    console.log(`0.0.1001 info.key                          = ${info.key}`);

    console.log(
        `0.0.1001 info.isReceiverSignatureRequired  =`,
        info.isReceiverSignatureRequired
    );

    console.log(
        `0.0.1001 info.expirationTime               = ${info.expirationTime.toDate()}`
    );
}

void main();
