import {
    TokenCreateTransaction,
    TokenFeeScheduleUpdateTransaction,
    Hbar,
    TokenId,
    AccountCreateTransaction,
    CustomFixedFee,
    CustomFractionalFee,
    AccountId,
    Status,
    PrivateKey,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("CustomFees", function () {
    it("User can create a fungible token with a fixed custom fee schedule", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setAmount(1);

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        expect(token).to.not.be.null;
    });

    it("User can create a fungible token with a fractional fee schedule", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFractionalFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setNumerator(1)
            .setDenominator(10)
            .setMax(0)
            .setMin(0);

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        expect(token).to.not.be.null;
    });

    it("User cannot create a fungible token with a fractional fee schedule that has a denominator zero", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFractionalFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setNumerator(1)
            .setDenominator(0)
            .setMax(0)
            .setMin(0);

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.FractionDividesByZero);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    it("User cannot create a custom fee schedule over 10 entries", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFractionalFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setNumerator(1)
            .setDenominator(0)
            .setMax(0)
            .setMin(0);

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                    ])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.CustomFeesListTooLong);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    it("User can create custom fixed fee schedule with up to 10 entries", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setAmount(1);

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                    ])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        expect(token).to.not.be.null;
    });

    it("User can create custom fractional fee schedule with up to 10 entries", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFractionalFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setNumerator(1)
            .setDenominator(10)
            .setMax(0)
            .setMin(0);

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                        fee,
                    ])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        expect(token).to.not.be.null;
    });

    it("User has an invalid custom fee collector account ID(s)", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(new AccountId(0xffffffff))
            .setAmount(1);

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidCustomFeeCollector);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("User cannot transfer a custom fee schedule token to a fee collecting account that is not associated with it", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const key = PrivateKey.generate();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setAmount(1);

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        fee.setFeeCollectorAccountId(account);

        let err = false;

        try {
            await (
                await new TokenFeeScheduleUpdateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .setCustomFees([fee])
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidCustomFeeCollector);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    it("User cannot update a token fee schedule without having a fee schedule key signing the transaction", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setAmount(-1);

        let err = false;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        try {
            await (
                await new TokenFeeScheduleUpdateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .setCustomFees([fee])
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.TokenHasNoFeeScheduleKey);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    it("User cannot create a token with a fractional fee schedule where the maximum amount is less than the minimum amount", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFractionalFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setNumerator(1)
            .setDenominator(10)
            .setMax(10)
            .setMin(11);

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.FractionalFeeMaxAmountLessThanMinAmount);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("User cannot create a token with a custom fractional fee is greater than 1", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFractionalFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setNumerator(11)
            .setDenominator(10)
            .setMax(0)
            .setMin(0);

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.InvalidCustomFractionalFeesSum);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("User cannot execute the fee schedule update transaction if there is not fee schedule set already", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setAmount(1);

        let err = false;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        try {
            await (
                await new TokenFeeScheduleUpdateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .setCustomFees([fee])
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.CustomScheduleAlreadyHasNoFees);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("User cannot sign the fee schedule update transaction with any key besides the key schedule key", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const key = PrivateKey.generate();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(account)
            .setAmount(1);

        let err = false;

        const token = (
            await (
                await (
                    await new TokenCreateTransaction()
                        .setNodeAccountIds(env.nodeAccountIds)
                        .setTokenName("ffff")
                        .setTokenSymbol("F")
                        .setTreasuryAccountId(env.operatorId)
                        .setAdminKey(env.operatorKey)
                        .setKycKey(env.operatorKey)
                        .setFreezeKey(env.operatorKey)
                        .setWipeKey(env.operatorKey)
                        .setSupplyKey(env.operatorKey)
                        .setFeeScheduleKey(key)
                        .setFreezeDefault(false)
                        .freezeWith(env.client)
                        .sign(key)
                ).execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        try {
            await (
                await new TokenFeeScheduleUpdateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .setCustomFees([fee])
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidCustomFeeScheduleKey);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });

    it("User can update a fee schedule using the token fee schedule update transaction and fee schedule key", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(env.operatorId)
            .setAmount(1);

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        fee.setAmount(2);

        await (
            await new TokenFeeScheduleUpdateTransaction()
                .setNodeAccountIds(env.nodeAccountIds)
                .setTokenId(token)
                .setCustomFees([fee])
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("User cannot have an invalid token ID in the custom fee field", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const key = PrivateKey.generate();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const fee = new CustomFixedFee()
            .setFeeCollectorAccountId(account)
            .setDenominatingTokenId(new TokenId(0xffffffff))
            .setAmount(1);

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setCustomFees([fee])
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenIdInCustomFees);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }
    });
});
