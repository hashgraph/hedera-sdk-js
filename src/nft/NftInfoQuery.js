import Query, { QUERY_REGISTRY } from "../query/Query.js";
import NftId from "./NftId.js";
import TokenInfo from "./TokenNftInfo.js";
import Hbar from "../Hbar.js";
import TokenNftInfo from "./TokenNftInfo.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").ITokenNftInfo} proto.ITokenNftInfo
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ITokenGetNftInfoQuery} proto.ITokenGetNftInfoQuery
 * @typedef {import("@hashgraph/proto").ITokenGetNftInfoResponse} proto.ITokenGetNftInfoResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<TokenInfo>}
 */
export default class NftInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {NftId | string} [properties.nftId]
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
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {NftInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {proto.ITokenGetNftInfoQuery} */ (
            query.tokenGetNftInfo
        );

        return new NftInfoQuery({
            nftId:
                info.nftID != null
                    ? NftId._fromProtobuf(info.nftID)
                    : undefined,
        });
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
     * @returns {NftInfoQuery}
     */
    setNftId(nftId) {
        this._nftId =
            typeof nftId === "string"
                ? NftId.fromString(nftId)
                : NftId._fromProtobuf(nftId._toProtobuf());

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
        return channel.token.getTokenNftInfo(request);
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const tokenGetNftInfo = /** @type {proto.ITokenGetNftInfoResponse} */ (
            response.tokenGetNftInfo
        );
        return /** @type {proto.IResponseHeader} */ (tokenGetNftInfo.header);
    }

    /**
     * @override
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {Promise<TokenInfo>}
     */
    _mapResponse(response) {
        const info = /** @type {proto.ITokenGetNftInfoResponse} */ (
            response.tokenGetNftInfo
        );

        return Promise.resolve(
            TokenNftInfo._fromProtobuf(
                /** @type {proto.ITokenNftInfo} */ (info.nft)
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
            tokenGetNftInfo: {
                header,
                nftID:
                    this._nftId != null ? this._nftId._toProtobuf() : null,
            },
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("tokenGetNftInfo", NftInfoQuery._fromProtobuf);
