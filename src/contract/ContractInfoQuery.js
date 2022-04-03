import Query, { QUERY_REGISTRY } from "../query/Query.js";
import ContractId from "./ContractId.js";
import ContractInfo from "./ContractInfo.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HashgraphProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HashgraphProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HashgraphProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HashgraphProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.IContractGetInfoQuery} HashgraphProto.proto.IContractGetInfoQuery
 * @typedef {import("@hashgraph/proto").proto.IContractGetInfoResponse} HashgraphProto.proto.IContractGetInfoResponse
 * @typedef {import("@hashgraph/proto").proto.ContractGetInfoResponse.IContractInfo} HashgraphProto.proto.ContractGetInfoResponse.IContractInfo
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * @augments {Query<ContractInfo>}
 */
export default class ContractInfoQuery extends Query {
    /**
     * @param {object} [props]
     * @param {ContractId | string} [props.contractId]
     */
    constructor(props = {}) {
        super();

        /**
         * @type {?ContractId}
         * @private
         */
        this._contractId = null;
        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {ContractInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {HashgraphProto.proto.IContractGetInfoQuery} */ (
            query.contractGetInfo
        );

        return new ContractInfoQuery({
            contractId:
                info.contractID != null
                    ? ContractId._fromProtobuf(info.contractID)
                    : undefined,
        });
    }

    /**
     * @returns {?ContractId}
     */
    get contractId() {
        return this._contractId;
    }

    /**
     * Set the contract ID for which the info is being requested.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractInfoQuery}
     */
    setContractId(contractId) {
        this._contractId =
            typeof contractId === "string"
                ? ContractId.fromString(contractId)
                : contractId.clone();

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._contractId != null) {
            this._contractId.validateChecksum(client);
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<HashgraphProto.proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.smartContract.getContractInfo(request);
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
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const contractGetInfo =
            /** @type {HashgraphProto.proto.IContractGetInfoResponse} */ (
                response.contractGetInfo
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            contractGetInfo.header
        );
    }

    /**
     * @protected
     * @override
     * @param {HashgraphProto.proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<ContractInfo>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        const info =
            /** @type {HashgraphProto.proto.IContractGetInfoResponse} */ (
                response.contractGetInfo
            );

        return Promise.resolve(
            ContractInfo._fromProtobuf(
                /** @type {HashgraphProto.proto.ContractGetInfoResponse.IContractInfo} */ (
                    info.contractInfo
                )
            )
        );
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQueryHeader} header
     * @returns {HashgraphProto.proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            contractGetInfo: {
                header,
                contractID:
                    this._contractId != null
                        ? this._contractId._toProtobuf()
                        : null,
            },
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp =
            this._paymentTransactionId != null &&
            this._paymentTransactionId.validStart != null
                ? this._paymentTransactionId.validStart
                : this._timestamp;

        return `ContractInfoQuery:${timestamp.toString()}`;
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("contractGetInfo", ContractInfoQuery._fromProtobuf);
