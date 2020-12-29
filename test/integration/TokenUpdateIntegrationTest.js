import {
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenUpdateTransaction,
    TokenInfoQuery,
    Hbar,
    Status,
    PrivateKey,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TokenUpdate", function () {
    it("should be executable", async function () {
        this.timeout(20000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();
        const key3 = PrivateKey.generate();
        const key4 = PrivateKey.generate();

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(key1)
            .setFreezeKey(key2)
            .setWipeKey(key3)
            .setSupplyKey(key4)
            .setFreezeDefault(false)
            .setMaxTransactionFee(new Hbar(1000))
            .execute(client);

        const token = (await response.getReceipt(client)).tokenId;

        let info = await new TokenInfoQuery().setTokenId(token).execute(client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(operatorId.toString());
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;

        await (
            await new TokenUpdateTransaction()
                .setTokenId(token)
                .setTokenName("aaaa")
                .setTokenSymbol("A")
                .execute(client)
        ).getReceipt(client);

        info = await new TokenInfoQuery().setTokenId(token).execute(client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("aaaa");
        expect(info.symbol).to.eql("A");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(operatorId.toString());
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;

        await (
            await new TokenDeleteTransaction().setTokenId(token).execute(client)
        ).getReceipt(client);
    });

    it("should be executable when no properties except token ID are set", async function () {
        this.timeout(20000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();
        const key3 = PrivateKey.generate();
        const key4 = PrivateKey.generate();

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(key1)
            .setFreezeKey(key2)
            .setWipeKey(key3)
            .setSupplyKey(key4)
            .setFreezeDefault(false)
            .setMaxTransactionFee(new Hbar(1000))
            .execute(client);

        const token = (await response.getReceipt(client)).tokenId;

        await (
            await new TokenUpdateTransaction().setTokenId(token).execute(client)
        ).getReceipt(client);

        await (
            await new TokenDeleteTransaction().setTokenId(token).execute(client)
        ).getReceipt(client);
    });

    it("should error updating immutable token", async function () {
        this.timeout(10000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setTreasuryAccountId(operatorId)
            .setMaxTransactionFee(new Hbar(1000))
            .execute(client);

        const token = (await response.getReceipt(client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenUpdateTransaction()
                    .setTokenId(token)
                    .setTokenName("aaaa")
                    .setTokenSymbol("A")
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.TokenIsImmutable);
        }

        if (!err) {
            throw new Error("token update did not error");
        }
    });

    it("should error when token ID is not set", async function () {
        this.timeout(10000);

        const client = await newClient();

        let err = false;

        try {
            await (
                await new TokenUpdateTransaction().execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token update did not error");
        }
    });

    it("should be exectuable when updating immutable token, but not setting any fields besides token ID", async function () {
        this.timeout(10000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setTreasuryAccountId(operatorId)
            .setMaxTransactionFee(new Hbar(1000))
            .execute(client);

        const token = (await response.getReceipt(client)).tokenId;

        await (
            await new TokenUpdateTransaction().setTokenId(token).execute(client)
        ).getReceipt(client);
    });

    it("should error when admin key does not sign transaction", async function () {
        this.timeout(10000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const key = PrivateKey.generate();

        const response = await (
            await new TokenCreateTransaction()
                .setTokenName("ffff")
                .setTokenSymbol("F")
                .setTreasuryAccountId(operatorId)
                .setAdminKey(key)
                .setMaxTransactionFee(new Hbar(1000))
                .freezeWith(client)
                .sign(key)
        ).execute(client);

        const token = (await response.getReceipt(client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenUpdateTransaction()
                    .setTokenId(token)
                    .setTokenName("aaaa")
                    .setTokenSymbol("A")
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidSignature);
        }

        if (!err) {
            throw new Error("token update did not error");
        }
    });
});
