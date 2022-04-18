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

import TopicId from "./TopicId.js";
import AccountId from "../account/AccountId.js";
import Timestamp from "../Timestamp.js";
import Long from "long";
import Duration from "../Duration.js";
import * as HashgraphProto from "@hashgraph/proto";
import Key from "../Key.js";
import LedgerId from "../LedgerId.js";

/**
 * Current state of a topic.
 */
export default class TopicInfo {
    /**
     * @private
     * @param {object} props
     * @param {TopicId} props.topicId
     * @param {string} props.topicMemo
     * @param {Uint8Array} props.runningHash
     * @param {Long} props.sequenceNumber
     * @param {?Timestamp} props.expirationTime
     * @param {?Key} props.adminKey
     * @param {?Key} props.submitKey
     * @param {?Duration} props.autoRenewPeriod
     * @param {?AccountId} props.autoRenewAccountId
     * @param {LedgerId|null} props.ledgerId
     */
    constructor(props) {
        /**
         * The ID of the topic for which information is requested.
         *
         * @readonly
         */
        this.topicId = props.topicId;

        /**
         * Short publicly visible memo about the topic. No guarantee of uniqueness.
         *
         * @readonly
         */
        this.topicMemo = props.topicMemo;

        /**
         * SHA-384 running hash of (previousRunningHash, topicId, consensusTimestamp, sequenceNumber, message).
         *
         * @readonly
         */
        this.runningHash = props.runningHash;

        /**
         * Sequence number (starting at 1 for the first submitMessage) of messages on the topic.
         *
         * @readonly
         */
        this.sequenceNumber = props.sequenceNumber;

        /**
         * Effective consensus timestamp at (and after) which submitMessage calls will no longer succeed on the topic.
         *
         * @readonly
         */
        this.expirationTime = props.expirationTime;

        /**
         * Access control for update/delete of the topic. Null if there is no key.
         *
         * @readonly
         */
        this.adminKey = props.adminKey;

        /**
         * Access control for ConsensusService.submitMessage. Null if there is no key.
         *
         * @readonly
         */
        this.submitKey = props.submitKey;

        /**
         * @readonly
         */
        this.autoRenewPeriod = props.autoRenewPeriod;

        /**
         * @readonly
         */
        this.autoRenewAccountId = props.autoRenewAccountId;

        this.ledgerId = props.ledgerId;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IConsensusGetTopicInfoResponse} infoResponse
     * @returns {TopicInfo}
     */
    static _fromProtobuf(infoResponse) {
        const info = /** @type {HashgraphProto.proto.IConsensusTopicInfo} */ (
            infoResponse.topicInfo
        );

        return new TopicInfo({
            topicId: TopicId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITopicID} */ (
                    infoResponse.topicID
                )
            ),
            topicMemo: info.memo != null ? info.memo : "",
            runningHash:
                info.runningHash != null ? info.runningHash : new Uint8Array(),
            sequenceNumber:
                info.sequenceNumber != null
                    ? info.sequenceNumber instanceof Long
                        ? info.sequenceNumber
                        : Long.fromValue(info.sequenceNumber)
                    : Long.ZERO,
            expirationTime:
                info.expirationTime != null
                    ? Timestamp._fromProtobuf(info.expirationTime)
                    : null,
            adminKey:
                info.adminKey != null
                    ? Key._fromProtobufKey(info.adminKey)
                    : null,
            submitKey:
                info.submitKey != null
                    ? Key._fromProtobufKey(info.submitKey)
                    : null,
            autoRenewPeriod:
                info.autoRenewPeriod != null
                    ? new Duration(
                          /** @type {Long} */ (info.autoRenewPeriod.seconds)
                      )
                    : null,
            autoRenewAccountId:
                info.autoRenewAccount != null
                    ? AccountId._fromProtobuf(info.autoRenewAccount)
                    : null,
            ledgerId:
                info.ledgerId != null
                    ? LedgerId.fromBytes(info.ledgerId)
                    : null,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IConsensusGetTopicInfoResponse}
     */
    _toProtobuf() {
        return {
            topicID: this.topicId._toProtobuf(),
            topicInfo: {
                memo: this.topicMemo,
                runningHash: this.runningHash,
                sequenceNumber: this.sequenceNumber,
                expirationTime:
                    this.expirationTime != null
                        ? this.expirationTime._toProtobuf()
                        : null,
                adminKey:
                    this.adminKey != null
                        ? this.adminKey._toProtobufKey()
                        : null,
                submitKey:
                    this.submitKey != null
                        ? this.submitKey._toProtobufKey()
                        : null,
                autoRenewPeriod:
                    this.autoRenewPeriod != null
                        ? this.autoRenewPeriod._toProtobuf()
                        : null,
                autoRenewAccount:
                    this.autoRenewAccountId != null
                        ? this.autoRenewAccountId._toProtobuf()
                        : null,
            },
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TopicInfo}
     */
    static fromBytes(bytes) {
        return TopicInfo._fromProtobuf({
            topicInfo: HashgraphProto.proto.ConsensusTopicInfo.decode(bytes),
        });
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.ConsensusTopicInfo.encode(
            /** @type {HashgraphProto.proto.IConsensusTopicInfo} */ (
                this._toProtobuf().topicInfo
            )
        ).finish();
    }
}
