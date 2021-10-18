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
     * @returns {TokenRelationshipMap}
     */
    static _fromProtobuf(relationships) {
        const tokenRelationships = new TokenRelationshipMap();

        for (const relationship of relationships) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (relationship.tokenId)
            );

            tokenRelationships._set(
                tokenId,
                TokenRelationship._fromProtobuf(relationship)
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
    
    /**
     * @returns {string}
     */
     toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @param {string} objectMap
     * @returns {TokenRelationshipMap}
     */
    static fromString(objectMap){
        return this.fromJSON(JSON.parse(objectMap));
    }

    /**
     * @returns {object}
     */
    toJSON(){
        /** @type {Object.<string, string>} */
        const map = {};

        for (const [key, value] of this._map) {
            map[key] = value.toString();
        }

        return map;
    }

    /**
     * @param {any} objectMap
     * @returns {TokenRelationshipMap}
     */
    static fromJSON(objectMap){
        const tokenRelationshipMap = new TokenRelationshipMap();

        for (var key in objectMap){
            if (objectMap.hasOwnProperty(key)){
                tokenRelationshipMap._set(TokenId.fromString(key),TokenRelationship.fromString(objectMap[key]));
            }
        }
        return tokenRelationshipMap;
    }
}
