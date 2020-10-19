import Query, { QUERY_REGISTRY } from "../query/Query.js";
import TokenId from "./TokenId.js";
import TokenInfo from "./TokenInfo.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ITokenInfo} proto.ITokenInfo
 * @typedef {import("@hashgraph/proto").ITokenGetInfoQuery} proto.ITokenGetInfoQuery
 * @typedef {import("@hashgraph/proto").ITokenGetInfoResponse} proto.ITokenGetInfoResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<TokenInfo>}
 */
export default class TokenInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {TokenId | string} [properties.tokenId]
     */
    constructor(properties = {}) {
        super();

        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;
        if (properties.tokenId != null) {
            this.setTokenId(properties.tokenId);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {TokenInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {proto.ITokenGetInfoQuery} */ (query.tokenGetInfo);

        return new TokenInfoQuery({
            tokenId:
                info.token != null
                    ? TokenId._fromProtobuf(info.token)
                    : undefined,
        });
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * Set the token ID for which the info is being requested.
     *
     * @param {TokenId | string} tokenId
     * @returns {TokenInfoQuery}
     */
    setTokenId(tokenId) {
        this._tokenId =
            tokenId instanceof TokenId ? tokenId : TokenId.fromString(tokenId);

        return this;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.token.getTokenInfo(request);
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const tokenGetInfo = /** @type {proto.ITokenGetInfoResponse} */ (response.tokenGetInfo);
        return /** @type {proto.IResponseHeader} */ (tokenGetInfo.header);
    }

    /**
     * @override
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {Promise<TokenInfo>}
     */
    _mapResponse(response) {
        const info = /** @type {proto.ITokenGetInfoResponse} */ (response.tokenGetInfo);

        return Promise.resolve(
            TokenInfo._fromProtobuf(
                /** @type {proto.ITokenInfo} */ (info.tokenInfo)
            )
        );
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            tokenGetInfo: {
                header,
                token:
                    this._tokenId != null ? this._tokenId._toProtobuf() : null,
            },
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("tokenGetInfo", TokenInfoQuery._fromProtobuf);
