import { expect } from "chai";

import Long from "long";

import {
    PrivateKey,
    AccountCreateTransaction,
    AccountId,
    Timestamp,
    Transaction,
    TransactionId,
} from "../../src/index.js";
import * as HashgraphProto from "@hashgraph/proto";

describe("AccountCreateTransaction", function () {
    it("should round trip from bytes and maintain order", function () {
        const key1 = PrivateKey.fromString(
            "302e020100300506032b657004220420ee417dd399722ef8920b2c8ec047cf0c51d6c7d3413e9a660ca28205a5f249cd"
        );
        const spenderAccountId1 = new AccountId(7);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);

        let transaction = new AccountCreateTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1)
            )
            .setAliasKey(key1.publicKey)
            .setNodeAccountIds([nodeAccountId])
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            alias: HashgraphProto.proto.Key.encode(
                key1.publicKey._toProtobufKey()
            ).finish(),
            autoRenewPeriod: {
                seconds: Long.fromValue(7776000),
            },
            declineReward: false,
            initialBalance: Long.ZERO,
            key: null,
            maxAutomaticTokenAssociations: 0,
            memo: "",
            proxyAccountID: null,
            receiveRecordThreshold: Long.fromString("9223372036854775807"),
            receiverSigRequired: false,
            sendRecordThreshold: Long.fromString("9223372036854775807"),
            stakedAccountId: null,
            stakedNodeId: null,
            evmAddress: new Uint8Array(),
        });
    });
});
