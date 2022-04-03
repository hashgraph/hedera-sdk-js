import {
    Client,
    PrivateKey,
    AccountBalanceQuery,
    AccountInfoQuery,
    AccountCreateTransaction,
    AccountAllowanceDeleteTransaction,
    AccountDeleteTransaction,
    TransactionId,
    AccountAllowanceAdjustTransaction,
    AccountAllowanceApproveTransaction,
    TransferTransaction,
    Hbar,
    AccountId,
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

    console.log("Generating accounts for example...");

    const aliceKey = PrivateKey.generateED25519();
    const bobKey = PrivateKey.generateED25519();
    const charlieKey = PrivateKey.generateED25519();

    const response = await new AccountCreateTransaction()
        .setKey(aliceKey)
        .setInitialBalance(new Hbar(5))
        .execute(client);

    const aliceId = (await response.getReceipt(client)).accountId;

    const bobId = (
        await (
            await new AccountCreateTransaction()
                .setNodeAccountIds([response.nodeId])
                .setKey(bobKey)
                .setInitialBalance(new Hbar(5))
                .execute(client)
        ).getReceipt(client)
    ).accountId;

    const charlieId = (
        await (
            await new AccountCreateTransaction()
                .setNodeAccountIds([response.nodeId])
                .setKey(charlieKey)
                .setInitialBalance(new Hbar(5))
                .execute(client)
        ).getReceipt(client)
    ).accountId;

    console.log(`Alice ID:  ${aliceId.toString()}`);
    console.log(`Bob ID:  ${bobId.toString()}`);
    console.log(`Charlie ID:  ${charlieId.toString()}`);

    await printBalances(client, response.nodeId, aliceId, bobId, charlieId);

    console.log(
        "Approving an allowance of 2 Hbar with owner Alice and spender Bob"
    );

    await (
        await (
            await new AccountAllowanceApproveTransaction()
                .setNodeAccountIds([response.nodeId])
                .approveHbarAllowance(aliceId, bobId, new Hbar(2))
                .freezeWith(client)
                .sign(aliceKey)
        ).execute(client)
    ).getReceipt(client);

    await printBalances(client, response.nodeId, aliceId, bobId, charlieId);

    console.log(
        "Transferring 1 new Hbar Alice to Charlie, but the transaction is signed _only_ by Bob (Bob is dipping into his allowance from Alice)"
    );

    await (
        await (
            await new TransferTransaction()
                .setNodeAccountIds([response.nodeId])
                // "addApproved*Transfer()" means that the transfer has been approved by an allowance
                .addApprovedHbarTransfer(aliceId, new Hbar(1).negated())
                .addHbarTransfer(charlieId, new Hbar(1))
                // The allowance spender must be pay the fee for the transaction.
                // use setTransactionId() to set the account ID that will pay the fee for the transaction.
                .setTransactionId(TransactionId.generate(bobId))
                .freezeWith(client)
                .sign(bobKey)
        ).execute(client)
    ).getReceipt(client);

    console.log(
        "Transfer succeeded.  Bob should now have 1 Hbar left in his allowance."
    );

    await printBalances(client, response.nodeId, aliceId, bobId, charlieId);

    try {
        console.log(
            "Attempting to transfer 2 new Hbar Alice to Charlie using Bob's allowance."
        );
        console.log(
            "This should fail, because there is only 1 Hbar left in Bob's allowance."
        );

        await (
            await (
                await new TransferTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .addApprovedHbarTransfer(aliceId, new Hbar(2).negated())
                    .addHbarTransfer(charlieId, new Hbar(2))
                    .setTransactionId(TransactionId.generate(bobId))
                    .freezeWith(client)
                    .sign(bobKey)
            ).execute(client)
        ).getReceipt(client);

        console.log("The transfer succeeded.  This should not happen.");
    } catch (error) {
        console.log("The transfer failed as expected.");
        console.log(error.toString());
    }

    console.log(
        "Adjusting Bob's allowance, increasing it by 2 Hbar.  After this, Bob's allowance should be 3 Hbar."
    );

    await (
        await (
            await new AccountAllowanceAdjustTransaction()
                .setNodeAccountIds([response.nodeId])
                .grantHbarAllowance(aliceId, bobId, new Hbar(2))
                .freezeWith(client)
                .sign(aliceKey)
        ).execute(client)
    ).getReceipt(client);

    await printBalances(client, response.nodeId, aliceId, bobId, charlieId);

    console.log(
        "Attempting to transfer 2 new Hbar Alice to Charlie using Bob's allowance again."
    );
    console.log("This time it should succeed.");

    await (
        await (
            await new TransferTransaction()
                .setNodeAccountIds([response.nodeId])
                .addApprovedHbarTransfer(aliceId, new Hbar(2).negated())
                .addHbarTransfer(charlieId, new Hbar(2))
                .setTransactionId(TransactionId.generate(bobId))
                .freezeWith(client)
                .sign(bobKey)
        ).execute(client)
    ).getReceipt(client);

    console.log("Transfer succeeded.");

    await printBalances(client, response.nodeId, aliceId, bobId, charlieId);

    console.log("Deleting all Hbar allowances owned by Alice");

    await (
        await (
            await new AccountAllowanceDeleteTransaction()
                .setNodeAccountIds([response.nodeId])
                .deleteAllHbarAllowances(aliceId)
                .freezeWith(client)
                .sign(aliceKey)
        ).execute(client)
    ).getReceipt(client);

    await printBalances(client, response.nodeId, aliceId, bobId, charlieId);

    console.log("Cleaning up...");

    await (
        await (
            await new AccountDeleteTransaction()
                .setNodeAccountIds([response.nodeId])
                .setAccountId(aliceId)
                .setTransferAccountId(client.operatorAccountId)
                .freezeWith(client)
                .sign(aliceKey)
        ).execute(client)
    ).getReceipt(client);

    await (
        await (
            await new AccountDeleteTransaction()
                .setNodeAccountIds([response.nodeId])
                .setAccountId(bobId)
                .setTransferAccountId(client.operatorAccountId)
                .freezeWith(client)
                .sign(bobKey)
        ).execute(client)
    ).getReceipt(client);

    await (
        await (
            await new AccountDeleteTransaction()
                .setNodeAccountIds([response.nodeId])
                .setAccountId(charlieId)
                .setTransferAccountId(client.operatorAccountId)
                .freezeWith(client)
                .sign(charlieKey)
        ).execute(client)
    ).getReceipt(client);

    client.close();
}

/**
 * @param {Client} client
 * @param {AccountId} nodeAccountId
 * @param {AccountId} aliceId
 * @param {AccountId} bobId
 * @param {AccountId} charlieId
 */
async function printBalances(client, nodeAccountId, aliceId, bobId, charlieId) {
    console.log(
        `Alice's balance: ${(
            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(aliceId)
                .execute(client)
        ).hbars.toString()}`
    );
    console.log(
        `Bob's balance: ${(
            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(bobId)
                .execute(client)
        ).hbars.toString()}`
    );
    console.log(
        `Charlie's balance: ${(
            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(charlieId)
                .execute(client)
        ).hbars.toString()}`
    );
    console.log(
        `Hbar allowances where Alice is the owner: ${JSON.stringify(
            (
                await new AccountInfoQuery()
                    .setNodeAccountIds([nodeAccountId])
                    .setAccountId(aliceId)
                    .execute(client)
            ).hbarAllowances.map((allowance) => allowance.toJSON())
        )}`
    );
}

void main();
