import TokenId from "./TokenId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import AccountId from "../account/AccountId.js";
import Timestamp from "../Timestamp.js";
import Duration from "../Duration.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ITokenUpdateTransactionBody} proto.ITokenUpdateTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * Update a new Hedera™ crypto-currency token.
 */
export default class TokenUpdateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {TokenId | string} [props.tokenId]
     * @param {string} [props.name]
     * @param {string} [props.symbol]
     * @param {AccountId | string} [props.treasury]
     * @param {Key} [props.adminKey]
     * @param {Key} [props.kycKey]
     * @param {Key} [props.freezeKey]
     * @param {Key} [props.wipeKey]
     * @param {Key} [props.supplyKey]
     * @param {AccountId | string} [props.autoRenewAccount]
     * @param {Timestamp | Date} [props.expirationTime]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;

        /**
         * @private
         * @type {?string}
         */
        this._name = null;

        /**
         * @private
         * @type {?string}
         */
        this._symbol = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._treasury = null;

        /**
         * @private
         * @type {?Key}
         */
        this._adminKey = null;

        /**
         * @private
         * @type {?Key}
         */
        this._kycKey = null;

        /**
         * @private
         * @type {?Key}
         */
        this._freezeKey = null;

        /**
         * @private
         * @type {?Key}
         */
        this._wipeKey = null;

        /**
         * @private
         * @type {?Key}
         */
        this._supplyKey = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._autoRenewAccount = null;

        /**
         * @private
         * @type {?Timestamp}
         */
        this._expirationTime = null;

        /**
         * @private
         * @type {?Duration}
         */
        this._autoRenewPeriod = null;

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }

        if (props.name != null) {
            this.setName(props.name);
        }

        if (props.symbol != null) {
            this.setSymbol(props.symbol);
        }

        if (props.treasury != null) {
            this.setTreasury(props.treasury);
        }

        if (props.adminKey != null) {
            this.setAdminKey(props.adminKey);
        }

        if (props.kycKey != null) {
            this.setKycKey(props.kycKey);
        }

        if (props.freezeKey != null) {
            this.setFreezeKey(props.freezeKey);
        }

        if (props.wipeKey != null) {
            this.setWipeKey(props.wipeKey);
        }

        if (props.supplyKey != null) {
            this.setsupplyKey(props.supplyKey);
        }

        if (props.autoRenewAccount != null) {
            this.setAutoRenewAccount(props.autoRenewAccount);
        }

        if (props.expirationTime != null) {
            this.setExpirationTime(props.expirationTime);
        }

        if (props.autoRenewPeriod != null) {
            this.setAutoRenewPeriod(props.autoRenewPeriod);
        }
    }

    /**
     * @internal
     * @param {proto.ITransactionBody} body
     * @returns {TokenUpdateTransaction}
     */
    static _fromProtobuf(body) {
        const update = /** @type {proto.ITokenUpdateTransactionBody} */ (body.tokenCreation);

        return new TokenUpdateTransaction({
            tokenId:
                update.token != null
                    ? TokenId._fromProtobuf(update.token)
                    : undefined,
            name: update.name != null ? update.name : undefined,
            symbol: update.symbol != null ? update.symbol : undefined,
            treasury:
                update.treasury != null
                    ? AccountId._fromProtobuf(update.treasury)
                    : undefined,
            adminKey:
                update.adminKey != null
                    ? keyFromProtobuf(update.adminKey)
                    : undefined,
            kycKey:
                update.kycKey != null
                    ? keyFromProtobuf(update.kycKey)
                    : undefined,
            freezeKey:
                update.freezeKey != null
                    ? keyFromProtobuf(update.freezeKey)
                    : undefined,
            wipeKey:
                update.wipeKey != null
                    ? keyFromProtobuf(update.wipeKey)
                    : undefined,
            supplyKey:
                update.supplyKey != null
                    ? keyFromProtobuf(update.supplyKey)
                    : undefined,
            autoRenewAccount:
                update.autoRenewAccount != null
                    ? AccountId._fromProtobuf(update.autoRenewAccount)
                    : undefined,
            expirationTime:
                update.expiry != null
                    ? new Timestamp(update.expiry, 0)
                    : undefined,
            autoRenewPeriod:
                update.autoRenewPeriod != null
                    ? update.autoRenewPeriod
                    : undefined,
        });
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * @param {TokenId | string} tokenId
     * @returns {this}
     */
    setTokenId(tokenId) {
        this._requireNotFrozen();
        this._tokenId =
            tokenId instanceof TokenId ? tokenId : TokenId.fromString(tokenId);

        return this;
    }

    /**
     * @returns {?string}
     */
    get name() {
        return this._name;
    }

    /**
     * @param {string} name
     * @returns {this}
     */
    setName(name) {
        this._requireNotFrozen();
        this._name = name;

        return this;
    }

    /**
     * @returns {?string}
     */
    get symbol() {
        return this._symbol;
    }

    /**
     * @param {string} symbol
     * @returns {this}
     */
    setSymbol(symbol) {
        this._requireNotFrozen();
        this._symbol = symbol;

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get treasury() {
        return this._treasury;
    }

    /**
     * @param {AccountId | string} id
     * @returns {this}
     */
    setTreasury(id) {
        this._requireNotFrozen();
        this._treasury =
            id instanceof AccountId ? id : AccountId.fromString(id);

        return this;
    }

    /**
     * @returns {?Key}
     */
    get adminKey() {
        return this._adminKey;
    }

    /**
     * @param {Key} key
     * @returns {this}
     */
    setAdminKey(key) {
        this._requireNotFrozen();
        this._adminKey = key;

        return this;
    }

    /**
     * @returns {?Key}
     */
    get kycKey() {
        return this._kycKey;
    }

    /**
     * @param {Key} key
     * @returns {this}
     */
    setKycKey(key) {
        this._requireNotFrozen();
        this._kycKey = key;

        return this;
    }

    /**
     * @returns {?Key}
     */
    get freezeKey() {
        return this._freezeKey;
    }

    /**
     * @param {Key} key
     * @returns {this}
     */
    setFreezeKey(key) {
        this._requireNotFrozen();
        this._freezeKey = key;

        return this;
    }

    /**
     * @returns {?Key}
     */
    get wipeKey() {
        return this._wipeKey;
    }

    /**
     * @param {Key} key
     * @returns {this}
     */
    setWipeKey(key) {
        this._requireNotFrozen();
        this._wipeKey = key;

        return this;
    }

    /**
     * @returns {?Key}
     */
    get supplyKey() {
        return this._supplyKey;
    }

    /**
     * @param {Key} key
     * @returns {this}
     */
    setsupplyKey(key) {
        this._requireNotFrozen();
        this._supplyKey = key;

        return this;
    }

    /**
     * @returns {?Timestamp}
     */
    get expirationTime() {
        return this._expirationTime;
    }

    /**
     * @param {Timestamp | Date} time
     * @returns {this}
     */
    setExpirationTime(time) {
        this._requireNotFrozen();
        this._expirationTime =
            time instanceof Timestamp ? time : Timestamp.fromDate(time);

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get autoRenewAccount() {
        return this._autoRenewAccount;
    }

    /**
     * @param {AccountId | string} id
     * @returns {this}
     */
    setAutoRenewAccount(id) {
        this._requireNotFrozen();
        this._autoRenewAccount =
            id instanceof AccountId ? id : AccountId.fromString(id);

        return this;
    }

    /**
     * @returns {?Duration}
     */
    get autoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * Set the auto renew period for this token.
     *
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._requireNotFrozen();
        this._autoRenewPeriod =
            autoRenewPeriod instanceof Duration
                ? autoRenewPeriod
                : new Duration(autoRenewPeriod);

        return this;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.token.updateToken(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenUpdate";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ITokenUpdateTransactionBody}
     */
    _makeTransactionData() {
        return {
            token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
            name: this.name,
            symbol: this.symbol,
            treasury:
                this._treasury != null ? this._treasury._toProtobuf() : null,
            adminKey:
                this._adminKey != null ? keyToProtobuf(this._adminKey) : null,
            kycKey: this._kycKey != null ? keyToProtobuf(this._kycKey) : null,
            freezeKey:
                this._freezeKey != null ? keyToProtobuf(this._freezeKey) : null,
            wipeKey:
                this._wipeKey != null ? keyToProtobuf(this._wipeKey) : null,
            supplyKey:
                this._supplyKey != null ? keyToProtobuf(this._supplyKey) : null,
            autoRenewAccount:
                this._autoRenewAccount != null
                    ? this._autoRenewAccount._toProtobuf()
                    : null,
            expiry:
                this._expirationTime != null
                    ? this._expirationTime.seconds
                    : null,
            autoRenewPeriod:
                this._autoRenewPeriod != null
                    ? this._autoRenewPeriod.seconds
                    : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "tokenUpdate",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenUpdateTransaction._fromProtobuf
);
