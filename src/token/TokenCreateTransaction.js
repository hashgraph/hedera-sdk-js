import Transaction, {
    DEFAULT_AUTO_RENEW_PERIOD,
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import Long from "long";
import AccountId from "../account/AccountId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ITokenCreateTransactionBody} proto.ITokenCreateTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * Create a new Hedera™ crypto-currency token.
 */
export default class TokenCreateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {string} [props.name]
     * @param {string} [props.symbol]
     * @param {Long | number} [props.decimals]
     * @param {Long | number} [props.initialSupply]
     * @param {AccountId | string} [props.treasury]
     * @param {Key} [props.adminKey]
     * @param {Key} [props.kycKey]
     * @param {Key} [props.freezeKey]
     * @param {Key} [props.wipeKey]
     * @param {Key} [props.supplyKey]
     * @param {boolean} [props.freezeDefault]
     * @param {AccountId | string} [props.autoRenewAccount]
     * @param {Long | number} [props.expirationTime]
     * @param {Long | number} [props.autoRenewPeriod]
     */
    constructor(props = {}) {
        super();

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
         * @type {?Long}
         */
        this._decimals = null;

        /**
         * @private
         * @type {?Long}
         */
        this._initialSupply = null;

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
         * @type {?boolean}
         */
        this._freezeDefault = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._autoRenewAccount = null;

        /**
         * @private
         * @type {?Long}
         */
        this._expirationTime = null;

        /**
         * @private
         * @type {Long}
         */
        this._autoRenewPeriod = DEFAULT_AUTO_RENEW_PERIOD;

        if (props.name != null) {
            this.setName(props.name);
        }

        if (props.symbol != null) {
            this.setSymbol(props.symbol);
        }

        if (props.decimals != null) {
            this.setDecimals(props.decimals);
        }

        if (props.initialSupply != null) {
            this.setInitialSupply(props.initialSupply);
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

        if (props.freezeDefault != null) {
            this.setFreezeDefault(props.freezeDefault);
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
     * @returns {TokenCreateTransaction}
     */
    static _fromProtobuf(body) {
        const create = /** @type {proto.ITokenCreateTransactionBody} */ (body.tokenCreation);

        return new TokenCreateTransaction({
            name: create.name != null ? create.name : undefined,
            symbol: create.symbol != null ? create.symbol : undefined,
            decimals: create.decimals != null ? create.decimals : undefined,
            initialSupply:
                create.initialSupply != null ? create.initialSupply : undefined,
            treasury:
                create.treasury != null
                    ? AccountId._fromProtobuf(create.treasury)
                    : undefined,
            adminKey:
                create.adminKey != null
                    ? keyFromProtobuf(create.adminKey)
                    : undefined,
            kycKey:
                create.kycKey != null
                    ? keyFromProtobuf(create.kycKey)
                    : undefined,
            freezeKey:
                create.freezeKey != null
                    ? keyFromProtobuf(create.freezeKey)
                    : undefined,
            wipeKey:
                create.wipeKey != null
                    ? keyFromProtobuf(create.wipeKey)
                    : undefined,
            supplyKey:
                create.supplyKey != null
                    ? keyFromProtobuf(create.supplyKey)
                    : undefined,
            freezeDefault:
                create.freezeDefault != null ? create.freezeDefault : undefined,
            autoRenewAccount:
                create.autoRenewAccount != null
                    ? AccountId._fromProtobuf(create.autoRenewAccount)
                    : undefined,
            expirationTime: create.expiry != null ? create.expiry : undefined,
            autoRenewPeriod:
                create.autoRenewPeriod != null
                    ? create.autoRenewPeriod
                    : undefined,
        });
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
     * @returns {?Long}
     */
    get decimals() {
        return this._decimals;
    }

    /**
     * @param {Long | number} decimals
     * @returns {this}
     */
    setDecimals(decimals) {
        this._requireNotFrozen();
        this._decimals =
            decimals instanceof Long ? decimals : Long.fromValue(decimals);

        return this;
    }

    /**
     * @returns {?Long}
     */
    get initialSupply() {
        return this._initialSupply;
    }

    /**
     * @param {Long | number} initialSupply
     * @returns {this}
     */
    setInitialSupply(initialSupply) {
        this._requireNotFrozen();
        this._initialSupply =
            initialSupply instanceof Long
                ? initialSupply
                : Long.fromValue(initialSupply);

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
     * @returns {?boolean}
     */
    get freezeDefault() {
        return this._freezeDefault;
    }

    /**
     * @param {boolean} freeze
     * @returns {this}
     */
    setFreezeDefault(freeze) {
        this._requireNotFrozen();
        this._freezeDefault = freeze;

        return this;
    }

    /**
     * @returns {?Long}
     */
    get expirationTime() {
        return this._expirationTime;
    }

    /**
     * @param {Long | number} time
     * @returns {this}
     */
    setExpirationTime(time) {
        this._requireNotFrozen();
        this._expirationTime =
            time instanceof Long ? time : Long.fromValue(time);

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
     * @returns {Long}
     */
    get autoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * Set the auto renew period for this token.
     *
     * @param {number | Long} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._requireNotFrozen();
        this._autoRenewPeriod =
            autoRenewPeriod instanceof Long
                ? autoRenewPeriod
                : Long.fromValue(autoRenewPeriod);

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
        return channel.token.createToken(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenCreation";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ITokenCreateTransactionBody}
     */
    _makeTransactionData() {
        return {
            name: this.name,
            symbol: this.symbol,
            decimals: this.decimals != null ? this.decimals.toInt() : null,
            initialSupply: this.initialSupply,
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
            freezeDefault: this._freezeDefault,
            autoRenewAccount:
                this._autoRenewAccount != null
                    ? this._autoRenewAccount._toProtobuf()
                    : null,
            expiry: this._expirationTime,
            autoRenewPeriod: this._autoRenewPeriod,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "tokenCreation",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenCreateTransaction._fromProtobuf
);
