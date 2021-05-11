// import {
//     TokenCreateTransaction,
//     TokenDeleteTransaction,
//     Status,
// } from "../src/exports.js";
// import IntegrationTestEnv from "./client/index.js";

describe("TokenDelete", function () {
    it("should be executable", async function () {
        // this.timeout(60000);
        //
        // const env = new IntegrationTestEnv();
        // await env.initialize()
        // const operatorId = env.operatorId;
        // const operatorKey = env.operatorKey.publicKey;
        //
        // const response = await new TokenCreateTransaction()
        //     .setTokenName("ffff")
        //     .setTokenSymbol("F")
        //     .setDecimals(3)
        //     .setInitialSupply(1000000)
        //     .setTreasuryAccountId(operatorId)
        //     .setAdminKey(operatorKey)
        //     .setKycKey(operatorKey)
        //     .setFreezeKey(operatorKey)
        //     .setWipeKey(operatorKey)
        //     .setSupplyKey(operatorKey)
        //     .setFreezeDefault(false)
        //     .execute(env.client);
        // const tokenId = (await response.getReceipt(env.client)).tokenId;
        // await (
        //     await new TokenDeleteTransaction()
        //         .setNodeAccountIds([response.nodeId])
        //         .setTokenId(tokenId)
        //         .execute(env.client)
        // ).getReceipt(env.client);
    });

    it("should error with no token ID set", async function () {
        // this.timeout(60000);
        // const env = new IntegrationTestEnv();
        // await env.initialize()
        // let err = false;
        // try {
        //     await (
        //         await new TokenDeleteTransaction().execute(env.client)
        //     ).getReceipt(env.client);
        // } catch (error) {
        //     err = error.toString().includes(Status.InvalidTokenId);
        // }
        // if (!err) {
        //     throw new Error("token deletion did not error");
        // }
    });
});
