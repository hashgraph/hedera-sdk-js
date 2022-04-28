/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import FileId from "../file/FileId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IEthereumTransactionBody} HashgraphProto.proto.IEthereumTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../Timestamp.js").default} Timestamp
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Create a new Hedera™ crypto-currency account.
 */
export default class ContractEvmTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {Uint8Array | FileId} [props.ethereumData]
     * @param {Long | number} [props.maxGas]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?Uint8Array | FileId}
         */
        this._ethereumData = null;

        /**
         * @private
         * @type {?Long}
         */
        this._maxGas = null;

        if (props.ethereumData != null) {
            this.setEthereumData(props.ethereumData);
        }

        if (props.maxGas != null) {
            this.setMaxGas(props.maxGas);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {ContractEvmTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const transaction =
            /** @type {HashgraphProto.proto.IEthereumTransactionBody} */ (
                body.ethereumTransaction
            );

        let ethereumData = undefined;
        if (transaction.callData != null) {
            ethereumData = FileId._fromProtobuf(transaction.callData);
        } else if (transaction.ethereumData != null) {
            ethereumData = transaction.ethereumData;
        }

        return Transaction._fromProtobufTransactions(
            new ContractEvmTransaction({
                ethereumData,
                maxGas:
                    transaction.maxGasAllowance != null
                        ? Long.fromValue(transaction.maxGasAllowance)
                        : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?(Uint8Array | FileId)}
     */
    get ethereumData() {
        return this._ethereumData;
    }

    /**
     * The raw Ethereum transaction (RLP encoded type 0, 1, and 2). Complete
     * unless the callData field is set.
     *
     * For large transactions (for example contract create) this is the callData
     * of the ethereumData. The data in the ethereumData will be re-written with
     * the callData element as a zero length string with the original contents in
     * the referenced file at time of execution. The ethereumData will need to be
     * "rehydrated" with the callData for signature validation to pass.
     *
     * @param {Uint8Array | FileId} ethereumData
     * @returns {this}
     */
    setEthereumData(ethereumData) {
        this._requireNotFrozen();
        this._ethereumData = ethereumData;
        return this;
    }

    /**
     * @returns {?Long}
     */
    get maxGas() {
        return this._maxGas;
    }

    /**
     * The maximum amount, in tinybars, that the payer of the hedera transaction
     * is willing to pay to complete the transaction.
     *
     * Ordinarily the account with the ECDSA alias corresponding to the public
     * key that is extracted from the ethereum_data signature is responsible for
     * fees that result from the execution of the transaction. If that amount of
     * authorized fees is not sufficient then the payer of the transaction can be
     * charged, up to but not exceeding this amount. If the ethereum_data
     * transaction authorized an amount that was insufficient then the payer will
     * only be charged the amount needed to make up the difference. If the gas
     * price in the transaction was set to zero then the payer will be assessed
     * the entire fee.
     *
     * @param {Long | number} maxGas
     * @returns {this}
     */
    setMaxGas(maxGas) {
        this._requireNotFrozen();
        this._maxGas =
            typeof maxGas === "number" ? Long.fromNumber(maxGas) : maxGas;
        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (
            this._ethereumData != null &&
            this._ethereumData instanceof FileId
        ) {
            this._ethereumData.validateChecksum(client);
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.smartContract.callEthereum(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "ethereumTransaction";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.IEthereumTransactionBody}
     */
    _makeTransactionData() {
        return {
            ethereumData:
                this._ethereumData instanceof FileId
                    ? null
                    : this._ethereumData,
            callData:
                this._ethereumData instanceof FileId
                    ? this._ethereumData._toProtobuf()
                    : null,
            maxGasAllowance: this._maxGas,
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `ContractEvmTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "ethereumTransaction",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractEvmTransaction._fromProtobuf
);
