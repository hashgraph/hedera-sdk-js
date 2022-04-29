import { expect } from "chai";

import Long from "long";

import * as hex from "../../src/encoding/hex.js";
import {
    EthereumTransaction,
    AccountId,
    Timestamp,
    FileId,
    Transaction,
    TransactionId,
} from "../../src/index.js";

describe("EthereumTransaction", function () {
    it("toProtobuf with FileId", function () {
        const ethereumData = new FileId(1);
        const maxGas = Long.fromNumber(10);
        const accountId1 = new AccountId(7);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);

        let transaction = new EthereumTransaction()
            .setTransactionId(
                TransactionId.withValidStart(accountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .setEthereumData(ethereumData)
            .setMaxGas(maxGas)
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            ethereumData: null,
            callData: ethereumData._toProtobuf(),
            maxGasAllowance: maxGas,
        });
    });

    it("toProtobuf with Uint8Array", function () {
        const ethereumData = hex.decode("00112233445566778899");
        const maxGas = Long.fromNumber(10);
        const accountId1 = new AccountId(7);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);

        let transaction = new EthereumTransaction()
            .setTransactionId(
                TransactionId.withValidStart(accountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .setEthereumData(ethereumData)
            .setMaxGas(maxGas)
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            ethereumData,
            callData: null,
            maxGasAllowance: maxGas,
        });
    });
});
