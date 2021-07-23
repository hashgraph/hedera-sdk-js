require("dotenv").config();

const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
} = require("@hashgraph/sdk");

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

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey}`);
    console.log(`public key = ${newKey.publicKey}`);

    const response = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(newKey.publicKey)
        .execute(client);

    const receipt = await response.getReceipt(client);

    console.log(`account id = ${receipt.accountId}`);
}

void main();
