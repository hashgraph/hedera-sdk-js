import {
    TopicMessageQuery,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TopicMessageQuery", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new({ throwaway: true });
    });

    it.skip("should be executable", async function () {
        // client.setTransportSecurity(true);
        // client.setMirrorNetwork(["mainnet-public.mirrornode.hedera.com:443"]);

        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        // Skip this test if we do not have a mirror network
        if (env.client.mirrorNetwork.length == 0) {
            return;
        }

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setAutoRenewAccountId(operatorId)
            .execute(env.client);

        const topic = (await response.getReceipt(env.client)).topicId;
        const contents = "Hello from Hedera SDK JS";

        await (
            await new TopicMessageSubmitTransaction()
                .setTopicId(topic)
                .setMessage(contents)
                .execute(env.client)
        ).getReceipt(env.client);

        let finished = false;
        let endTime = Date.now() + 50000;

        new TopicMessageQuery()
            .setTopicId(topic)
            // .setStartTime(0)
            // .setLimit(1)
            // eslint-disable-next-line no-unused-vars
            .subscribe(env.client, (_) => {
                finished = true;
            });

        while (!finished && Date.now() < endTime) {
            //NOSONAR
            await new Promise((resolved) => setTimeout(resolved, 5000));
        }

        if (!finished) {
            throw new Error("Did not receive message from query");
        }
    });

    after(async function () {
        await env.close();
    });
});
