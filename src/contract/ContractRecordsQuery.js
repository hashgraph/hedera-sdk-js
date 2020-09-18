import Query, { QUERY_REGISTRY } from "../Query";
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
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const contractGetRecordsResponse = /** @type {proto.IContractGetRecordsResponse} */ (response.contractGetRecordsResponse);
        return /** @type {proto.IResponseHeader} */ (contractGetRecordsResponse.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {TransactionRecord[]}
     */
    _mapResponse(response) {
        const contractGetRecordResponse = /** @type {proto.IContractGetRecordsResponse} */ (response.contractGetRecordsResponse);
        const records = /** @type {proto.ITransactionRecord[]} */ (contractGetRecordResponse.records);
        return records.map((record) => TransactionRecord._fromProtobuf(record));
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            ContractGetRecords: {
                header,
                contractID:
                    this._contractId != null
                        ? this._contractId._toProtobuf()
                        : null,
            },
        };
    }
}

QUERY_REGISTRY.set(
    "ContractGetRecords",
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractRecordsQuery._fromProtobuf
);
