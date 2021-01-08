import {
    TokenCreateTransaction,
    TokenDeleteTransaction,
    Status,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TokenDelete", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = await newClient();
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
            .execute(client);

        const tokenId = (await response.getReceipt(client)).tokenId;

        await (
            await new TokenDeleteTransaction()
                .setTokenId(tokenId)
                .execute(client)
        ).getReceipt(client);
    });

    it("should error with no token ID set", async function () {
        this.timeout(10000);

        const client = await newClient();

        let err = false;

        try {
            await (
                await new TokenDeleteTransaction().execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token deletion did not error");
        }
    });
});
