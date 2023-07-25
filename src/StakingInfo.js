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

import AccountId from "./account/AccountId.js";
import Hbar from "./Hbar.js";
import Timestamp from "./Timestamp.js";
import * as HashgraphProto from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 */

/**
 * @typedef {object} StakingInfoJson
 * @property {boolean} declineStakingReward
 * @property {?string} stakePeriodStart
 * @property {?string} pendingReward
 * @property {?string} stakedToMe
 * @property {?string} stakedAccountId
 * @property {?string} stakedNodeId
 */

/**
 * Staking metadata for an account or a contract returned in CryptoGetInfo or ContractGetInfo queries
 */
export default class StakingInfo {
    /**
     * @private
     * @param {object} props
     * @param {boolean} props.declineStakingReward
     * @param {?Timestamp} props.stakePeriodStart
     * @param {?Hbar} props.pendingReward
     * @param {?Hbar} props.stakedToMe
     * @param {?AccountId} props.stakedAccountId
     * @param {?Long} props.stakedNodeId
     */
    constructor(props) {
        /**
         * If true, this account or contract declined to receive a staking reward.
         *
         * @readonly
         */
        this.declineStakingReward = props.declineStakingReward;

        /**
         * The staking period during which either the staking settings for this
         * account or contract changed (such as starting staking or changing
         * staked_node_id) or the most recent reward was earned, whichever is
         * later. If this account or contract is not currently staked to a
         * node, then this field is not set.
         *
         * @readonly
         */
        this.stakePeriodStart = props.stakePeriodStart;

        /**
         * The amount in tinybars that will be received in the next reward
         * situation.
         *
         * @readonly
         */
        this.pendingReward = props.pendingReward;

        /**
         * The total of balance of all accounts staked to this account or contract.
         *
         * @readonly
         */
        this.stakedToMe = props.stakedToMe;

        /**
         * The account to which this account or contract is staking.
         *
         * @readonly
         */
        this.stakedAccountId = props.stakedAccountId;

        /**
         * The ID of the node this account or contract is staked to.
         *
         * @readonly
         */
        this.stakedNodeId = props.stakedNodeId;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IStakingInfo} info
     * @returns {StakingInfo}
     */
    static _fromProtobuf(info) {
        return new StakingInfo({
            declineStakingReward: info.declineReward == true,
            stakePeriodStart:
                info.stakePeriodStart != null
                    ? Timestamp._fromProtobuf(info.stakePeriodStart)
                    : null,
            pendingReward:
                info.pendingReward != null
                    ? Hbar.fromTinybars(info.pendingReward)
                    : null,
            stakedToMe:
                info.stakedToMe != null
                    ? Hbar.fromTinybars(info.stakedToMe)
                    : null,
            stakedAccountId:
                info.stakedAccountId != null
                    ? AccountId._fromProtobuf(info.stakedAccountId)
                    : null,
            stakedNodeId: info.stakedNodeId != null ? info.stakedNodeId : null,
        });
    }

    /**
     * @returns {HashgraphProto.proto.IStakingInfo}
     */
    _toProtobuf() {
        return {
            declineReward: this.declineStakingReward,
            stakePeriodStart:
                this.stakePeriodStart != null
                    ? this.stakePeriodStart._toProtobuf()
                    : null,
            pendingReward:
                this.pendingReward != null
                    ? this.pendingReward.toTinybars()
                    : null,
            stakedToMe:
                this.stakedToMe != null ? this.stakedToMe.toTinybars() : null,
            stakedAccountId:
                this.stakedAccountId != null
                    ? this.stakedAccountId._toProtobuf()
                    : null,
            stakedNodeId: this.stakedNodeId,
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {StakingInfo}
     */
    static fromBytes(bytes) {
        return StakingInfo._fromProtobuf(
            HashgraphProto.proto.StakingInfo.decode(bytes)
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.StakingInfo.encode(
            this._toProtobuf()
        ).finish();
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @returns {StakingInfoJson}
     */
    toJSON() {
        return {
            declineStakingReward: this.declineStakingReward,
            stakePeriodStart:
                this.stakePeriodStart != null
                    ? this.stakePeriodStart.toString()
                    : null,
            pendingReward:
                this.pendingReward != null
                    ? this.pendingReward.toString()
                    : null,
            stakedToMe:
                this.stakedToMe != null ? this.stakedToMe.toString() : null,
            stakedAccountId:
                this.stakedAccountId != null
                    ? this.stakedAccountId.toString()
                    : null,
            stakedNodeId:
                this.stakedNodeId != null ? this.stakedNodeId.toString() : null,
        };
    }
}
