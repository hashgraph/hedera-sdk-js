import {
    AccountCreateTransaction,
    TransferTransaction,
    ScheduleInfoQuery,
    ScheduleSignTransaction,
    Timestamp,
    KeyList,
    AccountId,
    Client,
    PrivateKey,
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
    
    const key1 = PrivateKey.generate();
    const key2 = PrivateKey.generate();
    
    console.log(`private key 1 = ${key1.toString()}`);
    console.log(`public key 1 = ${key1.publicKey.toString()}`);
    console.log(`private key 2 = ${key2.toString()}`);
    console.log(`public key 2 = ${key2.publicKey.toString()}`);
    
    const resp = await new AccountCreateTransaction()
        .setKey(KeyList.of(key1.publicKey, key2.publicKey))
        .setInitialBalance(20)
        .setStakedAccountId("0.0.3")
        .execute(client);
    
    const transactionReceipt = await resp.getReceipt(client);
    
    // The new account ID
    const newAccountId = transactionReceipt.accountId;
    
    console.log(`account id = ${newAccountId.toString()}`);
    
    const response = await new TransferTransaction()
        .addHbarTransfer(newAccountId, -1)
        .addHbarTransfer(client.operatorAccountId, 1)
        .schedule()
        // Set expiration time to be now + 24 hours
        .setExpirationTime(Timestamp.generate().plusNanos(24 * 60 * 60 * 1000000000))
        // Set wait for expiry to true
        .setWaitForExpiry(true)
        .execute(client);
    
    console.log(
        `scheduled transaction ID = ${response.transactionId.toString()}`
    );
    
    const scheduleId = (await response.getReceipt(client)).scheduleId;
    console.log(`schedule ID = ${scheduleId.toString()}`);
    
    const record = await response.getRecord(client);
    console.log(`record = ${JSON.stringify(record)}`);
    
    await (
        await (
            await new ScheduleSignTransaction()
                .setScheduleId(scheduleId)
                .freezeWith(client)
                .sign(key1)
        ).execute(client)
    ).getReceipt(client);
    
    const info = await new ScheduleInfoQuery()
        .setScheduleId(scheduleId)
        .execute(client);
    
    console.log(`schedule info = ${JSON.stringify(info)}`);
    
    await (
        await (
            await new ScheduleSignTransaction()
                .setScheduleId(scheduleId)
                .freezeWith(client)
                .sign(key2)
        ).execute(client)
    ).getReceipt(client);
    
    const transactionId = response.transactionId;
    const validMirrorTransactionId = `${transactionId.accountId.toString()}-${transactionId.validStart.seconds.toString()}-${transactionId.validStart.nanos.toString()}`;
    
    console.log(
        "The following link should query the mirror node for the scheduled transaction"
    );

    const link = 
        `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/transactions/${validMirrorTransactionId}`;

    console.log(link);

    // Seem to be getting 404 at the moment even though the request does go through :/
    // const mirrorNodeResponse = await axios.get(link);
    // console.log(mirrorNodeResponse);
}

void main();
