import Query, { QUERY_REGISTRY } from "../query/Query.js";
import NftId from "./NftId.js";
import AccountId from "../account/AccountId.js";
import TokenId from "../token/TokenId.js";
import TokenNftInfo from "./TokenNftInfo.js";
import Hbar from "../Hbar.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").ITokenNftInfo} proto.ITokenNftInfo
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ITokenGetNftInfoQuery} proto.ITokenGetNftInfoQuery
 * @typedef {import("@hashgraph/proto").ITokenGetNftInfosQuery} proto.ITokenGetNftInfosQuery
 * @typedef {import("@hashgraph/proto").ITokenGetAccountNftInfosQuery} proto.ITokenGetAccountNftInfosQuery
 * @typedef {import("@hashgraph/proto").ITokenGetNftInfoResponse} proto.ITokenGetNftInfoResponse
 * @typedef {import("@hashgraph/proto").ITokenGetNftInfosResponse} proto.ITokenGetNftInfosResponse
 * @typedef {import("@hashgraph/proto").ITokenGetAccountNftInfosResponse} proto.ITokenGetAccountNftInfosResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<TokenNftInfo[]>}
 */
export default class TokenNftInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {NftId | string} [properties.nftId]
     * @param {AccountId | string} [properties.accountId]
     * @param {TokenId | string} [properties.tokenId]
     * @param {Long | number} [properties.start]
     * @param {Long | number} [properties.end]
     */
    constructor(properties = {}) {
        super();

        /**
         * @private
         * @type {?NftId}
         */
        this._nftId = null;
        if (properties.nftId != null) {
            this.setNftId(properties.nftId);
        }

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;
        if (properties.accountId != null) {
            this.setAccountId(properties.accountId);
        }

        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;
        if (properties.tokenId != null) {
            this.setTokenId(properties.tokenId);
        }

        /**
         * @private
         * @type {?Long}
         */
        this._start = null;
        if (properties.start != null) {
            this.setStart(properties.start);
        }

        /**
         * @private
         * @type {?Long}
         */
        this._end = null;
        if (properties.end != null) {
            this.setEnd(properties.end);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @param {(string | null)=} ledgerId
     * @returns {TokenNftInfoQuery}
     */
    static _fromProtobuf(query, ledgerId) {
        if (query.tokenGetNftInfo != null) {
            const info = /** @type {proto.ITokenGetNftInfoQuery} */ (
                query.tokenGetNftInfo
            );

            return new TokenNftInfoQuery({
                nftId:
                    info.nftID != null
                        ? NftId._fromProtobuf(info.nftID, ledgerId)
                        : undefined,
            });
        } else if (query.tokenGetAccountNftInfos != null) {
            const info = /** @type {proto.ITokenGetAccountNftInfosQuery} */ (
                query.tokenGetAccountNftInfos
            );

            return new TokenNftInfoQuery({
                accountId:
                    info.accountID != null
                        ? AccountId._fromProtobuf(info.accountID, ledgerId)
                        : undefined,
                start: info.start != null ? info.start : undefined,
                end: info.end != null ? info.end : undefined,
            });
        } else {
            const info = /** @type {proto.ITokenGetNftInfosQuery} */ (
                query.tokenGetNftInfos
            );

            return new TokenNftInfoQuery({
                tokenId:
                    info.tokenID != null
                        ? TokenId._fromProtobuf(info.tokenID, ledgerId)
                        : undefined,
                start: info.start != null ? info.start : undefined,
                end: info.end != null ? info.end : undefined,
            });
        }
    }

    /**
     * @returns {?NftId}
     */
    get nftId() {
        return this._nftId;
    }

    /**
     * Set the token ID for which the info is being requested.
     *
     * @param {NftId | string} nftId
     * @returns {TokenNftInfoQuery}
     */
    setNftId(nftId) {
        this._nftId =
            typeof nftId === "string"
                ? NftId.fromString(nftId)
                : NftId._fromProtobuf(nftId._toProtobuf());

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * Set the token ID for which the info is being requested.
     *
     * @param {AccountId | string} accountId
     * @returns {TokenNftInfoQuery}
     */
    setAccountId(accountId) {
        this._accountId =
            typeof accountId === "string"
                ? AccountId.fromString(accountId)
                : AccountId._fromProtobuf(accountId._toProtobuf());

        return this;
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
     * @returns {TokenNftInfoQuery}
     */
    setTokenId(tokenId) {
        this._tokenId =
            typeof tokenId === "string"
                ? TokenId.fromString(tokenId)
                : TokenId._fromProtobuf(tokenId._toProtobuf());

        return this;
    }

    /**
     * @returns {?Long}
     */
    get start() {
        return this._start;
    }

    /**
     * Set the token ID for which the info is being requested.
     *
     * @param {Long | number} start
     * @returns {TokenNftInfoQuery}
     */
    setStart(start) {
        this._start =
            typeof start === "number" ? Long.fromNumber(start) : start;

        return this;
    }

    /**
     * @returns {?Long}
     */
    get end() {
        return this._end;
    }

    /**
     * Set the token ID for which the info is being requested.
     *
     * @param {Long | number} end
     * @returns {TokenNftInfoQuery}
     */
    setEnd(end) {
        this._end = typeof end === "number" ? Long.fromNumber(end) : end;

        return this;
    }

    /**
     * @override
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @returns {Promise<Hbar>}
     */
    async getCost(client) {
        let cost = await super.getCost(client);

        if (cost.toTinybars().greaterThan(25)) {
            return cost;
        } else {
            return Hbar.fromTinybars(25);
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        if (this._nftId != null) {
            return channel.token.getTokenNftInfo(request);
        } else if (this._accountId != null) {
            return channel.token.getAccountNftInfos(request);
        } else {
            return channel.token.getTokenNftInfos(request);
        }
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        let infos;
        if (this._nftId != null) {
            infos = /** @type {proto.ITokenGetNftInfoResponse} */ (
                response.tokenGetNftInfo
            );
        } else if (this._accountId != null) {
            infos = /** @type {proto.ITokenGetAccountNftInfosResponse} */ (
                response.tokenGetAccountNftInfos
            );
        } else {
            infos = /** @type {proto.ITokenGetNftInfosResponse} */ (
                response.tokenGetNftInfos
            );
        }

        return /** @type {proto.IResponseHeader} */ (infos.header);
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {proto.IQuery} request
     * @param {string | null} ledgerId
     * @returns {Promise<TokenNftInfo[]>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request, ledgerId) {
        let nfts = [];
        /** @type {proto.ITokenGetNftInfoResponse} */ (
            response.tokenGetNftInfo
        );

        if (this._nftId != null) {
            nfts = [
                /** @type {proto.ITokenNftInfo} */
                (
                    /** @type {proto.ITokenGetNftInfoResponse} */ (
                        response.tokenGetNftInfo
                    ).nft
                ),
            ];
        } else if (this._accountId != null) {
            nfts =
                /** @type {proto.ITokenNftInfo[]} */
                (
                    /** @type {proto.ITokenGetAccountNftInfosResponse} */ (
                        response.tokenGetAccountNftInfos
                    ).nfts
                );
        } else {
            nfts =
                /** @type {proto.ITokenNftInfo[]} */
                (
                    /** @type {proto.ITokenGetNftInfosResponse} */ (
                        response.tokenGetNftInfos
                    ).nfts
                );
        }

        return Promise.resolve(
            nfts.map((nft) =>
                TokenNftInfo._fromProtobuf(
                    /** @type {proto.ITokenNftInfo} */ (nft),
                    ledgerId
                )
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
        if (this._nftId != null) {
            return {
                tokenGetNftInfo: {
                    header,
                    nftID:
                        this._nftId != null ? this._nftId._toProtobuf() : null,
                },
            };
        } else if (this._accountId != null) {
            return {
                tokenGetAccountNftInfos: {
                    header,
                    accountID:
                        this._accountId != null
                            ? this._accountId._toProtobuf()
                            : null,
                    start: this._start,
                    end: this._end,
                },
            };
        } else {
            return {
                tokenGetNftInfos: {
                    header,
                    tokenID:
                        this._tokenId != null
                            ? this._tokenId._toProtobuf()
                            : null,
                    start: this._start,
                    end: this._end,
                },
            };
        }
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("tokenGetNftInfo", TokenNftInfoQuery._fromProtobuf);
