import NftId from "./NftId.js";
import TokenId from "./TokenId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.TokenReference} HashgraphProto.proto.TokenReference
 */

export default class TokenReference {
    constructor() {
        /**
         * @public
         * @type {?TokenId}
         */
        this.fungibleToken = null;
        /**
         * @public
         * @type {?NftId}
         */
        this.nft = null;
        /**
         * @public
         * @type {?"fungibleToken"|"nft"}
         */
        this.tokenIdentifier = null;
    }

    /**
     * @public
     * @param {HashgraphProto.proto.TokenReference} reference
     * @returns {TokenReference}
     */
    static _fromProtobuf(reference) {
        /**
         * @type {"fungibleToken"|"nft"|null}
         */
        let tokenIdentifier;

        if (reference.fungibleToken) {
            tokenIdentifier = "fungibleToken";
        } else {
            tokenIdentifier = "nft";
        }
        return {
            fungibleToken:
                reference.fungibleToken != undefined
                    ? TokenId._fromProtobuf(reference.fungibleToken)
                    : null,
            nft:
                reference.nft != undefined
                    ? NftId._fromProtobuf(reference.nft)
                    : null,

            tokenIdentifier,
        };
    }
}
