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

        const operatorKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY!);

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
            .setTreasury(client._getOperatorAccountId()!)
            .setAdminKey(operatorKey.publicKey)
            .setFreezeKey(operatorKey.publicKey)
            .setWipeKey(operatorKey.publicKey)
            .setKycKey(operatorKey.publicKey)
            .setSupplyKey(operatorKey.publicKey)
            .setFreezeDefault(false)
            .setMaxTransactionFee(new Hbar(30))
            .execute(client);

        const tokenId = (await transactionId.getReceipt(client)).getTokenId();

        await (await new TokenAssociateTransaction()
            .setMaxTransactionFee(new Hbar(5))
            .setAccountId(newAccountId)
            .addTokenId(tokenId)
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
            .setTransferAccountId(client._getOperatorAccountId()!)
            .build(client)
            .sign(operatorKey)
            .sign(newKey)
            .execute(client))
            .getReceipt(client);
    }, 60000);
});
