import Mocker from "../Mocker.js";
import Long from "long";
import { proto } from "@hiero-ledger/proto";

const PING_COST_RESPONSE = {
    cryptoGetInfo: {
        header: {
            nodeTransactionPrecheckCode: 0,
            responseType: proto.ResponseType.COST_ANSWER,
            cost: Long.fromNumber(25),
        },
    },
};

describe("MockerPorts", function () {
    const mocks = [];

    afterEach(function () {
        for (const { client, servers } of mocks.splice(0)) {
            client.close();
            servers.close();
        }
    });

    it("mock networks open at the same time bind different ports", async function () {
        mocks.push(
            await Mocker.withResponses([
                [{ response: PING_COST_RESPONSE }],
                [{ response: PING_COST_RESPONSE }],
            ]),
        );
        mocks.push(
            await Mocker.withResponses([
                [{ response: PING_COST_RESPONSE }],
                [{ response: PING_COST_RESPONSE }],
            ]),
        );

        const addresses = mocks.flatMap(({ client }) =>
            Object.keys(client.network),
        );
        expect(new Set(addresses).size).to.equal(4);

        await mocks[0].client.ping("0.0.3");
        await mocks[1].client.ping("0.0.3");
    });
});
