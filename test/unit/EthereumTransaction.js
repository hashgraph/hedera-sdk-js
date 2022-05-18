import { expect } from "chai";

import Long from "long";

import * as hex from "../../src/encoding/hex.js";
import * as rlp from "@ethersproject/rlp";
import {
    EthereumTransaction,
    AccountId,
    Timestamp,
    FileId,
    Transaction,
    TransactionId,
    Hbar,
} from "../../src/index.js";

describe("EthereumTransaction", function () {
    it("rlp decoded", function () {
        const bytes = hex.decode(
            "f864012f83018000947e3a9eaf9bcc39e2ffa38eb30bf7a93feacbc18180827653820277a0f9fbff985d374be4a55f296915002eec11ac96f1ce2df183adf992baa9390b2fa00c1e867cc960d9c74ec2e6a662b7908ec4c8cc9f3091e886bcefbeb2290fb792"
        );
        console.log(JSON.stringify(rlp.decode(bytes)));
    });

    it("toProtobuf with FileId", function () {
        const ethereumData = hex.decode("00112233445566778899");
        const callData = new FileId(1);
        const maxGasAllowance = Hbar.fromTinybars(Long.fromNumber(10));
        const accountId1 = new AccountId(7);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);

        let transaction = new EthereumTransaction()
            .setTransactionId(
                TransactionId.withValidStart(accountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .setEthereumData(ethereumData)
            .setCallData(callData)
            .setMaxGasAllowance(maxGasAllowance)
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            ethereumData,
            callData: callData._toProtobuf(),
            maxGasAllowance: maxGasAllowance.toTinybars(),
        });
    });

    it("toProtobuf with Uint8Array", function () {
        const ethereumData = hex.decode("00112233445566778899");
        const maxGasAllowance = Hbar.fromTinybars(Long.fromNumber(10));
        const accountId1 = new AccountId(7);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);

        let transaction = new EthereumTransaction()
            .setTransactionId(
                TransactionId.withValidStart(accountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .setEthereumData(ethereumData)
            .setMaxGasAllowance(maxGasAllowance)
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            ethereumData,
            callData: null,
            maxGasAllowance: maxGasAllowance.toTinybars(),
        });
    });
});
