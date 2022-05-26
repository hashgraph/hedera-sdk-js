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

import ReceiptStatusError from "../ReceiptStatusError.js";
import Status from "../Status.js";
import TransactionReceiptQuery from "./TransactionReceiptQuery.js";
import TransactionRecordQuery from "./TransactionRecordQuery.js";
import AccountId from "../account/AccountId.js";
import TransactionId from "./TransactionId.js";
import * as hex from "../encoding/hex.js";

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("./TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("./TransactionRecord.js").default} TransactionRecord
 * @typedef {import("../Signer.js").Signer} Signer
 */

/**
 * @typedef {object} TransactionResponseJSON
 * @property {string} nodeId
 * @property {string} transactionHash
 * @property {string} transactionId
 */

export default class TransactionResponse {
    /**
     * @internal
     * @param {object} props
     * @param {AccountId} props.nodeId
     * @param {Uint8Array} props.transactionHash
     * @param {TransactionId} props.transactionId
     */
    constructor(props) {
        /** @readonly */
        this.nodeId = props.nodeId;

        /** @readonly */
        this.transactionHash = props.transactionHash;

        /** @readonly */
        this.transactionId = props.transactionId;

        Object.freeze(this);
    }

    /**
     * @param {TransactionResponseJSON} json
     * @returns {TransactionResponse}
     */
    static fromJSON(json) {
        return new TransactionResponse({
            nodeId: AccountId.fromString(json.nodeId),
            transactionHash: hex.decode(json.transactionHash),
            transactionId: TransactionId.fromString(json.transactionId),
        });
    }

    /**
     * @param {Client} client
     * @returns {Promise<TransactionReceipt>}
     */
    async getReceipt(client) {
        const receipt = await this.getReceiptQuery().execute(client);

        if (receipt.status !== Status.Success) {
            throw new ReceiptStatusError({
                transactionReceipt: receipt,
                status: receipt.status,
                transactionId: this.transactionId,
            });
        }

        return receipt;
    }

    /**
     * @param {Client} client
     * @returns {Promise<TransactionRecord>}
     */
    async getRecord(client) {
        await this.getReceipt(client);

        return this.getRecordQuery().execute(client);
    }

    /**
     * @param {Signer} signer
     * @returns {Promise<TransactionReceipt>}
     */
    async getReceiptWithSigner(signer) {
        const receipt = await this.getReceiptQuery().executeWithSigner(signer);

        if (receipt.status !== Status.Success) {
            throw new ReceiptStatusError({
                transactionReceipt: receipt,
                status: receipt.status,
                transactionId: this.transactionId,
            });
        }

        return receipt;
    }

    /**
     * @param {Signer} signer
     * @returns {Promise<TransactionRecord>}
     */
    async getRecordWithSigner(signer) {
        await this.getReceiptWithSigner(signer);

        return this.getRecordQuery().executeWithSigner(signer);
    }

    /**
     * @returns {TransactionReceiptQuery}
     */
    getReceiptQuery() {
        return new TransactionReceiptQuery()
            .setTransactionId(this.transactionId)
            .setNodeAccountIds([this.nodeId]);
    }

    /**
     * @returns {TransactionRecordQuery}
     */
    getRecordQuery() {
        return new TransactionRecordQuery()
            .setTransactionId(this.transactionId)
            .setNodeAccountIds([this.nodeId]);
    }

    /**
     * @returns {TransactionResponseJSON}
     */
    toJSON() {
        return {
            nodeId: this.nodeId.toString(),
            transactionHash: hex.encode(this.transactionHash),
            transactionId: this.transactionId.toString(),
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }
}
