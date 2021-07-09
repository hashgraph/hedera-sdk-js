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
    TokenNftInfoQuery,
    NftId,
    TokenType,
} from "../../../src/index-node";
import { getClientForIntegrationTest } from "../client-setup";

describe("TokenIntegrationTest", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest(true);

        const newKey = await Ed25519PrivateKey.generate();

        const operatorKey = client._getOperatorKey()!;

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
            .setTreasury(client._getOperatorAccountId()!)
            .setAdminKey(operatorKey)
            .setFreezeKey(operatorKey)
            .setWipeKey(operatorKey)
            .setKycKey(operatorKey)
            .setSupplyKey(operatorKey)
            .setFreezeDefault(false)
            .setMaxTransactionFee(new Hbar(30))
            .execute(client);

        const tokenId = (await transactionId.getReceipt(client)).getTokenId();

        await (await new TokenAssociateTransaction()
            .setMaxTransactionFee(new Hbar(5))
            .setAccountId(newAccountId)
            .addTokenId(tokenId)
            .build(client)
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

        await (await new TransferTransaction()
            .addTokenTransfer(tokenId, client._getOperatorAccountId()!, -10)
            .addTokenTransfer(tokenId, newAccountId, 10)
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
            .setMaxTransactionFee(new Hbar(5))
            .setTokenId(tokenId)
            .setAccountId(newAccountId)
            .setAmount(10)
            .execute(client))
            .getReceipt(client);

        await (await new TokenDissociateTransaction()
            .setMaxTransactionFee(new Hbar(5))
            .setAccountId(newAccountId)
            .addTokenId(tokenId)
            .build(client)
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
            .setTransferAccountId(client._getOperatorAccountId()!)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);
    }, 60000);

    it("can be executed for nfts", async() => {
        const client = await getClientForIntegrationTest(true);

        await new Promise((r) => setTimeout(r, 5000));

        const newKey = await Ed25519PrivateKey.generate();

        const operatorKey = client._getOperatorKey()!;

        let transactionId = await new AccountCreateTransaction()
            .setKey(newKey.publicKey)
            .setMaxTransactionFee(new Hbar(1))
            .setInitialBalance(0)
            .execute(client);

        const transactionReceipt = await transactionId.getReceipt(client);
        const newAccountId = transactionReceipt.getAccountId();

        await new Promise((r) => setTimeout(r, 5000));

        transactionId = await new TokenCreateTransaction()
            .setName("ffff")
            .setSymbol("F")
            .setTokenType(TokenType.NonFungibleUnique)
            .setTreasury(client._getOperatorAccountId()!)
            .setAdminKey(operatorKey)
            .setFreezeKey(operatorKey)
            .setWipeKey(operatorKey)
            .setKycKey(operatorKey)
            .setSupplyKey(operatorKey)
            .setFreezeDefault(false)
            .setMaxTransactionFee(new Hbar(30))
            .execute(client);

        const tokenId = (await transactionId.getReceipt(client)).getTokenId();

        await new Promise((r) => setTimeout(r, 5000));

        await (await new TokenAssociateTransaction()
            .setMaxTransactionFee(new Hbar(5))
            .setAccountId(newAccountId)
            .addTokenId(tokenId)
            .build(client)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);

        await new Promise((r) => setTimeout(r, 5000));

        await (await new TokenGrantKycTransaction()
            .setAccountId(newAccountId)
            .setTokenId(tokenId)
            .execute(client))
            .getReceipt(client);

        await new Promise((r) => setTimeout(r, 5000));

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(tokenId)
                    .addMetadata(new Uint8Array([1]))
                    .addMetadata(new Uint8Array([2]))
                    .execute(client)
            ).getReceipt(client)
        ).getSerials();

        const serial = serials[0];

        let info = await new TokenNftInfoQuery()
            .setNftId(new NftId(tokenId, serial))
            .execute(client);

        expect(info[0].accountId!.toString()).toBe(client._getOperatorAccountId()!.toString());

        await new Promise((r) => setTimeout(r, 5000));

        await (await new TransferTransaction()
            .addTokenTransfer(tokenId, client._getOperatorAccountId()!, -10)
            .addTokenTransfer(tokenId, newAccountId, 10)
            .execute(client))
            .getReceipt(client);

        info = await new TokenNftInfoQuery()
            .setNftId(new NftId(tokenId, serial))
            .execute(client);

        expect(info[0].accountId!.toString()).toBe(newAccountId.toString());

        await new Promise((r) => setTimeout(r, 5000));

        await (await new TokenWipeTransaction()
            .setMaxTransactionFee(new Hbar(5))
            .setTokenId(tokenId)
            .setAccountId(newAccountId)
            .setSerials([serial])
            .execute(client))
            .getReceipt(client);

        await new Promise((r) => setTimeout(r, 5000));

        await (await new TokenBurnTransaction()
            .setTokenId(tokenId)
            .setSerials([serials[1]])
            .execute(client))
            .getReceipt(client);
    }, 120000);
});
