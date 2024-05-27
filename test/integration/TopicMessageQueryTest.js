import {
    TopicMessageQuery,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} from "../../src/exports.js";
import { wait } from "../../src/util.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TopicMessageQuery", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new({ throwaway: true });
    });

    it("should be executable", async function () {
        this.timeout(60000);

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

        let listener;
        let endTime = Date.now() + 50000;

        await wait(3000);

        new TopicMessageQuery()
            .setTopicId(topic)
            .setStartTime(0)
            .setEndTime(Date.now())
            .subscribe(env.client, null, (res) => {
                listener = res;
            });

        while (!listener && Date.now() < endTime) {
            //NOSONAR
            await new Promise((resolved) => setTimeout(resolved, 5000));
        }

        expect(listener).to.not.be.null;
        expect(Buffer.from(listener.contents).toString("utf8")).to.be.eql(
            contents,
        );
    });

    after(async function () {
        await env.close();
    });
});
