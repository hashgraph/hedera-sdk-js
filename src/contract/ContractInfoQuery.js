import Query, { QUERY_REGISTRY } from "../Query";
import ContractId from "./ContractId";
import ContractInfo from "./ContractInfo";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<ContractInfo>}
 */
export default class ContractInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {ContractId | string} [properties.contractId]
     */
    constructor(properties = {}) {
        super();

        /**
         * @type {?ContractId}
         * @private
         */
        this._contractId = null;
        if (properties.contractId != null) {
            this.setContractId(properties.contractId);
        }
    }

    /**
     * @internal
     * @param {proto.Query} query
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
    getContractId() {
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
     * @protected
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
     * @returns {ContractInfo}
     */
    _mapResponse(response) {
        const info = /** @type {proto.IContractGetInfoResponse} */ (response.contractGetInfo);

        return ContractInfo._fromProtobuf(
            /** @type {proto.ContractGetInfoResponse.IContractInfo} */ (info.contractInfo)
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

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("contractGetInfo", ContractInfoQuery._fromProtobuf);
