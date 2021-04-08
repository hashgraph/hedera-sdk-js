require("dotenv").config();

const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    TransferTransaction,
    Transaction
} = require("@hashgraph/sdk");

let user1Key;
let user2Key;

async function main() {
    let client;

    if (process.env.HEDERA_NETWORK != null) {
        switch (process.env.HEDERA_NETWORK) {
            case "previewnet":
                client = Client.forPreviewnet();
                break;
            default:
                client = Client.forTestnet();
        }
    } else {
        try {
            client = await Client.fromConfigFile(process.env.CONFIG_FILE);
        } catch (err) {
            client = Client.forTestnet();
        }
    }

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorId = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorId, operatorKey);
    }

    user1Key = PrivateKey.generate();
    user2Key = PrivateKey.generate();

    console.log(`private key for user 1= ${user1Key}`);
    console.log(`public key for user 1= ${user1Key.publicKey}`);
    console.log(`private key for user 2= ${user2Key}`);
    console.log(`public key for user 2= ${user2Key.publicKey}`);

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

    // convert transaction to bytes to send to signatories
    const transactionBytes = transferTransaction.toBytes();
    const transactionToExecute = Transaction.fromBytes(transactionBytes);

    // ask users to sign and return signature
    const user1Signature = await user1Signs(transactionBytes);
    const user2Signature = await user2Signs(transactionBytes);

    // recreate the transaction from bytes
    await transactionToExecute.signWithOperator(client);
    transactionToExecute.addSignature(user1Key.publicKey, user1Signature);
    transactionToExecute.addSignature(user2Key.publicKey, user2Signature);

    const result = await transactionToExecute.execute(client);
    receipt = await result.getReceipt(client);
    console.log(receipt.status.toString());
}

async function user1Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    const signature = await user1Key.signTransaction(transaction);
    return signature;
}

async function user2Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    const signature = await user2Key.signTransaction(transaction);
    return signature;
}

void main();
