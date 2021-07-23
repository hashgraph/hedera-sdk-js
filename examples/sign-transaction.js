require("dotenv").config();

const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    TransferTransaction,
} = require("@hashgraph/sdk");

let user1Key;
let user2Key;

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

    user1Key = PrivateKey.generate();
    user2Key = PrivateKey.generate();

    // create a multi-sig account
    const keyList = new KeyList([user1Key, user2Key]);

    const createAccountTransaction = new AccountCreateTransaction()
        .setInitialBalance(new Hbar(2)) // 5 h
        .setKey(keyList);

    const response = await createAccountTransaction.execute(client);

    let receipt = await response.getReceipt(client);

    console.log(`account id = ${receipt.accountId}`);

    // create a transfer from new account to 0.0.3
    const transferTransaction = new TransferTransaction()
        .setNodeAccountIds([new AccountId(3)])
        .addHbarTransfer(receipt.accountId, -1)
        .addHbarTransfer("0.0.3", 1)
        .freezeWith(client);

    await transferTransaction.signWithOperator(client);
    user1Key.signTransaction(transferTransaction);
    user2Key.signTransaction(transferTransaction);

    const result = await transferTransaction.execute(client);
    receipt = await result.getReceipt(client);
    console.log(receipt.status.toString());
}

void main();
