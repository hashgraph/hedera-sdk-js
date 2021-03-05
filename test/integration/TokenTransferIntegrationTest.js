import {
    AccountCreateTransaction,
    TokenAssociateTransaction,
    TokenGrantKycTransaction,
    TokenCreateTransaction,
    TokenWipeTransaction,
    TransferTransaction,
    Hbar,
    Status,
    PrivateKey,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TokenTransfer", function () {
    it("should be executable", async function () {
        this.timeout(20000);

        const client = await newClient(true);
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setDecimals(3)
                    .setInitialSupply(1000000)
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(operatorKey)
                    .setKycKey(operatorKey)
                    .setFreezeKey(operatorKey)
                    .setWipeKey(operatorKey)
                    .setSupplyKey(operatorKey)
                    .setFreezeDefault(false)
                    .execute(client)
            ).getReceipt(client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);

        await (
            await (
                await new TokenGrantKycTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenId(token)
                    .setAccountId(account)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);

        await (
            await new TransferTransaction()
                .setNodeAccountIds([response.nodeId])
                .addTokenTransfer(token, account, 10)
                .addTokenTransfer(token, client.operatorAccountId, -10)
                .execute(client)
        ).getReceipt(client);

        await (
            await new TokenWipeTransaction()
                .setNodeAccountIds([response.nodeId])
                .setTokenId(token)
                .setAccountId(account)
                .setAmount(10)
                .execute(client)
        ).getReceipt(client);
    });

    it("should error when no amount is transferred", async function () {
        this.timeout(20000);

        const client = await newClient(true);
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setDecimals(3)
                    .setInitialSupply(10000000)
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(operatorKey)
                    .setKycKey(operatorKey)
                    .setFreezeKey(operatorKey)
                    .setWipeKey(operatorKey)
                    .setSupplyKey(operatorKey)
                    .setFreezeDefault(false)
                    .execute(client)
            ).getReceipt(client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);

        await (
            await (
                await new TokenGrantKycTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenId(token)
                    .setAccountId(account)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .addTokenTransfer(token, account, 0)
                    .addTokenTransfer(token, client.operatorAccountId, 0)
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountAmounts);
        }

        if (!err) {
            throw new Error("Token transfer did not error.");
        }
    });

    it("should error when no  is transferred", async function () {
        this.timeout(20000);

        const client = await newClient(true);
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setDecimals(3)
                    .setInitialSupply(0)
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(operatorKey)
                    .setKycKey(operatorKey)
                    .setFreezeKey(operatorKey)
                    .setWipeKey(operatorKey)
                    .setSupplyKey(operatorKey)
                    .setFreezeDefault(false)
                    .execute(client)
            ).getReceipt(client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);

        await (
            await (
                await new TokenGrantKycTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenId(token)
                    .setAccountId(account)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .addTokenTransfer(token, account, 10)
                    .addTokenTransfer(token, client.operatorAccountId, -10)
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InsufficientTokenBalance);
        }

        if (!err) {
            throw new Error("Token transfer did not error.");
        }
    });
});
