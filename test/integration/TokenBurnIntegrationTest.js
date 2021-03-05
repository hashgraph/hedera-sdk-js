import {
    TokenCreateTransaction,
    TokenBurnTransaction,
    Hbar,
    Status,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TokenBurn", function () {
    it("should be executable", async function () {
        this.timeout(20000);

        const client = await newClient(true);
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const response = await new TokenCreateTransaction()
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
            .setMaxTransactionFee(new Hbar(1000))
            .execute(client);

        const token = (await response.getReceipt(client)).tokenId;

        await (
            await new TokenBurnTransaction()
                .setNodeAccountIds([response.nodeId])
                .setAmount(10)
                .setTokenId(token)
                .execute(client)
        ).getReceipt(client);
    });

    it("should error when token ID is not set", async function () {
        this.timeout(10000);

        const client = await newClient(true);

        let err = false;

        try {
            await (
                await new TokenBurnTransaction().setAmount(10).execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token Burn did not error");
        }
    });

    it("should error when amount is not set", async function () {
        this.timeout(20000);

        const client = await newClient(true);
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const response = await new TokenCreateTransaction()
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
            .setMaxTransactionFee(new Hbar(1000))
            .execute(client);

        const token = (await response.getReceipt(client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenBurnTransaction()
                    .setTokenId(token)
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenBurnAmount);
        }

        if (!err) {
            throw new Error("token burn did not error");
        }
    });
});
