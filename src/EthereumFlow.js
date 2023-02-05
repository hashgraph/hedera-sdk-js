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

import Hbar from "./Hbar.js";
import EthereumTransaction from "./EthereumTransaction.js";
import EthereumTransactionData from "./EthereumTransactionData.js";
import FileCreateTransaction from "./file/FileCreateTransaction.js";
import FileAppendTransaction from "./file/FileAppendTransaction.js";
import * as hex from "./encoding/hex.js";

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
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./file/FileId.js").default} FileId
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./client/Client.js").default<*, *>} Client
 * @typedef {import("./Timestamp.js").default} Timestamp
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("long").Long} Long
 */

/**
 * Create a new Hedera™ transaction wrapped ethereum transaction.
 */
export default class EthereumFlow {
    /**
     * @param {object} [props]
     * @param {Uint8Array} [props.ethereumData]
     * @param {FileId} [props.callData]
     * @param {number | string | Long | BigNumber | Hbar} [props.maxGasAllowance]
     */
    constructor(props = {}) {
        /**
         * @private
         * @type {?EthereumTransactionData}
         */
        this._ethereumData = null;

        /**
         * @private
         * @type {?FileId}
         */
        this._callDataFileId = null;

        /**
         * @private
         * @type {?Hbar}
         */
        this._maxGasAllowance = null;

        if (props.ethereumData != null) {
            this.setEthereumData(props.ethereumData);
        }

        if (props.maxGasAllowance != null) {
            this.setMaxGasAllowanceHbar(props.maxGasAllowance);
        }

        this._maxChunks = null;
    }

    /**
     * @returns {number | null}
     */
    get maxChunks() {
        return this._maxChunks;
    }

    /**
     * @param {number} maxChunks
     * @returns {this}
     */
    setMaxChunks(maxChunks) {
        this._maxChunks = maxChunks;
        return this;
    }

    /**
     * @returns {?EthereumTransactionData}
     */
    get ethereumData() {
        return this._ethereumData;
    }

    /**
     * The raw Ethereum transaction (RLP encoded type 0, 1, and 2). Complete
     * unless the callData field is set.
     *
     * @param {EthereumTransactionData | Uint8Array} ethereumData
     * @returns {this}
     */
    setEthereumData(ethereumData) {
        this._ethereumData =
            ethereumData instanceof Uint8Array
                ? EthereumTransactionData.fromBytes(ethereumData)
                : ethereumData;
        return this;
    }

    /**
     * @returns {?Hbar}
     */
    get maxGasAllowance() {
        return this._maxGasAllowance;
    }

    /**
     * @deprecated - use masGasAllowanceHbar instead.
     * @param {number | string | Long | BigNumber | Hbar} maxGasAllowance
     * @returns {this}
     */
    setMaxGasAllowance(maxGasAllowance) {
        return this.setMaxGasAllowanceHbar(maxGasAllowance);
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
     * @param {number | string | Long | BigNumber | Hbar} maxGasAllowance
     * @returns {this}
     */
    setMaxGasAllowanceHbar(maxGasAllowance) {
        this._maxGasAllowance =
            maxGasAllowance instanceof Hbar
                ? maxGasAllowance
                : new Hbar(maxGasAllowance);
        return this;
    }

    /**
     * @template {Channel} ChannelT
     * @template MirrorChannelT
     * @param {import("./client/Client.js").default<ChannelT, MirrorChannelT>} client
     * @returns {Promise<TransactionResponse>}
     */
    async execute(client) {
        if (this._ethereumData == null) {
            throw new Error(
                "cannot submit ethereum transaction with no ethereum data"
            );
        }

        const ethereumTransaction = new EthereumTransaction();
        const ethereumTransactionDataBytes = this._ethereumData.toBytes();

        if (this._maxGasAllowance != null) {
            ethereumTransaction.setMaxGasAllowanceHbar(this._maxGasAllowance);
        }

        if (this._callDataFileId != null) {
            if (this._ethereumData.callData.length === 0) {
                throw new Error(
                    "call data file ID provided, but ethereum data already contains call data"
                );
            }

            ethereumTransaction
                .setEthereumData(ethereumTransactionDataBytes)
                .setCallDataFileId(this._callDataFileId);
        } else if (ethereumTransactionDataBytes.length <= 5120) {
            ethereumTransaction.setEthereumData(ethereumTransactionDataBytes);
        } else {
            const fileId = await createFile(
                this._ethereumData.callData,
                client,
                this._maxChunks
            );

            this._ethereumData.callData = new Uint8Array();

            ethereumTransaction
                .setEthereumData(this._ethereumData.toBytes())
                .setCallDataFileId(fileId);
        }

        return ethereumTransaction.execute(client);
    }
}

/**
 * @template {Channel} ChannelT
 * @template MirrorChannelT
 * @param {Uint8Array} callData
 * @param {import("./client/Client.js").default<ChannelT, MirrorChannelT>} client
 * @param {?number} maxChunks
 * @returns {Promise<FileId>}
 */
async function createFile(callData, client, maxChunks) {
    const hexedCallData = hex.encode(callData);

    const fileId = /** @type {FileId} */ (
        (
            await (
                await new FileCreateTransaction()
                    .setContents(hexedCallData.substring(0, 4096))
                    .setKeys(
                        client.operatorPublicKey
                            ? [client.operatorPublicKey]
                            : []
                    )
                    .execute(client)
            ).getReceipt(client)
        ).fileId
    );

    if (callData.length > 4096) {
        let fileAppendTransaction = new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(hexedCallData.substring(4096, hexedCallData.length));
        if (maxChunks != null) {
            fileAppendTransaction.setMaxChunks(maxChunks);
        }

        await (await fileAppendTransaction.execute(client)).getReceipt(client);
    }

    return fileId;
}
