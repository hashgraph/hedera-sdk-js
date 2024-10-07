import {
    PrivateKey,
    Status,
    TokenCreateTransaction,
    TokenInfoQuery,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TokenInfo", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });

    it("should be executable", async function () {
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateED25519();
        const key3 = PrivateKey.generateED25519();
        const key4 = PrivateKey.generateED25519();
        const key5 = PrivateKey.generateED25519();

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
            .setMetadataKey(key5)
            .setFreezeDefault(false)
            .execute(env.client);

        const tokenId = (await response.getReceipt(env.client)).tokenId;

        const info = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(env.client);

        expect(info.tokenId.toString()).to.eql(tokenId.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString(),
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.metadataKey.toString()).to.eql(key5.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.null;
        expect(info.autoRenewPeriod).to.be.null;
        expect(info.expirationTime).to.be.not.null;
    });

    it("should be executable with minimal properties set", async function () {
        const operatorId = env.operatorId;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setTreasuryAccountId(operatorId)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        let info = await new TokenInfoQuery()
            .setTokenId(token)
            .execute(env.client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(0);
        expect(info.totalSupply.toInt()).to.eql(0);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString(),
        );
        expect(info.adminKey).to.be.null;
        expect(info.kycKey).to.be.null;
        expect(info.freezeKey).to.be.null;
        expect(info.wipeKey).to.be.null;
        expect(info.supplyKey).to.be.null;
        expect(info.metadataKey).to.be.null;
        expect(info.defaultFreezeStatus).to.be.null;
        expect(info.defaultKycStatus).to.be.null;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.null;
        expect(info.autoRenewPeriod).to.be.null;
        expect(info.expirationTime).to.be.not.null;
    });

    it("should be able to query cost", async function () {
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateED25519();
        const key3 = PrivateKey.generateED25519();
        const key4 = PrivateKey.generateED25519();

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
            .execute(env.client);

        const tokenId = (await response.getReceipt(env.client)).tokenId;

        const cost = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .getCost(env.client);

        expect(cost.toTinybars().toInt()).to.be.at.least(1);
    });

    it("should error when token ID is not set", async function () {
        let err = false;

        try {
            await new TokenInfoQuery().execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token info query did not error");
        }
    });

    after(async function () {
        await env.close();
    });
});
