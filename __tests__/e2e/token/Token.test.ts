import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
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
    TransferTransaction,
    TokenUnfreezeTransaction,
    TokenUpdateTransaction,
    TokenWipeTransaction,
} from "../../../src/index-node";
import { getClientForIntegrationTest } from "../client-setup";

describe("TokenIntegrationTest", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest();

        const newKey = await Ed25519PrivateKey.generate();

        let transactionId = await new AccountCreateTransaction()
            .setKey(newKey.publicKey)
            .setMaxTransactionFee(new Hbar(1))
            .setInitialBalance(100)
            .execute(client);

        let transactionReceipt = await transactionId.getReceipt(client);
        const newAccountId1 = transactionReceipt.getAccountId();

        transactionId = await new AccountCreateTransaction()
            .setKey(newKey.publicKey)
            .setMaxTransactionFee(new Hbar(1))
            .setInitialBalance(1)
            .execute(client);

        transactionReceipt = await transactionId.getReceipt(client);
        const newAccountId2 = transactionReceipt.getAccountId();

        transactionId = await new TokenCreateTransaction()
            .setName("ffff")
            .setSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasury(newAccountId1)
            .setAdminKey(newKey.publicKey)
            .setFreezeKey(newKey.publicKey)
            .setWipeKey(newKey.publicKey)
            .setKycKey(newKey.publicKey)
            .setSupplyKey(newKey.publicKey)
            .setFreezeDefault(false)
            .setMaxTransactionFee(new Hbar(30))
            .build(client)
            .sign(newKey)
            .execute(client);

        const tokenId = (await transactionId.getReceipt(client)).getTokenId();


        await (await new TokenAssociateTransaction()
            .setMaxTransactionFee(new Hbar(5))
            .setAccountId(newAccountId2)
            .addTokenId(tokenId)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenMintTransaction()
            .setTokenId(tokenId)
            .setAmount(10)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenBurnTransaction()
            .setTokenId(tokenId)
            .setAmount(10)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenGrantKycTransaction()
            .setAccountId(newAccountId2)
            .setTokenId(tokenId)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TransferTransaction()
            .addTokenTransfer(tokenId, newAccountId1, -10)
            .addTokenTransfer(tokenId, newAccountId2, 10)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenRevokeKycTransaction()
            .setAccountId(newAccountId2)
            .setTokenId(tokenId)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenFreezeTransaction()
            .setTokenId(tokenId)
            .setAccountId(newAccountId2)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenUnfreezeTransaction()
            .setTokenId(tokenId)
            .setAccountId(newAccountId2)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenWipeTransaction()
            .setMaxTransactionFee(new Hbar(5))
            .setTokenId(tokenId)
            .setAccountId(newAccountId2)
            .setAmount(10)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenDissociateTransaction()
            .setMaxTransactionFee(new Hbar(5))
            .setAccountId(newAccountId2)
            .addTokenId(tokenId)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await (await new TokenUpdateTransaction()
            .setTokenId(tokenId)
            .setSymbol("A")
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);
    }, 60000);
});
