const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");

describe("CommonJS", function () {
    it("it should query each node's balance", async function () {
        this.timeout(15000);

        const client = Client.forTestnet();

        for (const [, nodeAccountId] of Object.entries(client.network)) {
            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(nodeAccountId)
                .execute(client);
        }
        client.close();
    });
});
