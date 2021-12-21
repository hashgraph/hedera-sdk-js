import { AccountInfoQuery, AccountId } from "../src/exports.js";
import Mocker, { UNAVAILABLE, INTERNAL, PRIVATE_KEY } from "./Mocker.js";
import Long from "long";

const ACCOUNT_INFO_QUERY_COST_RESPONSE = {
    cryptoGetInfo: {
        header: {
            nodeTransactionPrecheckCode: 0,
            responseType: 2,
            cost: Long.fromNumber(25),
        },
    },
};

const ACCOUNT_INFO_QUERY_RESPONSE = {
    cryptoGetInfo: {
        header: { nodeTransactionPrecheckCode: 0 },
        accountInfo: {
            accountID: {
                shardNum: Long.ZERO,
                realmNum: Long.ZERO,
                accountNum: Long.fromNumber(10),
            },
            key: {
                ed25519: PRIVATE_KEY.publicKey.toBytesRaw(),
            },
            expirationTime: {
                seconds: Long.fromNumber(10),
                nanos: 9,
            },
            alias: null,
        },
    },
};

describe("AccountInfo", function () {
    it("should retry on `UNAVAILABLE`", async function () {
        const { client, servers } = await Mocker.withResponses([
            [
                { error: UNAVAILABLE },
                { response: ACCOUNT_INFO_QUERY_COST_RESPONSE },
                { response: ACCOUNT_INFO_QUERY_RESPONSE },
            ],
        ]);

        const info = await new AccountInfoQuery()
            .setAccountId("0.0.3")
            .execute(client);

        expect(info.accountId.toString()).to.be.equal("0.0.10");

        servers.close();
    });

    it("should retry on `INTERNAL` and retry multiple nodes", async function () {
        this.timeout(10000);

        const responses1 = [
            { error: INTERNAL },
            { response: ACCOUNT_INFO_QUERY_COST_RESPONSE },
            { error: INTERNAL },
            { error: INTERNAL },
        ];

        const responses2 = [
            { error: INTERNAL },
            { error: INTERNAL },
            { response: ACCOUNT_INFO_QUERY_RESPONSE },
        ];

        const { client, servers } = await Mocker.withResponses([
            responses1,
            responses2,
        ]);

        const info = await new AccountInfoQuery()
            .setNodeAccountIds([new AccountId(3), new AccountId(4)])
            .setAccountId("0.0.3")
            .execute(client);

        expect(info.accountId.toString()).to.be.equal("0.0.10");

        servers.close();
    });
});
