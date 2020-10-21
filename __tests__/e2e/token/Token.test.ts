import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountId,
    Client,
    Ed25519PrivateKey,
    Hbar,
    TokenAssociateTransaction,
    TokenBurnTransaction,
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenDissociateTransaction,
    TokenFreezeTransaction,
    TokenGrantKycTransaction,
    TokenMintTransaction,
    TokenRevokeKycTransaction,
    TokenTransferTransaction,
    TokenUnfreezeTransaction,
    TokenUpdateTransaction,
    TokenWipeTransaction,
} from "../../../src/index-node";

describe("TokenIntegrationTest", () => {
    it("can be executed", async() => {
    if (
        process.env.OPERATOR_KEY == null ||
        process.env.OPERATOR_ID == null ||
        process.env.CONFIG_FILE == null
    ) {
        throw new Error("environment variables OPERATOR_KEY, OPERATOR_ID, CONFIG_FILE must be present");
    }

    const operatorKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const configFile = process.env.CONFIG_FILE;

    const client = await Client.fromFile(configFile);
    client.setOperator(operatorId, operatorKey);

    const newKey = await Ed25519PrivateKey.generate();

    let transactionId = await new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setMaxTransactionFee(new Hbar(1))
        .setInitialBalance(0)
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    const newAccountId = transactionReceipt.getAccountId();

    transactionId = await new TokenCreateTransaction()
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
        .execute(client);

    const tokenId = (await transactionId.getReceipt(client)).getTokenId();

    await (await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds(tokenId)
        .build(client)
        .sign(operatorKey)
        .sign(newKey)
        .execute(client))
        .getReceipt(client);

    await (await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(10)
        .execute(client))
        .getReceipt(client);

    await (await new TokenBurnTransaction()
        .setTokenId(tokenId)
        .setAmount(10)
        .execute(client))
        .getReceipt(client);

    await (await new TokenGrantKycTransaction()
        .setAccountId(newAccountId)
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    await (await new TokenTransferTransaction()
        .addSender(tokenId, operatorId, 10)
        .addRecipient(tokenId, newAccountId, 10)
        .execute(client))
        .getReceipt(client);

    await (await new TokenRevokeKycTransaction()
        .setAccountId(newAccountId)
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    await (await new TokenFreezeTransaction()
        .setTokenId(tokenId)
        .setAccountId(newAccountId)
        .execute(client))
        .getReceipt(client);

    await (await new TokenUnfreezeTransaction()
        .setTokenId(tokenId)
        .setAccountId(newAccountId)
        .execute(client))
        .getReceipt(client);

    await (await new TokenWipeTransaction()
        .setTokenId(tokenId)
        .setAccountId(newAccountId)
        .setAmount(10)
        .execute(client))
        .getReceipt(client);

    await (await new TokenDissociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds(tokenId)
        .build(client)
        .sign(operatorKey)
        .sign(newKey)
        .execute(client))
        .getReceipt(client);

    await (await new TokenUpdateTransaction()
        .setTokenId(tokenId)
        .setSymbol("A")
        .execute(client))
        .getReceipt(client);

    await (await new TokenDeleteTransaction()
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    await (await new AccountDeleteTransaction()
        .setDeleteAccountId(newAccountId)
        .setTransferAccountId(operatorId)
        .build(client)
        .sign(operatorKey)
        .sign(newKey)
        .execute(client))
        .getReceipt(client);
    }, 60000);
});
