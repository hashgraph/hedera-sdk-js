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

import TokenId from "../token/TokenId.js";
import TokenRelationship from "./TokenRelationship.js";
import ObjectMap from "../ObjectMap.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenRelationship} HashgraphProto.proto.ITokenRelationship
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HashgraphProto.proto.ITokenID
 */

/**
 * @typedef {import("long")} Long
 */

/**
 * @augments {ObjectMap<TokenId, TokenRelationship>}
 */
export default class TokenRelationshipMap extends ObjectMap {
    constructor() {
        super((s) => TokenId.fromString(s));
    }

    /**
     * @param {HashgraphProto.proto.ITokenRelationship[]} relationships
     * @returns {TokenRelationshipMap}
     */
    static _fromProtobuf(relationships) {
        const tokenRelationships = new TokenRelationshipMap();

        for (const relationship of relationships) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITokenID} */ (
                    relationship.tokenId
                ),
            );

            tokenRelationships._set(
                tokenId,
                TokenRelationship._fromProtobuf(relationship),
            );
        }

        return tokenRelationships;
    }

    /**
     * @returns {HashgraphProto.proto.ITokenRelationship[]}
     */
    _toProtobuf() {
        const list = [];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, relationship] of this) {
            list.push(relationship._toProtobuf());
        }

        return list;
    }
}
