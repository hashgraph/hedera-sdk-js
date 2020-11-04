const {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountId,
    Client,
    Ed25519PrivateKey,
    Hbar,
    TokenAssociateTransaction,
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenGrantKycTransaction,
    TransferTransaction,
    TokenWipeTransaction
} = require("@hashgraph/sdk");

async function main() {
    if (
        process.env.OPERATOR_KEY == null ||
        process.env.OPERATOR_ID == null
    ) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

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
        } catch (error) {
            client = Client.forTestnet();
        }
    }

    let operatorPrivateKey;
    let operatorAccount;

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        operatorAccount = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorAccount, operatorPrivateKey);
    }

    const newKey = await Ed25519PrivateKey.generate();

    console.log("private =", newKey);
    console.log("public =", newKey.publicKey);

    let transactionId = await new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setMaxTransactionFee(new Hbar(1))
        .setInitialBalance(0)
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    const newAccountId = transactionReceipt.getAccountId();

    console.log("accountId =", newAccountId);

    transactionId = await new TokenCreateTransaction()
        .setName("ffff")
        .setSymbol("F")
        .setDecimals(3)
        .setInitialSupply(1000000)
        .setTreasury(operatorAccount)
        .setAdminKey(operatorPrivateKey.publicKey)
        .setFreezeKey(operatorPrivateKey.publicKey)
        .setWipeKey(operatorPrivateKey.publicKey)
        .setKycKey(operatorPrivateKey.publicKey)
        .setSupplyKey(operatorPrivateKey.publicKey)
        .setFreezeDefault(false)
        .execute(client);

    const tokenId = (await transactionId.getReceipt(client)).getTokenId();
    console.log("tokenId =", tokenId.toString());

    await (await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .addTokenId(tokenId)
        .build(client)
        .sign(operatorPrivateKey)
        .sign(newKey)
        .execute(client))
        .getReceipt(client);

    console.log("Associated account", newAccountId.toString(), "with token", tokenId.toString());

    await (await new TokenGrantKycTransaction()
        .setAccountId(newAccountId)
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    console.log("Granted Kyc for account", newAccountId.toString(), "on token", tokenId.toString());

    await (await new TransferTransaction()
        .addTokenSender(tokenId, operatorAccount, 10)
        .addTokenRecipient(tokenId, newAccountId, 10)
        .execute(client))
        .getReceipt(client);

    console.log(
        "Sent 10 tokens from account",
        operatorAccount.toString(),
        "to account",
        newAccountId.toString(),
        "on token",
        tokenId.toString()
    );

    await (await new TokenWipeTransaction()
        .setAccountId(newAccountId)
        .setTokenId(tokenId)
        .setAmount(10)
        .execute(client))
        .getReceipt(client);

    console.log("Wiped balance of account", newAccountId.toString());

    await (await new TokenDeleteTransaction()
        .setTokenId(tokenId)
        .execute(client))
        .getReceipt(client);

    console.log("Deleted token", tokenId.toString());

    await (await new AccountDeleteTransaction()
        .setDeleteAccountId(newAccountId)
        .setTransferAccountId(operatorAccount)
        .build(client)
        .sign(operatorPrivateKey)
        .sign(newKey)
        .execute(client))
        .getReceipt(client);

    console.log("Deleted account", newAccountId.toString());
}

main();

