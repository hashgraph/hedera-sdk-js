require("dotenv").config();

const { Client, AccountInfoQuery, Hbar, AccountId, PrivateKey } = require("@hashgraph/sdk");

async function main() {
    let client;

    if (process.env.HEDERA_NETWORK != null) {
        if (process.env.OPERATOR_KEY != null) {
            if (process.env.OPERATOR_ID != null) {
                client = Client.forName(process.env.HEDERA_NETWORK);   
                
                const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
                const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
        
                client.setOperator(operatorId, operatorKey);
            }
            else {
                throw new Error("Environment Variable:\tOPERATOR_ID is required to initialize the client.");
            }
        }
        else {
            throw new Error("Environment Variable:\tOPERATOR_KEY is required to initialize the client.");
        }
    }
    else {
        throw new Error("Environment Variable:\tHEDERA_NETWORK is required to initialize the client.\nThis value can be \"mainnet\", \"testnet\", or \"previewnet\".");
    }

    const info = await new AccountInfoQuery()
        .setAccountId(client.operatorAccountId)
        .setQueryPayment(new Hbar(1))
        .execute(client);

    console.log(`info.key                          = ${info.key}`);

    console.log(
        `info.isReceiverSignatureRequired  =`,
        info.isReceiverSignatureRequired
    );

    console.log(
        `info.expirationTime               = ${info.expirationTime.toDate()}`
    );
}

void main();
