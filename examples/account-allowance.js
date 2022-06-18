import {
    Wallet,
    LocalProvider,
    PrivateKey,
    AccountBalanceQuery,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TransactionId,
    AccountAllowanceApproveTransaction,
    TransferTransaction,
    Hbar,
} from "@hashgraph/sdk";

/**
 * @typedef {import("@hashgraph/sdk").AccountId} AccountId
 */

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

    console.log("Generating accounts for example...");

    const aliceKey = PrivateKey.generateED25519();
    const bobKey = PrivateKey.generateED25519();
    const charlieKey = PrivateKey.generateED25519();

    const response = await new AccountCreateTransaction()
        .setKey(aliceKey)
        .setInitialBalance(new Hbar(5))
        .executeWithSigner(wallet);

    const aliceId = (await response.getReceiptWithSigner(wallet)).accountId;

    const bobId = (
        await (
            await new AccountCreateTransaction()
                .setNodeAccountIds([response.nodeId])
                .setKey(bobKey)
                .setInitialBalance(new Hbar(5))
                .executeWithSigner(wallet)
        ).getReceiptWithSigner(wallet)
    ).accountId;

    const charlieId = (
        await (
            await new AccountCreateTransaction()
                .setNodeAccountIds([response.nodeId])
                .setKey(charlieKey)
                .setInitialBalance(new Hbar(5))
                .executeWithSigner(wallet)
        ).getReceiptWithSigner(wallet)
    ).accountId;

    console.log(`Alice ID:  ${aliceId.toString()}`);
    console.log(`Bob ID:  ${bobId.toString()}`);
    console.log(`Charlie ID:  ${charlieId.toString()}`);

    await printBalances(wallet, response.nodeId, aliceId, bobId, charlieId);

    console.log(
        "Approving an allowance of 2 Hbar with owner Alice and spender Bob"
    );

    await (
        await (
            await (
                await new AccountAllowanceApproveTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .approveHbarAllowance(aliceId, bobId, new Hbar(2))
                    .freezeWithSigner(wallet)
            ).sign(aliceKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    await printBalances(wallet, response.nodeId, aliceId, bobId, charlieId);

    console.log(
        "Transferring 1 Hbar from Alice to Charlie, but the transaction is signed _only_ by Bob (Bob is dipping into his allowance from Alice)"
    );

    await (
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
                    .freezeWithSigner(wallet)
            ).sign(bobKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    console.log(
        "Transfer succeeded.  Bob should now have 1 Hbar left in his allowance."
    );

    await printBalances(wallet, response.nodeId, aliceId, bobId, charlieId);

    try {
        console.log(
            "Attempting to transfer 2 Hbar from Alice to Charlie using Bob's allowance."
        );
        console.log(
            "This should fail, because there is only 1 Hbar left in Bob's allowance."
        );

        await (
            await (
                await (
                    await new TransferTransaction()
                        .setNodeAccountIds([response.nodeId])
                        .addApprovedHbarTransfer(aliceId, new Hbar(2).negated())
                        .addHbarTransfer(charlieId, new Hbar(2))
                        .setTransactionId(TransactionId.generate(bobId))
                        .freezeWithSigner(wallet)
                ).sign(bobKey)
            ).executeWithSigner(wallet)
        ).getReceiptWithSigner(wallet);

        console.log("The transfer succeeded.  This should not happen.");
    } catch (error) {
        console.log("The transfer failed as expected.");
        console.log(/** @type {Error} */ (error).message);
    }

    console.log("Adjusting Bob's allowance to 3 Hbar.");

    await (
        await (
            await (
                await new AccountAllowanceApproveTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .approveHbarAllowance(aliceId, bobId, new Hbar(3))
                    .freezeWithSigner(wallet)
            ).sign(aliceKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    console.log(
        "Attempting to transfer 2 Hbar from Alice to Charlie using Bob's allowance again."
    );
    console.log("This time it should succeed.");

    await (
        await (
            await (
                await new TransferTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .addApprovedHbarTransfer(aliceId, new Hbar(2).negated())
                    .addHbarTransfer(charlieId, new Hbar(2))
                    .setTransactionId(TransactionId.generate(bobId))
                    .freezeWithSigner(wallet)
            ).sign(bobKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    console.log("Transfer succeeded.");

    await printBalances(wallet, response.nodeId, aliceId, bobId, charlieId);

    console.log("Deleting Bob's allowance");

    await (
        await (
            await (
                await new AccountAllowanceApproveTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .approveHbarAllowance(aliceId, bobId, Hbar.fromTinybars(0))
                    .freezeWithSigner(wallet)
            ).sign(aliceKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    console.log("Cleaning up...");

    await (
        await (
            await (
                await new AccountDeleteTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setAccountId(aliceId)
                    .setTransferAccountId(wallet.getAccountId())
                    .freezeWithSigner(wallet)
            ).sign(aliceKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    await (
        await (
            await (
                await new AccountDeleteTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setAccountId(bobId)
                    .setTransferAccountId(wallet.getAccountId())
                    .freezeWithSigner(wallet)
            ).sign(bobKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    await (
        await (
            await (
                await new AccountDeleteTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setAccountId(charlieId)
                    .setTransferAccountId(wallet.getAccountId())
                    .freezeWithSigner(wallet)
            ).sign(charlieKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);
}

/**
 * @param {Wallet} wallet
 * @param {AccountId} nodeAccountId
 * @param {AccountId} aliceId
 * @param {AccountId} bobId
 * @param {AccountId} charlieId
 */
async function printBalances(wallet, nodeAccountId, aliceId, bobId, charlieId) {
    console.log(
        `Alice's balance: ${(
            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(aliceId)
                .executeWithSigner(wallet)
        ).hbars.toString()}`
    );
    console.log(
        `Bob's balance: ${(
            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(bobId)
                .executeWithSigner(wallet)
        ).hbars.toString()}`
    );
    console.log(
        `Charlie's balance: ${(
            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(charlieId)
                .executeWithSigner(wallet)
        ).hbars.toString()}`
    );
}

void main();
// .catch((err) => {
//     console.log(err.valueOf());
//     process.exit(1);
// });
