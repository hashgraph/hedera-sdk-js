import { TopicMessageQuery } from "../../src/exports.js";
import { Client } from "./client/NodeIntegrationTestEnv.js";

describe("TopicMessageQuery", function () {
    it("should be executable", async function () {
        this.timeout(20000);

        const client = Client.forNetwork({});
        client.setTransportSecurity(true);
        client.setMirrorNetwork(["mainnet-public.mirrornode.hedera.com:443"]);

        let finished = false;
        let endTime = Date.now() + 10000;

        new TopicMessageQuery()
            .setTopicId("0.0.120438")
            .setStartTime(0)
            .setLimit(1)
            // eslint-disable-next-line no-unused-vars
            .subscribe(client, (_) => {
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
});
