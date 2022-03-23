import {
    Client,
    PrivateKey,
    AccountId,
    KeyList,
    AccountCreateTransaction,
    Hbar,
    AccountBalanceQuery,
    TransferTransaction,
    ScheduleSignTransaction,
    ScheduleInfoQuery,
    TransactionRecordQuery,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

/**
 * @typedef {import("@hashgraph/sdk").AccountBalance} AccountBalance
 */

async function main() {
    // set up client
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

    // generate keys
    const privateKeyList = [];
    const publicKeyList = [];
    for (let i = 0; i < 4; i++) {
        const privateKey = PrivateKey.generate();
        const publicKey = privateKey.publicKey;
        privateKeyList.push(privateKey);
        publicKeyList.push(publicKey);
        console.log(`${i + 1}. public key: ${publicKey.toString()}`);
        console.log(`${i + 1}. private key: ${privateKey.toString()}`);
    }
    const thresholdKey = new KeyList(publicKeyList, 3);

    // create multi-sig account
    const txAccountCreate = await new AccountCreateTransaction()
        .setKey(thresholdKey)
        .setInitialBalance(Hbar.fromTinybars(1))
        .setAccountMemo("3-of-4 multi-sig account")
        .execute(client);

    const txAccountCreateReceipt = await txAccountCreate.getReceipt(client);
    const multiSigAccountId = txAccountCreateReceipt.accountId;
    console.log(
        `3-of-4 multi-sig account ID:  ${multiSigAccountId.toString()}`
    );
    await queryBalance(multiSigAccountId, client);

    // schedule crypto transfer from multi-sig account to operator account
    const txSchedule = await (
        await new TransferTransaction()
            .addHbarTransfer(multiSigAccountId, Hbar.fromTinybars(-1))
            .addHbarTransfer(client.operatorAccountId, Hbar.fromTinybars(1))
            .schedule() // create schedule
            .freezeWith(client)
            .sign(privateKeyList[0])
    ) // add 1. signature
        .execute(client);

    const txScheduleReceipt = await txSchedule.getReceipt(client);
    console.log("Schedule status: " + txScheduleReceipt.status.toString());
    const scheduleId = txScheduleReceipt.scheduleId;
    console.log(`Schedule ID:  ${scheduleId.toString()}`);
    const scheduledTxId = txScheduleReceipt.scheduledTransactionId;
    console.log(`Scheduled tx ID:  ${scheduledTxId.toString()}`);

    // add 2. signature
    const txScheduleSign1 = await (
        await new ScheduleSignTransaction()
            .setScheduleId(scheduleId)
            .freezeWith(client)
            .sign(privateKeyList[1])
    ).execute(client);

    const txScheduleSign1Receipt = await txScheduleSign1.getReceipt(client);
    console.log(
        "1. ScheduleSignTransaction status: " +
            txScheduleSign1Receipt.status.toString()
    );
    await queryBalance(multiSigAccountId, client);

    // add 3. signature to trigger scheduled tx
    const txScheduleSign2 = await (
        await new ScheduleSignTransaction()
            .setScheduleId(scheduleId)
            .freezeWith(client)
            .sign(privateKeyList[2])
    ).execute(client);

    const txScheduleSign2Receipt = await txScheduleSign2.getReceipt(client);
    console.log(
        "2. ScheduleSignTransaction status: " +
            txScheduleSign2Receipt.status.toString()
    );
    await queryBalance(multiSigAccountId, client);

    // query schedule
    const scheduleInfo = await new ScheduleInfoQuery()
        .setScheduleId(scheduleId)
        .execute(client);
    console.log(scheduleInfo);

    // query triggered scheduled tx
    const recordScheduledTx = await new TransactionRecordQuery()
        .setTransactionId(scheduledTxId)
        .execute(client);
    console.log(recordScheduledTx);
}

/**
 * @param {AccountId} accountId
 * @param {Client} client
 * @returns {Promise<AccountBalance>}
 */
async function queryBalance(accountId, client) {
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);
    console.log(
        `Balance of account ${accountId.toString()}: ${accountBalance.hbars
            .toTinybars()
            .toInt()} tinybar`
    );
    return accountBalance;
}

void main();
