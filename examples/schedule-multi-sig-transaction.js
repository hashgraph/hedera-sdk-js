require("dotenv").config();

const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    TransferTransaction,
    ScheduleSignTransaction,
    ScheduleInfoQuery,
    TransactionId,
} = require("@hashgraph/sdk");

let user1Key;
let user2Key;
let user3Key;

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
    user3Key = PrivateKey.generate();

    console.log(`private key for user 1= ${user1Key}`);
    console.log(`public key for user 1= ${user1Key.publicKey}`);
    console.log(`private key for user 2= ${user2Key}`);
    console.log(`public key for user 2= ${user2Key.publicKey}`);
    console.log(`private key for user 3= ${user3Key}`);
    console.log(`public key for user 3= ${user3Key.publicKey}`);

    // create a multi-sig account
    const keyList = new KeyList([user1Key, user2Key, user3Key]);

    const createAccountTransaction = new AccountCreateTransaction()
        .setNodeAccountIds([new AccountId(3)])
        .setInitialBalance(new Hbar(2)) // 5 h
        .setKey(keyList);

    const response = await createAccountTransaction.execute(client);

    let receipt = await response.getReceipt(client);

    const accountId = receipt.accountId;

    console.log(`account id = ${accountId}`);

    let transactionId = TransactionId.generate(client.operatorAccountId);

    console.log(`transactionId for scheduled transaction =  ${transactionId}`);

    // create a transfer from new account to 0.0.3
    const transferTransaction = new TransferTransaction()
        .addHbarTransfer(receipt.accountId, -1)
        .addHbarTransfer(client.operatorAccountId, 1);

    let scheduled = await (await transferTransaction.schedule()
        .sign(user1Key))
        .sign(user2Key);

    let scheduleResponse = await scheduled.execute(client);

    let scheduleReceipt = await scheduleResponse.getReceipt(client);

    const scheduleId = scheduleReceipt.scheduleId;

    console.log(`scheduleId =  ${scheduleId}`);

    const scheduleInfo = await new ScheduleInfoQuery()
        .setNodeAccountIds([new AccountId(3)])
        .setScheduleId(scheduleId)
        .execute(client);

    let transfer = scheduleInfo.scheduledTransaction
    let transfers = transfer.hbarTransfers;

    if (transfers.size !== 2) {
        throw new Error("more transfers than expected " + transfers.size);
    }

    if (!transfers.get(accountId).toTinybars().equals(new Hbar(1).negated().toTinybars())) {
        console.log(new Hbar(1).negated().toTinybars())
        throw new Error("transfer for " + accountId + " is not what is expected " + transfers.get(accountId));
    }

    if (!transfers.get(client.operatorAccountId).toTinybars().equals(new Hbar(1).toTinybars())) {
        throw new Error("transfer for " + client.operatorAccountId + " is not what is expected " + transfers.get(client.operatorAccountId));
    }

    console.log("sending schedule sign transaction");

    await (await (await new ScheduleSignTransaction()
        .setNodeAccountIds([new AccountId(3)])
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(user3Key))
        .execute(client))
        .getReceipt(client);

    await new ScheduleInfoQuery()
        .setNodeAccountIds([new AccountId(3)])
        .setScheduleId(scheduleId)
        .execute(client);
}

void main();
