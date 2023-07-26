/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
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

import AccountId from "../account/AccountId.js";
import ContractId from "../contract/ContractId.js";
import FileId from "../file/FileId.js";
import TopicId from "../topic/TopicId.js";
import TokenId from "../token/TokenId.js";
import ScheduleId from "../schedule/ScheduleId.js";
import ExchangeRate from "../ExchangeRate.js";
import Status from "../Status.js";
import Long from "long";
import * as HashgraphProto from "@hashgraph/proto";
import TransactionId from "../transaction/TransactionId.js";

/**
 * The consensus result for a transaction, which might not be currently known,
 * or may succeed or fail.
 */
export default class TransactionReceipt {
    /**
     * @private
     * @param {object} props
     * @param {Status} props.status
     * @param {?AccountId} props.accountId
     * @param {?FileId} props.fileId
     * @param {?ContractId} props.contractId
     * @param {?TopicId} props.topicId
     * @param {?TokenId} props.tokenId
     * @param {?ScheduleId} props.scheduleId
     * @param {?ExchangeRate} props.exchangeRate
     * @param {?Long} props.topicSequenceNumber
     * @param {?Uint8Array} props.topicRunningHash
     * @param {?Long} props.totalSupply
     * @param {?TransactionId} props.scheduledTransactionId
     * @param {Long[]} props.serials
     * @param {TransactionReceipt[]} props.duplicates
     * @param {TransactionReceipt[]} props.children
     */
    constructor(props) {
        /**
         * Whether the transaction succeeded or failed (or is unknown).
         *
         * @readonly
         */
        this.status = props.status;

        /**
         * The account ID, if a new account was created.
         *
         * @readonly
         */
        this.accountId = props.accountId;

        /**
         * The file ID, if a new file was created.
         *
         * @readonly
         */
        this.fileId = props.fileId;

        /**
         * The contract ID, if a new contract was created.
         *
         * @readonly
         */
        this.contractId = props.contractId;

        /**
         * The topic ID, if a new topic was created.
         *
         * @readonly
         */
        this.topicId = props.topicId;

        /**
         * The token ID, if a new token was created.
         *
         * @readonly
         */
        this.tokenId = props.tokenId;

        /**
         * The schedule ID, if a new schedule was created.
         *
         * @readonly
         */
        this.scheduleId = props.scheduleId;

        /**
         * The exchange rate of Hbars to cents (USD).
         *
         * @readonly
         */
        this.exchangeRate = props.exchangeRate;

        /**
         * Updated sequence number for a consensus service topic.
         *
         * @readonly
         */
        this.topicSequenceNumber = props.topicSequenceNumber;

        /**
         * Updated running hash for a consensus service topic.
         *
         * @readonly
         */
        this.topicRunningHash = props.topicRunningHash;

        /**
         * Updated total supply for a token
         *
         * @readonly
         */
        this.totalSupply = props.totalSupply;

        this.scheduledTransactionId = props.scheduledTransactionId;

        this.serials = props.serials;

        /**
         * @readonly
         */
        this.duplicates = props.duplicates;

        /**
         * @readonly
         */
        this.children = props.children;

        Object.freeze(this);
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ITransactionGetReceiptResponse}
     */
    _toProtobuf() {
        const duplicates = this.duplicates.map(
            (receipt) =>
                /** @type {HashgraphProto.proto.ITransactionReceipt} */ (
                    receipt._toProtobuf().receipt
                )
        );
        const children = this.children.map(
            (receipt) =>
                /** @type {HashgraphProto.proto.ITransactionReceipt} */ (
                    receipt._toProtobuf().receipt
                )
        );

        return {
            duplicateTransactionReceipts: duplicates,
            childTransactionReceipts: children,
            receipt: {
                status: this.status.valueOf(),

                accountID:
                    this.accountId != null
                        ? this.accountId._toProtobuf()
                        : null,
                fileID: this.fileId != null ? this.fileId._toProtobuf() : null,
                contractID:
                    this.contractId != null
                        ? this.contractId._toProtobuf()
                        : null,
                topicID:
                    this.topicId != null ? this.topicId._toProtobuf() : null,
                tokenID:
                    this.tokenId != null ? this.tokenId._toProtobuf() : null,
                scheduleID:
                    this.scheduleId != null
                        ? this.scheduleId._toProtobuf()
                        : null,

                topicRunningHash:
                    this.topicRunningHash == null
                        ? null
                        : this.topicRunningHash,

                topicSequenceNumber: this.topicSequenceNumber,

                exchangeRate: {
                    nextRate: null,
                    currentRate:
                        this.exchangeRate != null
                            ? this.exchangeRate._toProtobuf()
                            : null,
                },

                scheduledTransactionID:
                    this.scheduledTransactionId != null
                        ? this.scheduledTransactionId._toProtobuf()
                        : null,

                serialNumbers: this.serials,
                newTotalSupply: this.totalSupply,
            },
        };
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransactionGetReceiptResponse} response
     * @returns {TransactionReceipt}
     */
    static _fromProtobuf(response) {
        const receipt =
            /** @type {HashgraphProto.proto.ITransactionReceipt} */ (
                response.receipt
            );

        const exchangeRateSet =
            /** @type {HashgraphProto.proto.IExchangeRateSet} */ (
                receipt.exchangeRate
            );

        const children =
            response.childTransactionReceipts != null
                ? response.childTransactionReceipts.map((child) =>
                      TransactionReceipt._fromProtobuf({ receipt: child })
                  )
                : [];

        const duplicates =
            response.duplicateTransactionReceipts != null
                ? response.duplicateTransactionReceipts.map((duplicate) =>
                      TransactionReceipt._fromProtobuf({ receipt: duplicate })
                  )
                : [];

        return new TransactionReceipt({
            status: Status._fromCode(
                receipt.status != null ? receipt.status : 0
            ),

            accountId:
                receipt.accountID != null
                    ? AccountId._fromProtobuf(receipt.accountID)
                    : null,

            fileId:
                receipt.fileID != null
                    ? FileId._fromProtobuf(receipt.fileID)
                    : null,

            contractId:
                receipt.contractID != null
                    ? ContractId._fromProtobuf(receipt.contractID)
                    : null,

            topicId:
                receipt.topicID != null
                    ? TopicId._fromProtobuf(receipt.topicID)
                    : null,

            tokenId:
                receipt.tokenID != null
                    ? TokenId._fromProtobuf(receipt.tokenID)
                    : null,

            scheduleId:
                receipt.scheduleID != null
                    ? ScheduleId._fromProtobuf(receipt.scheduleID)
                    : null,

            exchangeRate:
                receipt.exchangeRate != null
                    ? ExchangeRate._fromProtobuf(
                          /** @type {HashgraphProto.proto.IExchangeRate} */
                          (exchangeRateSet.currentRate)
                      )
                    : null,

            topicSequenceNumber:
                receipt.topicSequenceNumber == null
                    ? null
                    : Long.fromString(receipt.topicSequenceNumber.toString()),

            topicRunningHash:
                receipt.topicRunningHash != null
                    ? new Uint8Array(receipt.topicRunningHash)
                    : null,

            totalSupply:
                receipt.newTotalSupply != null
                    ? Long.fromString(receipt.newTotalSupply.toString())
                    : null,

            scheduledTransactionId:
                receipt.scheduledTransactionID != null
                    ? TransactionId._fromProtobuf(
                          receipt.scheduledTransactionID
                      )
                    : null,
            serials:
                receipt.serialNumbers != null
                    ? receipt.serialNumbers.map((serial) =>
                          Long.fromValue(serial)
                      )
                    : [],
            children,
            duplicates,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TransactionReceipt}
     */
    static fromBytes(bytes) {
        return TransactionReceipt._fromProtobuf(
            HashgraphProto.proto.TransactionGetReceiptResponse.decode(bytes)
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.TransactionGetReceiptResponse.encode(
            this._toProtobuf()
        ).finish();
    }
}
