import Query, { QUERY_REGISTRY } from "../query/Query";
import AccountId from "./AccountId";
import TransactionRecord from "../transaction/TransactionRecord";
import * as proto from "@hashgraph/proto";
import Channel from "../channel/Channel";

/**
 * Get all the records for an account for any transfers into it and out of it,
 * that were above the threshold, during the last 25 hours.
 *
 * @augments {Query<TransactionRecord[]>}
 */
export default class AccountRecordsQuery extends Query {
    /**
     * @param {object} props
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
     * @param {proto.Query} query
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
    getAccountId() {
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
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.crypto.getAccountRecords(query);
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
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            cryptoGetAccountRecords: {
                header,
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
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountRecordsQuery._fromProtobuf
);
