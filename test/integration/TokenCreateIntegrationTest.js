import {
    TokenCreateTransaction,
    TokenDeleteTransaction,
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

        await (
            await new TokenDeleteTransaction()
                .setTokenId(tokenId)
                .execute(client)
        ).getReceipt(client);
    });
});
