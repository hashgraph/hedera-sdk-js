import TokenCreateTransaction from "../src/token/TokenCreateTransaction.js";
import TokenDeleteTransaction from "../src/token/TokenDeleteTransaction.js";
import newClient from "./client/index.js";

describe("TokenCreate", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const transactionId = await new TokenCreateTransaction()
            .setName("ffff")
            .setSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasury(operatorId)
            .setAdminKey(operatorKey.publicKey)
            .setFreezeKey(operatorKey.publicKey)
            .setWipeKey(operatorKey.publicKey)
            .setKycKey(operatorKey.publicKey)
            .setSupplyKey(operatorKey.publicKey)
            .setFreezeDefault(false)
            .setExpirationTime(Date.now() + 7890000)
            .execute(client);

        const tokenId = (await transactionId.getReceipt(client)).tokenId;

        await (
            await new TokenDeleteTransaction()
                .setTokenId(tokenId)
                .execute(client)
        ).getReceipt(client);
    });
});
