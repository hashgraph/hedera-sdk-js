import Query from "../Query";
import ContractId from "./ContractId";
import TransactionRecord from "../TransactionRecord";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<TransactionRecord[]>}
 */
export default class ContractRecordQuery extends Query {
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
     * @returns {?ContractId}
     */
    getContractId() {
        return this._contractId;
    }

    /**
     * Set the contract ID for which the record is being requested.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractRecordQuery}
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
     * @returns {TransactionRecord[]}
     */
    _mapResponse(response) {
        return (
            response.contractGetRecordsResponse?.records ?? []
        ).map((record) => TransactionRecord._fromProtobuf(record));
    }

    /**
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            ContractGetRecords: {
                header: queryHeader,
                contractID: this._contractId?._toProtobuf(),
            },
        };
    }
}
