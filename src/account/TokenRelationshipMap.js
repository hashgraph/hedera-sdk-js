import TokenId from "../token/TokenId.js";
import TokenRelationship from "./TokenRelationship.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenRelationship} proto.ITokenRelationship
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("long")} Long
 */

export default class TokenRelationshipMap {
    /**
     * @param {Map<string, TokenRelationship>} relationships
     */
    constructor(relationships) {
        this._relationships = relationships;
    }

    /**
     * @param {TokenId} tokenId
     * @returns {?TokenRelationship}
     */
    get(tokenId) {
        const token = new TokenId(tokenId).toString();
        return this._relationships.get(token) || null;
    }

    /**
     * @returns {IterableIterator<TokenRelationship>}
     */
    values() {
        return this._relationships.values();
    }

    /**
     * @returns {IterableIterator<TokenId>}
     */
    keys() {
        const keys = [];
        for (const key of this._relationships.keys()) {
            keys.push(TokenId.fromString(key));
        }
        return keys[Symbol.iterator]();
    }

    /**
     * @returns {IterableIterator<[TokenId, TokenRelationship]>}
     */
    [Symbol.iterator]() {
        /**
         * @type {Map<TokenId, TokenRelationship>}
         */
        const map = new Map();

        for (const [key, value] of this._relationships) {
            map.set(TokenId.fromString(key), value);
        }

        return /**@type {IterableIterator<[TokenId, TokenRelationship]>} */ (map[
            Symbol.iterator
        ]());
    }

    /**
     * @param {proto.ITokenRelationship[]} relationships
     * @returns {TokenRelationshipMap}
     */
    static _fromProtobuf(relationships) {
        const tokenRelationships = new Map();

        for (const relationship of relationships) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (relationship.tokenId)
            );

            tokenRelationships.set(
                tokenId.toString(),
                TokenRelationship._fromProtobuf(relationship)
            );
        }

        return new TokenRelationshipMap(tokenRelationships);
    }
}
