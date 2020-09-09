import Query from "../Query";
import ContractId from "./ContractId";
import TransactionRecord from "../TransactionRecord";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<TransactionRecord[]>}
 */
export default class ContractRecordsQuery extends Query {
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
     * @internal
     * @param {proto.Query} query
     * @returns {ContractRecordsQuery}
     */
    static _fromProtobuf(query) {
        const records = /** @type {proto.IContractGetRecordsQuery} */ (query.ContractGetRecords);

        return new ContractRecordsQuery({
            contractId:
                records.contractID != null
                    ? ContractId._fromProtobuf(records.contractID)
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
     * Set the contract ID for which the record is being requested.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractRecordsQuery}
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
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            ContractGetRecords: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                contractID: this._contractId?._toProtobuf(),
            },
        };
    }
}
