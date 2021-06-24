import TokenId from "../token/TokenId.js";
import TokenRelationship from "./TokenRelationship.js";
import ObjectMap from "../ObjectMap.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenRelationship} proto.ITokenRelationship
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
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
     * @param {proto.ITokenRelationship[]} relationships
     * @param {(string | null)=} ledgerId
     * @returns {TokenRelationshipMap}
     */
    static _fromProtobuf(relationships, ledgerId) {
        const tokenRelationships = new TokenRelationshipMap();

        for (const relationship of relationships) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (relationship.tokenId),
                ledgerId
            );

            tokenRelationships._set(
                tokenId,
                TokenRelationship._fromProtobuf(relationship, ledgerId)
            );
        }

        return tokenRelationships;
    }

    /**
     * @returns {proto.ITokenRelationship[]}
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
