import { expect } from "chai";
import {
    Hbar,
    MaxQueryPaymentExceeded,
    AccountInfoQuery,
    AccountId,
    FileCreateTransaction,
    TransactionId,
    TransferTransaction,
} from "../../src/index.js";
import Mocker, { UNAVAILABLE, INTERNAL, PRIVATE_KEY } from "./Mocker.js";
import Long from "long";
import { proto } from "@hashgraph/proto";
import * as hex from "../../src/encoding/hex.js";

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

describe("AccountInfoMocking", function () {
    let client;
    let servers;

    afterEach(function () {
        client.close();
        servers.close();
    });

    it("payment transaction is correctly constructed", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                {
                    call: () => {
                        return ACCOUNT_INFO_QUERY_COST_RESPONSE;
                    },
                },
                {
                    call: (request) => {
                        const transaction = TransferTransaction.fromBytes(
                            proto.Transaction.encode(
                                request.cryptoGetInfo.header.payment,
                            ).finish(),
                        );
                        const hbarTransfers = transaction.hbarTransfers;
                        expect(hbarTransfers.size).to.be.equal(2);
                        expect(
                            hbarTransfers
                                .get(client.operatorAccountId)
                                .toTinybars()
                                .toInt(),
                        ).to.be.lt(0);
                        expect(
                            hbarTransfers
                                .get(Object.values(client.network)[0])
                                .toTinybars()
                                .toInt(),
                        ).to.be.gt(0);
                        return ACCOUNT_INFO_QUERY_RESPONSE;
                    },
                },
            ],
        ]));

        const info = await new AccountInfoQuery()
            .setAccountId("0.0.3")
            .execute(client);

        expect(info.accountId.toString()).to.be.equal("0.0.10");
    });

    it("should retry on UNAVAILABLE", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { error: UNAVAILABLE },
                { response: ACCOUNT_INFO_QUERY_COST_RESPONSE },
                { response: ACCOUNT_INFO_QUERY_RESPONSE },
            ],
        ]));

        const info = await new AccountInfoQuery()
            .setAccountId("0.0.3")
            .execute(client);

        expect(info.accountId.toString()).to.be.equal("0.0.10");
    });

    it("should error when cost is greater than max cost set on client", async function () {
        let errorName;

        ({ client, servers } = await Mocker.withResponses([
            [
                { response: ACCOUNT_INFO_QUERY_COST_RESPONSE },
                { response: ACCOUNT_INFO_QUERY_RESPONSE },
            ],
        ]));

        client.setDefaultMaxQueryPayment(Hbar.fromTinybars(10));

        try {
            await new AccountInfoQuery()
                .setAccountId("0.0.3")
                .execute(client, 1);
        } catch (error) {
            errorName = error.name;
        }

        expect(errorName).to.be.eql("MaxQueryPaymentExceededError");
    });

    it("setQueryPayemnt() avoids querying actual cost", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [{ response: ACCOUNT_INFO_QUERY_RESPONSE }],
        ]));

        const query = new AccountInfoQuery()
            .setAccountId("0.0.3")
            .setQueryPayment(Hbar.fromTinybars(10));

        await query.execute(client, 1);

        expect(query._queryPayment.toTinybars().toInt()).to.be.equal(10);
    }, 15000);

    it("setQueryPayemnt() + setMaxQueryPayment() avoids querying actual cost", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [{ response: ACCOUNT_INFO_QUERY_RESPONSE }],
        ]));

        const query = new AccountInfoQuery()
            .setAccountId("0.0.3")
            .setMaxQueryPayment(Hbar.fromTinybars(1))
            .setQueryPayment(Hbar.fromTinybars(10));

        await query.execute(client, 1);

        expect(query._queryPayment.toTinybars().toInt()).to.be.equal(10);
    });

    it("actual cost is compared to Client.maxQueryPayment if Query.setMaxQueryPayment is not used", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { response: ACCOUNT_INFO_QUERY_COST_RESPONSE },
                { response: ACCOUNT_INFO_QUERY_RESPONSE },
            ],
        ]));

        client.setDefaultMaxQueryPayment(Hbar.fromTinybars(24));

        let err = false;

        const query = new AccountInfoQuery().setAccountId("0.0.3");

        try {
            await query.execute(client, 1);
        } catch (error) {
            err = error instanceof MaxQueryPaymentExceeded;
        }

        expect(err).to.be.true;
    });

    it("actual cost is compared to Query.setMaxQueryPayment when set", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { response: ACCOUNT_INFO_QUERY_COST_RESPONSE },
                { response: ACCOUNT_INFO_QUERY_RESPONSE },
            ],
        ]));

        let err = false;

        const query = new AccountInfoQuery()
            .setMaxQueryPayment(Hbar.fromTinybars(24))
            .setAccountId("0.0.3");

        try {
            await query.execute(client, 1);
        } catch (error) {
            err = error instanceof MaxQueryPaymentExceeded;
        }

        expect(err).to.be.true;
    });

    it("should not error when cost is less than max cost set on request", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { response: ACCOUNT_INFO_QUERY_COST_RESPONSE },
                { response: ACCOUNT_INFO_QUERY_RESPONSE },
            ],
        ]));

        let err = false;

        try {
            await new AccountInfoQuery()
                .setAccountId("0.0.3")
                .setMaxQueryPayment(Hbar.fromTinybars(28))
                .execute(client, 1);
        } catch (error) {
            err = error instanceof MaxQueryPaymentExceeded;
        }

        expect(err).to.be.false;
    });

    it("should retry on `INTERNAL` and retry multiple nodes", async function () {
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

        ({ client, servers } = await Mocker.withResponses([
            responses1,
            responses2,
        ]));

        const info = await new AccountInfoQuery()
            .setNodeAccountIds([new AccountId(3), new AccountId(4)])
            .setAccountId("0.0.3")
            .execute(client);

        expect(info.accountId.toString()).to.be.equal("0.0.10");
    });

    it("should be able to execute after getting transaction hashes", async function () {
        const responses1 = [{ response: { nodeTransactionPrecheckCode: 0 } }];

        ({ client, servers } = await Mocker.withResponses([responses1]));

        client.setSignOnDemand(true);

        const transaction = await new FileCreateTransaction()
            .setContents("hello 1")
            .freezeWith(client)
            .signWithOperator(client);

        const hash = await transaction.getTransactionHash();
        const response = await transaction.execute(client);

        expect(hash.length).to.be.equal(48);
        expect(hex.encode(hash)).to.be.equal(
            hex.encode(response.transactionHash),
        );
    });

    it("should be able to execute after getting transaction hashes with sign on demand disabled", async function () {
        const responses1 = [{ response: { nodeTransactionPrecheckCode: 0 } }];

        ({ client, servers } = await Mocker.withResponses([responses1]));

        const transaction = await new FileCreateTransaction()
            .setContents("hello 1")
            .freezeWith(client)
            .signWithOperator(client);

        const hash = await transaction.getTransactionHash();
        const response = await transaction.execute(client);

        expect(hash.length).to.be.equal(48);
        expect(hex.encode(hash)).to.be.equal(
            hex.encode(response.transactionHash),
        );
    });

    it("should generate new transaction ID when TRANSACTION_EXPIRED is return", async function () {
        const transactionIds = new Set();
        const callResponses = [
            {
                nodeTransactionPrecheckCode:
                    proto.ResponseCodeEnum.TRANSACTION_EXPIRED,
            },
            { nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK },
        ];

        /**
         * @type {(request: proto.ITransaction, index: number) => proto.ITransactionResponse}
         */
        const call = (request, index) => {
            expect(request.signedTransactionBytes).to.not.be.null;
            const signedTransaction = proto.SignedTransaction.decode(
                request.signedTransactionBytes,
            );

            expect(signedTransaction.bodyBytes).to.not.be.null;
            const transactionBody = proto.TransactionBody.decode(
                signedTransaction.bodyBytes,
            );

            expect(transactionBody.transactionId).to.not.be.null;
            const transactionId = TransactionId._fromProtobuf(
                transactionBody.transactionID,
            ).toString();
            expect(transactionId).to.not.be.equal("");

            expect(transactionIds.has(transactionId)).to.be.false;
            transactionIds.add(transactionId);

            // Verify signatures exist
            expect(Mocker.verifySignatures(signedTransaction)).to.be.true;

            return callResponses[index];
        };

        const responses1 = [{ call }, { call }, { call }];

        ({ client, servers } = await Mocker.withResponses([responses1]));

        client.setSignOnDemand(true);

        await new FileCreateTransaction()
            .setContents("hello 1")
            .execute(client);
    });

    it("should error `TRANSACTION_EXPIRED` is return and client disabled transaction regeneration", async function () {
        const responses1 = [
            {
                response: {
                    nodeTransactionPrecheckCode:
                        proto.ResponseCodeEnum.TRANSACTION_EXPIRED,
                },
            },
        ];

        ({ client, servers } = await Mocker.withResponses([responses1]));

        client.setSignOnDemand(true);

        try {
            await new FileCreateTransaction()
                .setTransactionId(
                    TransactionId.fromString("0.0.1854@1651168054.29348185"),
                )
                .setContents("hello 1")
                .setRegenerateTransactionId(false)
                .execute(client);
        } catch (error) {
            if (
                error.message !==
                "transaction 0.0.1854@1651168054.029348185 failed precheck with status TRANSACTION_EXPIRED against node account id 0.0.3"
            ) {
                throw error;
            }
        }
    });

    it("should still regenerate transaction IDs on `TRANSACTION_EXPIRED` when client disabled it, but transaction re-enabled it", async function () {
        const transactionIds = new Set();
        const callResponses = [
            {
                nodeTransactionPrecheckCode:
                    proto.ResponseCodeEnum.TRANSACTION_EXPIRED,
            },
            { nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK },
        ];

        /**
         * @type {(request: proto.ITransaction, index: number) => proto.ITransactionResponse}
         */
        const call = (request, index) => {
            expect(request.signedTransactionBytes).to.not.be.null;
            const signedTransaction = proto.SignedTransaction.decode(
                request.signedTransactionBytes,
            );

            expect(signedTransaction.bodyBytes).to.not.be.null;
            const transactionBody = proto.TransactionBody.decode(
                signedTransaction.bodyBytes,
            );

            expect(transactionBody.transactionId).to.not.be.null;
            const transactionId = TransactionId._fromProtobuf(
                transactionBody.transactionID,
            ).toString();
            expect(transactionId).to.not.be.equal("");

            expect(transactionIds.has(transactionId)).to.be.false;
            transactionIds.add(transactionId);

            // Verify signatures exist
            expect(Mocker.verifySignatures(signedTransaction)).to.be.true;

            return callResponses[index];
        };

        const responses1 = [{ call }, { call }, { call }];

        ({ client, servers } = await Mocker.withResponses([responses1]));

        client.setSignOnDemand(true);
        client.setDefaultRegenerateTransactionId(false);

        await new FileCreateTransaction()
            .setRegenerateTransactionId(true)
            .setContents("hello 1")
            .execute(client);
    });

    it("should timeout if Client.setRequestTimeout is set", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
            ],
        ]));

        client.setRequestTimeout(1);

        let err = false;

        try {
            await new AccountInfoQuery().setAccountId("0.0.3").execute(client);
        } catch (error) {
            err = error.message == "timeout exceeded";
        }

        if (!err) {
            throw new Error("request didn't timeout");
        }
    });

    it("should timeout if Executable.execute(client, requestTimeout) is set", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
            ],
        ]));

        let err = false;

        try {
            await new AccountInfoQuery()
                .setAccountId("0.0.3")
                .execute(client, 1);
        } catch (error) {
            err = error.message == "timeout exceeded";
        }

        if (!err) {
            throw new Error("request didn't timeout");
        }
    });

    it("should timeout if gRPC deadline is reached", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
            ],
        ]));

        let err = false;

        try {
            await new AccountInfoQuery()
                .setAccountId("0.0.3")
                .setGrpcDeadline(1)
                .execute(client);
        } catch (error) {
            err = error.message == "grpc deadline exceeded";
        }

        if (!err) {
            throw new Error("request didn't timeout");
        }
    });

    it("should timeout immediately", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
            ],
        ]));

        let err = false;

        try {
            await new AccountInfoQuery()
                .setAccountId("0.0.3")
                .execute(client, 1);
        } catch (error) {
            err = error.message === "timeout exceeded";
        }

        expect(err).to.be.true;
    });

    it("should doesn't timeout immediately", async function () {
        ({ client, servers } = await Mocker.withResponses([
            [
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
                { error: UNAVAILABLE },
            ],
        ]));

        let err = false;

        try {
            await new AccountInfoQuery()
                .setAccountId("0.0.3")
                .execute(client, 10000);
        } catch (error) {
            err = error.message === "timeout exceeded";
        }

        expect(err).to.be.false;
    });

    it("should throw an error if trying to execute the transaction with node which is not within client`s node list", async function () {
        const responses1 = [{ response: { nodeTransactionPrecheckCode: 0 } }];

        ({ client, servers } = await Mocker.withResponses([responses1]));

        client.setSignOnDemand(true);

        const transaction = new FileCreateTransaction()
            .setContents("hello 1")
            .freezeWith(client);

        // Sets the nodeAccountIds to a different list, but doesn't lock the list
        // this simulates when `freezeWith()` sets the node account IDs to a list
        // without locking it, but this list overwritten when executing.
        transaction._nodeAccountIds.setList([new AccountId(4)]);
        await transaction.signWithOperator(client);

        try {
            await transaction.execute(client);
        } catch (error) {
            // Attempting to execute the transaction with a node that is not in the client's node list
            expect(error.message).to.be.equal(
                "Attempting to execute a transaction against node 0.0.4, which is not included in the Client's node list. Please review your Client configuration.",
            );
        }
    });
});
