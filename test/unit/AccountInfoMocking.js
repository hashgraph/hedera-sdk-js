import {
    AccountInfoQuery,
    AccountId,
    FileCreateTransaction,
    TransactionId,
    PublicKey,
} from "../src/exports.js";
import Mocker, { UNAVAILABLE, INTERNAL, PRIVATE_KEY } from "./Mocker.js";
import Long from "long";
import * as proto from "@hashgraph/proto";

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

    it("should generate new transaction ID per execution unless explicitly set", async function () {
        this.timeout(10000);

        const transactionIds = new Set();
        let count = 0;

        /**
         * @type {(request: proto.ITransaction) => proto.ITransactionResponse}
         */
        const call = (request) => {
            expect(request.signedTransactionBytes).to.not.be.null;
            const signedTransaction = proto.SignedTransaction.decode(
                request.signedTransactionBytes
            );

            expect(signedTransaction.bodyBytes).to.not.be.null;
            const transactionBody = proto.TransactionBody.decode(
                signedTransaction.bodyBytes
            );

            expect(transactionBody.transactionId).to.not.be.null;
            const transactionId = TransactionId._fromProtobuf(
                transactionBody.transactionID
            ).toString();
            expect(transactionId).to.not.be.equal("");

            expect(transactionIds.has(transactionId)).to.be.false;
            transactionIds.add(transactionId);

            const sigMap = /** @type {proto.ISignatureMap} */ (signedTransaction.sigMap);

            expect(sigMap.sigPair).to.be.not.null;
            expect(sigMap.sigPair.length).to.be.not.equal(0);

            for (const sigPair of sigMap.sigPair) {
                let verified = false;

                if (sigPair.ed25519 != null) {
                    verified = PublicKey.fromBytesED25519(sigPair.pubKeyPrefix).verify(signedTransaction.bodyBytes, sigPair.ed25519);
                } else if (sigPair.ECDSASecp256k1 != null) {
                    verified = PublicKey.fromBytesECDSA(sigPair.pubKeyPrefix).verify(signedTransaction.bodyBytes, sigPair.ECDSASecp256k1);
                }

                expect(verified).to.be.true;
            }

            const nodeTransactionPrecheckCode =
                count < 2
                    ? proto.ResponseCodeEnum.OK
                    : proto.ResponseCodeEnum.BUSY;

            count += 1;

            return { nodeTransactionPrecheckCode };
        };

        const responses1 = [{ call }, { call }, { call }, { call }, { call }, { call }];

        const { client, servers } = await Mocker.withResponses([responses1]);

        client.setSignOnDemand(true);

        await new FileCreateTransaction()
            .setContents("hello 1")
            .execute(client);

        client.setSignOnDemand(false);
        transactionIds.clear();
        count = 0;

        await new FileCreateTransaction()
            .setTransactionId(TransactionId.generate(client.operatorAccountId))
            .setContents("hello 1")
            .execute(client);

        servers.close();
    });
});
