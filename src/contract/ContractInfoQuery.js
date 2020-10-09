import Query, { QUERY_REGISTRY } from "../query/Query.js";
import ContractId from "./ContractId.js";
import ContractInfo from "./ContractInfo.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").IContractGetInfoQuery} proto.IContractGetInfoQuery
 * @typedef {import("@hashgraph/proto").IContractGetInfoResponse} proto.IContractGetInfoResponse
 * @typedef {import("@hashgraph/proto").IContractInfo} proto.IContractInfo
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
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
     * @param {proto.IQuery} query
     * @returns {ContractInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {proto.IContractGetInfoQuery} */ (query.contractGetInfo);

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
            contractId instanceof ContractId
                ? contractId
                : ContractId.fromString(contractId);

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
        return channel.smartContract.getContractInfo(request);
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const contractGetInfo = /** @type {proto.IContractGetInfoResponse} */ (response.contractGetInfo);
        return /** @type {proto.IResponseHeader} */ (contractGetInfo.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<ContractInfo>}
     */
    _mapResponse(response) {
        const info = /** @type {proto.IContractGetInfoResponse} */ (response.contractGetInfo);

        return Promise.resolve(
            ContractInfo._fromProtobuf(
                /** @type {proto.IContractInfo} */ (info.contractInfo)
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
            contractGetInfo: {
                header,
                contractID:
                    this._contractId != null
                        ? this._contractId._toProtobuf()
                        : null,
            },
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("contractGetInfo", ContractInfoQuery._fromProtobuf);
