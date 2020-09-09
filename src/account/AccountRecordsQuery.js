import Query from "../Query";
import AccountId from "./AccountId";
import TransactionRecord from "../TransactionRecord";
import proto from "@hashgraph/proto";
import Channel from "../Channel";

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
     * @override
     * @param {proto.IResponse} response
     * @returns {TransactionRecord[]}
     */
    _mapResponse(response) {
        return (
            response.cryptoGetAccountRecords?.records?.map((record) =>
                TransactionRecord._fromProtobuf(record)
            ) ?? []
        );
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            cryptoGetAccountRecords: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                accountID: this._accountId?._toProtobuf(),
            },
        };
    }
}
