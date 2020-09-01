import Query from "../Query";
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
    constructor(properties) {
        super();

        /**
         * @type {?ContractId}
         * @private
         */
        this._contractId = null;
        if (properties?.contractId != null) {
            this.setContractId(properties?.contractId);
        }
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
     * @override
     * @param {proto.IResponse} response
     * @returns {ContractInfo}
     */
    _mapResponse(response) {
        return ContractInfo._fromProtobuf(
            // @ts-ignore
            response.contractGetInfo.contractInfo
        );
    }

    /**
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            contractGetInfo: {
                header: queryHeader,
                contractID: this._contractId?._toProtobuf(),
            },
        };
    }
}
