import {
    TokenCreateTransaction,
    TokenInfoQuery,
    Status,
    PrivateKey,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TokenInfo", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const env = await newClient.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
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
            .setNodeAccountIds(env.nodeAccountIds)
            .setFreezeDefault(false)
            .execute(env.client);

        const tokenId = (await response.getReceipt(env.client)).tokenId;

        const info = await new TokenInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setTokenId(tokenId)
            .execute(env.client);

        expect(info.tokenId.toString()).to.eql(tokenId.toString());
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
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;
    });

    it("should be executable with minimal properties set", async function () {
        this.timeout(10000);

        const env = await newClient.new();
        const operatorId = env.operatorId;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setNodeAccountIds(env.nodeAccountIds)
            .setTreasuryAccountId(operatorId)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        let info = await new TokenInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setTokenId(token)
            .execute(env.client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(0);
        expect(info.totalSupply.toInt()).to.eql(0);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey).to.be.null;
        expect(info.kycKey).to.be.null;
        expect(info.freezeKey).to.be.null;
        expect(info.wipeKey).to.be.null;
        expect(info.supplyKey).to.be.null;
        expect(info.defaultFreezeStatus).to.be.null;
        expect(info.defaultKycStatus).to.be.null;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;
    });

    it("should error when token ID is not set", async function () {
        this.timeout(10000);

        const env = await newClient.new();

        let err = false;

        try {
            await new TokenInfoQuery()
                .setNodeAccountIds(env.nodeAccountIds)
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token info query did not error");
        }
    });
});
