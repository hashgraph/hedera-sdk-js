import {
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenInfoQuery,
    Hbar,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TokenCreate", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const transactionId = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setFreezeKey(operatorKey)
            .setWipeKey(operatorKey)
            .setKycKey(operatorKey)
            .setSupplyKey(operatorKey)
            .setFreezeDefault(false)
            .setMaxTransactionFee(new Hbar(1000))
            .execute(client);

        const tokenId = (await transactionId.getReceipt(client)).tokenId;

        const info = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);

        expect(info.tokenId.toString()).to.eql(tokenId.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(operatorKey.toString());
        expect(info.freezeKey.toString()).to.eql(operatorKey.toString());
        expect(info.wipeKey.toString()).to.eql(operatorKey.toString());
        expect(info.supplyKey.toString()).to.eql(operatorKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.null;
        expect(info.autoRenewPeriod).to.be.null;
        expect(info.expirationTime).to.be.not.null;

        await (
            await new TokenDeleteTransaction()
                .setTokenId(tokenId)
                .execute(client)
        ).getReceipt(client);
    });
});
