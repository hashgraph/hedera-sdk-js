const {
    Client,
    AccountBalanceQuery,
} = require("@hashgraph/sdk");

describe("CommonJS", function () {
    it("test", async function () {
        this.timeout(30000);

        const client = Client.forPreviewnet();

        for (const [_, nodeAccountId] of Object.entries(client.network)) {
            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(nodeAccountId)
                .setMaxAttempts(1)
                .execute(client);
        }
    });
});
