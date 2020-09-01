import Query from "../Query";
import AccountId from "./AccountId";
import TransactionRecord from "../TransactionRecord";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<TransactionRecord[]>}
 */
export default class AccountRecordQuery extends Query {
    /**
     * @param {object} properties
     * @param {(AccountId | string)=} properties.accountId
     */
    constructor(properties) {
        super();

        /**
         * @type {?AccountId}
         * @private
         */
        this._accountId = null;

        if (properties?.accountId != null) {
            this.setAccountId(properties?.accountId);
        }
    }

    /**
     * Set the account ID for which the record is being requested.
     *
     * @param {AccountId | string} accountId
     * @returns {AccountRecordQuery}
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
     * @param {proto.IResponse} response
     * @returns {TransactionRecord[]}
     */
    _mapResponse(response) {
        // @ts-ignore
        return response.cryptoGetAccountRecords.records.map((record) =>
            TransactionRecord._fromProtobuf(record)
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
            cryptoGetAccountRecords: {
                header: queryHeader,
                accountID: this._accountId?._toProtobuf(),
            },
        };
    }
}
