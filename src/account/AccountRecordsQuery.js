import Query, { QUERY_REGISTRY } from "../query/Query";
import AccountId from "./AccountId";
import TransactionRecord from "../transaction/TransactionRecord";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ICryptoGetAccountRecordsQuery} proto.ICryptoGetAccountRecordsQuery
 * @typedef {import("@hashgraph/proto").ICryptoGetAccountRecordsResponse} proto.ICryptoGetAccountRecordsResponse
 * @typedef {import("@hashgraph/proto").ITransactionRecord} proto.ITransactionRecord
 */

/**
 * @typedef {import("../channel/Channel").default} Channel
 */

/**
 * Get all the records for an account for any transfers into it and out of it,
 * that were above the threshold, during the last 25 hours.
 *
 * @augments {Query<TransactionRecord[]>}
 */
export default class AccountRecordsQuery extends Query {
    /**
     * @param {object} [props]
     * @param {AccountId | string} [props.accountId]
     */
    constructor(props = {}) {
        super();

        /**
         * @type {?AccountId}
         * @private
         */
        this._accountId = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {AccountRecordsQuery}
     */
    static _fromProtobuf(query) {
        const records = /** @type {proto.ICryptoGetAccountRecordsQuery} */ (query.cryptoGetAccountRecords);

        return new AccountRecordsQuery({
            accountId:
                records.accountID != null
                    ? AccountId._fromProtobuf(records.accountID)
                    : undefined,
        });
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * Set the account ID for which the records are being requested.
     *
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId) {
        this._accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.getAccountRecords(request);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const cryptoGetAccountRecords = /** @type {proto.ICryptoGetAccountRecordsResponse} */ (response.cryptoGetAccountRecords);
        return /** @type {proto.IResponseHeader} */ (cryptoGetAccountRecords.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<TransactionRecord[]>}
     */
    _mapResponse(response) {
        const cryptoGetAccountRecords = /** @type {proto.ICryptoGetAccountRecordsResponse} */ (response.cryptoGetAccountRecords);
        const records = /** @type {proto.ITransactionRecord[]} */ (cryptoGetAccountRecords.records);

        return Promise.resolve(
            records.map((record) => TransactionRecord._fromProtobuf(record))
        );
    }

    /**
     * @override
     * @internal
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            cryptoGetAccountRecords: {
                header: this._makeRequestHeader(),
                accountID:
                    this._accountId != null
                        ? this._accountId._toProtobuf()
                        : null,
            },
        };
    }
}

QUERY_REGISTRY.set(
    "cryptoGetAccountRecords",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountRecordsQuery._fromProtobuf
);
