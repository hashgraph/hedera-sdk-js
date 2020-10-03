import Query, { QUERY_REGISTRY } from "../query/Query.js";
import ContractId from "./ContractId.js";
import TransactionRecord from "../transaction/TransactionRecord.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").IContractGetRecordsQuery} proto.IContractGetRecordsQuery
 * @typedef {import("@hashgraph/proto").IContractGetRecordsResponse} proto.IContractGetRecordsResponse
 * @typedef {import("@hashgraph/proto").ITransactionRecord} proto.ITransactionRecord
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<TransactionRecord[]>}
 */
export default class ContractRecordsQuery extends Query {
    /**
     * @param {object} props
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
    get contractId() {
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
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.smartContract.getTxRecordByContractID(request);
    }

    /**
     * @override
     * @internal
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
     * @returns {Promise<TransactionRecord[]>}
     */
    _mapResponse(response) {
        const contractGetRecordResponse = /** @type {proto.IContractGetRecordsResponse} */ (response.contractGetRecordsResponse);
        const records = /** @type {proto.ITransactionRecord[]} */ (contractGetRecordResponse.records);

        return Promise.resolve(
            records.map((record) => TransactionRecord._fromProtobuf(record))
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractRecordsQuery._fromProtobuf
);
