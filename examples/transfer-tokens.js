import {
    AccountBalanceQuery,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountId,
    Client,
    PrivateKey,
    Hbar,
    TokenAssociateTransaction,
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenGrantKycTransaction,
    TransferTransaction,
    TokenWipeTransaction,
    TransactionId,
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

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey.toString()}`);
    console.log(`public key = ${newKey.publicKey.toString()}`);

    let resp = await new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setInitialBalance(new Hbar(2))
        .execute(client);

    const transactionReceipt = await resp.getReceipt(client);
    const newAccountId = transactionReceipt.accountId;

    console.log(`account id = ${newAccountId.toString()}`);

    resp = await new TokenCreateTransaction()
        .setNodeAccountIds([resp.nodeId])
        .setTokenName("ffff")
        .setTokenSymbol("F")
        .setDecimals(3)
        .setInitialSupply(100)
        .setTreasuryAccountId(client.operatorAccountId)
        .setAdminKey(client.operatorPublicKey)
        .setFreezeKey(client.operatorPublicKey)
        .setWipeKey(client.operatorPublicKey)
        .setKycKey(client.operatorPublicKey)
        .setSupplyKey(client.operatorPublicKey)
        .setFreezeDefault(false)
        .execute(client);

    const tokenId = (await resp.getReceipt(client)).tokenId;
    console.log(`token id = ${tokenId.toString()}`);

    await (
        await (
            await new TokenAssociateTransaction()
                .setNodeAccountIds([resp.nodeId])
                .setAccountId(newAccountId)
                .setTokenIds([tokenId])
                .freezeWith(client)
                .sign(newKey)
        ).execute(client)
    ).getReceipt(client);

    console.log(
        `Associated account ${newAccountId.toString()} with token ${tokenId.toString()}`
    );

    await (
        await new TokenGrantKycTransaction()
            .setNodeAccountIds([resp.nodeId])
            .setAccountId(newAccountId)
            .setTokenId(tokenId)
            .execute(client)
    ).getReceipt(client);

    console.log(
        `Granted KYC for account ${newAccountId.toString()} on token ${tokenId.toString()}`
    );

    await (
        await new TransferTransaction()
            .setNodeAccountIds([resp.nodeId])
            .addTokenTransfer(tokenId, client.operatorAccountId, -10)
            .addTokenTransfer(tokenId, newAccountId, 10)
            .execute(client)
    ).getReceipt(client);

    console.log(
        `Sent 10 tokens from account ${client.operatorAccountId.toString()} to account ${newAccountId.toString()} on token ${tokenId.toString()}`
    );

    const balances = await new AccountBalanceQuery()
        .setAccountId(client.operatorAccountId)
        .execute(client);

    console.log(
        `Token balances for ${client.operatorAccountId.toString()} are ${balances.tokens
            .toString()
            .toString()}`
    );

    await (
        await new TokenWipeTransaction()
            .setNodeAccountIds([resp.nodeId])
            .setTokenId(tokenId)
            .setAccountId(newAccountId)
            .setAmount(10)
            .execute(client)
    ).getReceipt(client);

    console.log(`Wiped balance of account ${newAccountId.toString()}`);

    await (
        await new TokenDeleteTransaction()
            .setNodeAccountIds([resp.nodeId])
            .setTokenId(tokenId)
            .execute(client)
    ).getReceipt(client);

    console.log(`Deleted token ${tokenId.toString()}`);

    await (
        await (
            await new AccountDeleteTransaction()
                .setNodeAccountIds([resp.nodeId])
                .setAccountId(newAccountId)
                .setTransferAccountId(client.operatorAccountId)
                .setTransactionId(TransactionId.generate(newAccountId))
                .setMaxTransactionFee(new Hbar(1))
                .freezeWith(client)
                .sign(newKey)
        ).execute(client)
    ).getReceipt(client);

    console.log(`Deleted account ${newAccountId.toString()}`);
}

void main();
