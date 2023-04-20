import { expect } from "chai";

import Long from "long";

import {
    PrivateKey,
    AccountCreateTransaction,
    AccountId,
    Timestamp,
    Transaction,
    TransactionId,
    EvmAddress,
} from "../../src/index.js";

describe("AccountCreateTransaction", function () {
    it("should round trip from bytes and maintain order", function () {
        const key1 = PrivateKey.generateECDSA();
        const spenderAccountId1 = new AccountId(7);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);
        const evmAddress = key1.publicKey.toEvmAddress();

        let transaction = new AccountCreateTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1)
            )
            .setAlias(evmAddress)
            .setNodeAccountIds([nodeAccountId])
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            alias: EvmAddress.fromString(evmAddress).toBytes(),
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
        });
    });
});
