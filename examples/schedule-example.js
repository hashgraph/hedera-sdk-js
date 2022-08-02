import {
    AccountCreateTransaction,
    TransferTransaction,
    ScheduleInfoQuery,
    ScheduleSignTransaction,
    Timestamp,
    KeyList,
    Wallet,
    LocalProvider,
    PrivateKey,
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

    const key1 = PrivateKey.generate();
    const key2 = PrivateKey.generate();

    console.log(`private key 1 = ${key1.toString()}`);
    console.log(`public key 1 = ${key1.publicKey.toString()}`);
    console.log(`private key 2 = ${key2.toString()}`);
    console.log(`public key 2 = ${key2.publicKey.toString()}`);

    let transaction = await new AccountCreateTransaction()
        .setKey(KeyList.of(key1.publicKey, key2.publicKey))
        .setInitialBalance(20)
        .setStakedAccountId("0.0.3")
        .freezeWithSigner(wallet);
    transaction = await transaction.signWithSigner(wallet);
    const resp = await transaction.executeWithSigner(wallet);

    const transactionReceipt = await resp.getReceiptWithSigner(wallet);

    // The new account ID
    const newAccountId = transactionReceipt.accountId;

    console.log(`account id = ${newAccountId.toString()}`);

    transaction = await new TransferTransaction()
        .addHbarTransfer(newAccountId, -1)
        .addHbarTransfer(wallet.getAccountId(), 1)
        .schedule()
        // Set expiration time to be now + 24 hours
        .setExpirationTime(
            Timestamp.generate().plusNanos(24 * 60 * 60 * 1000000000)
        )
        // Set wait for expiry to true
        .setWaitForExpiry(true)
        .freezeWithSigner(wallet);
    transaction = await transaction.signWithSigner(wallet);
    const response = await transaction.executeWithSigner(wallet);

    console.log(
        `scheduled transaction ID = ${response.transactionId.toString()}`
    );

    const scheduleId = (await response.getReceiptWithSigner(wallet)).scheduleId;
    console.log(`schedule ID = ${scheduleId.toString()}`);

    const record = await response.getRecordWithSigner(wallet);
    console.log(`record = ${JSON.stringify(record)}`);

    await (
        await (
            await (
                await (
                    await new ScheduleSignTransaction()
                        .setScheduleId(scheduleId)
                        .freezeWithSigner(wallet)
                ).sign(key1)
            ).signWithSigner(wallet)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    const info = await new ScheduleInfoQuery()
        .setScheduleId(scheduleId)
        .executeWithSigner(wallet);

    console.log(`schedule info = ${JSON.stringify(info)}`);

    await (
        await (
            await (
                await (
                    await new ScheduleSignTransaction()
                        .setScheduleId(scheduleId)
                        .freezeWithSigner(wallet)
                ).sign(key2)
            ).signWithSigner(wallet)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    const transactionId = response.transactionId;
    const validMirrorTransactionId = `${transactionId.accountId.toString()}-${transactionId.validStart.seconds.toString()}-${transactionId.validStart.nanos.toString()}`;

    console.log(
        "The following link should query the mirror node for the scheduled transaction"
    );

    const link = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/transactions/${validMirrorTransactionId}`;

    console.log(link);

    // Seem to be getting 404 at the moment even though the request does go through :/
    // const mirrorNodeResponse = await axios.get(link);
    // console.log(mirrorNodeResponse);
}

void main();
