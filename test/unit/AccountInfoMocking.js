import { AccountInfoQuery } from "../src/exports.js";
import Mocker, { UNAVAILABLE, PRIVATE_KEY } from "./Mocker.js";
import Long from "long";

describe("AccountInfo", function () {
    it("should retry on `UNAVAILABLE`", async function () {
        const { client, server } = await Mocker.withResponses([
            { error: UNAVAILABLE },
            {
                response: {
                    cryptoGetInfo: {
                        header: {
                            nodeTransactionPrecheckCode: 0,
                            responseType: 2,
                            cost: Long.fromNumber(25),
                        },
                    },
                },
            },
            {
                response: {
                    cryptoGetInfo: {
                        header: { nodeTransactionPrecheckCode: 0 },
                        accountInfo: {
                            accountID: {
                                shardNum: Long.ZERO,
                                realmNum: Long.ZERO,
                                accountNum: Long.fromNumber(10),
                            },
                            key: {
                                ed25519: PRIVATE_KEY.publicKey.toBytes(),
                            },
                            expirationTime: {
                                seconds: Long.fromNumber(10),
                                nanos: 9,
                            },
                        },
                    },
                },
            },
        ]);

        const info = await new AccountInfoQuery()
            .setAccountId("0.0.3")
            .execute(client);

        expect(info.accountId.toString()).to.be.equal("0.0.10");

        server.close();
    });
});
