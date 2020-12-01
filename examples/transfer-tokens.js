require("dotenv").config();

const {
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
    TransactionId
} = require("@hashgraph/sdk");

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
            client = Client.fromConfigFile(process.env.CONFIG_FILE);
        } catch (err) {
            client = Client.forTestnet();
        }
    }

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorId = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorId, operatorKey);
    }

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey}`);
    console.log(`public key = ${newKey.publicKey}`);

    let resp = await new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setInitialBalance(new Hbar(2))
        .execute(client);

    const transactionReceipt = await resp.getReceipt(client);
    const newAccountId = transactionReceipt.accountId;

    console.log(`account id = ${newAccountId}`);

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
    console.log(`token id = ${tokenId}`);

    await (await (await new TokenAssociateTransaction()
        .setNodeAccountIds([resp.nodeId])
        .setAccountId(newAccountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(newKey))
        .execute(client))
        .getReceipt(client);

    console.log(`Associated account ${newAccountId} with token ${tokenId}`);

    await (await new TokenGrantKycTransaction()
        .setNodeAccountIds([resp.nodeId])
        .setAccountId(newAccountId)
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    console.log(`Granted KYC for account ${newAccountId} on token ${tokenId}`);

    await (await new TransferTransaction()
        .setNodeAccountIds([resp.nodeId])
        .addTokenTransfer(tokenId, client.operatorAccountId, -10)
        .addTokenTransfer(tokenId, newAccountId, 10)
        .execute(client))
        .getReceipt(client);

    console.log(`Sent 10 tokens from account ${client.operatorAccountId} to account ${newAccountId} on token ${tokenId}`);

    const balances = await new AccountBalanceQuery()
        .setAccountId(client.operatorAccountId)
        .execute(client);

    console.log(`Token balances for ${client.operatorAccountId} are ${balances.tokens.toString()}`);

    await (await new TokenWipeTransaction()
        .setNodeAccountIds([resp.nodeId])
        .setTokenId(tokenId)
        .setAccountId(newAccountId)
        .setAmount(10)
        .execute(client))
        .getReceipt(client);

    console.log(`Wiped balance of account ${newAccountId}`);

    await (await new TokenDeleteTransaction()
        .setNodeAccountIds([resp.nodeId])
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    console.log(`Deleted token ${tokenId}`);

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

    console.log(`Deleted account ${newAccountId}`);
}

main();


