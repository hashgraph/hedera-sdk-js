/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2024 Hedera Hashgraph, LLC
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

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.PendingAirdropRecord} HashgraphProto.proto.PendingAirdropRecord
 */

import Long from "long";
import PendingAirdropId from "./PendingAirdropId.js";

export default class PendingAirdropRecord {
    /**
     * @param {object} props
     * @param {PendingAirdropId} props.airdropId
     * @param {Long} props.amount
     */
    constructor(props) {
        this.airdropId = props.airdropId;
        this.amount = props.amount;
    }

    /**
     * @returns {HashgraphProto.proto.PendingAirdropRecord}
     */
    toBytes() {
        return {
            pendingAirdropId: this.airdropId.toBytes(),
            pendingAirdropValue: {
                amount: this.amount,
            },
        };
    }

    /**
     * @param {HashgraphProto.proto.PendingAirdropRecord} pb
     * @returns {PendingAirdropRecord}
     */
    static fromBytes(pb) {
        if (pb.pendingAirdropId == null) {
            throw new Error("pendingAirdropId is required");
        }

        const airdropId = PendingAirdropId.fromBytes(pb.pendingAirdropId);
        const amount = pb.pendingAirdropValue?.amount;

        return new PendingAirdropRecord({
            airdropId: airdropId,
            amount: amount ? amount : Long.ZERO,
        });
    }
}
