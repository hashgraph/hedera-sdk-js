require("dotenv").config();

const {
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
    TokenTransferTransaction,
    TokenWipeTransaction,
    TransactionId
} = require("@hashgraph/sdk");

async function main() {
    if (
        process.env.OPERATOR_KEY == null ||
        process.env.OPERATOR_ID == null ||
        process.env.CONFIG_FILE == null
    ) {
        throw new Error("environment variables OPERATOR_KEY, OPERATOR_ID, CONFIG_FILE must be present");
    }

    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const configFile = process.env.CONFIG_FILE;

    const client = await Client.fromConfigFile(configFile);
    client.setOperator(operatorId, operatorKey);

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey}`);
    console.log(`public key = ${newKey.publicKey}`);

    let resp = await new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setMaxTransactionFee(new Hbar(1))
        .setInitialBalance(new Hbar(1))
        .execute(client);

    const transactionReceipt = await resp.getReceipt(client);
    const newAccountId = transactionReceipt.accountId;

    console.log(`account id = ${newAccountId}`);

    resp = await new TokenCreateTransaction()
        .setNodeAccountId(resp.nodeId)
        .setName("ffff")
        .setSymbol("F")
        .setDecimals(3)
        .setInitialSupply(1000000)
        .setTreasury(operatorId)
        .setAdminKey(operatorKey.publicKey)
        .setFreezeKey(operatorKey.publicKey)
        .setWipeKey(operatorKey.publicKey)
        .setKycKey(operatorKey.publicKey)
        .setSupplyKey(operatorKey.publicKey)
        .setFreezeDefault(false)
        .setExpirationTime(Date.now() + 7890000)
        .execute(client);

    const tokenId = (await resp.getReceipt(client)).tokenId;
    console.log(`token id = ${tokenId}`);

    await ( await (await (await new TokenAssociateTransaction()
        .setNodeAccountId(resp.nodeId)
        .setAccountId(newAccountId)
        .setTokenIds(tokenId)
        .freezeWith(client)
        .sign(operatorKey))
        .sign(newKey))
        .execute(client))
        .getReceipt(client);

    console.log(`Associated account ${newAccountId} with token ${tokenId}`);

    await (await new TokenGrantKycTransaction()
        .setNodeAccountId(resp.nodeId)
        .setAccountId(newAccountId)
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    console.log(`Granted KYC for account ${newAccountId} on token ${tokenId}`);

    await (await new TokenTransferTransaction()
        .setNodeAccountId(resp.nodeId)
        .addSender(tokenId, operatorId, 10)
        .addRecipient(tokenId, newAccountId, 10)
        .execute(client))
        .getReceipt(client);

    console.log(`Sent 10 tokens from account ${operatorId} to account ${newAccountId} on token ${tokenId}`);

    await (await new TokenWipeTransaction()
        .setNodeAccountId(resp.nodeId)
        .setTokenId(tokenId)
        .setAccountId(newAccountId)
        .setAmount(10)
        .execute(client))
        .getReceipt(client);

    console.log(`Wiped balance of account ${newAccountId}`);

    await (await new TokenDeleteTransaction()
        .setNodeAccountId(resp.nodeId)
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    console.log(`Deleted token ${tokenId}`);

    await (
        await (
            await new AccountDeleteTransaction()
                .setNodeAccountId(resp.nodeId)
                .setAccountId(newAccountId)
                .setMaxTransactionFee(new Hbar(1))
                .setTransferAccountId(operatorId)
                .setTransactionId(TransactionId.generate(newAccountId))
                .freezeWith(client)
                .sign(newKey)
        ).execute(client)
    ).getReceipt(client);

    console.log(`Deleted account ${newAccountId}`);
}

main();


