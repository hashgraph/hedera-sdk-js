import TokenId from "./TokenId.js";
import Transaction, {
    DEFAULT_AUTO_RENEW_PERIOD,
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import Long from "long";
import AccountId from "../account/AccountId";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ITokenCreateTransaction} proto.ITokenCreateTransaction
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
        this._decimal = null;

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
        this._adminkey = null;

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
        this._supplykey = null;

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
            this.setSupplyKey(props.supplyKey);
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
        const create = /** @type {proto.ITokenID} */ (body.cryptoCreateToken);

        return new TokenCreateTransaction({
            adminKey: create.adminKey != null ? keyFromProtobuf(create.adminKey) : undefined,
            autoRenewPeriod:
                create.autoRenewPeriod != null
                    ? create.autoRenewPeriod.seconds != null
                        ? create.autoRenewPeriod.seconds
                        : undefined
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
        this._decimals = decimals;

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
        this._initialSupply = initialSupply;

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
        this._treasury = id instanceof AccountId ?
            id :
            AccountId.fromString(id);

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
        return this._supplykey;
    }

    /**
     * @param {Key} key
     * @returns {this}
     */
    setSupplyKey(key) {
        this._requireNotFrozen();
        this._supplykey = key;

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
     * @returns {?boolean}
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
        this._expirationTime = time;

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
        this._autoRenewAccount = id instanceof AccountId ?
            id :
            AccountId.fromString(id);

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
        return channel.crypto.createToken(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoCreateToken";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoCreateTransactionBody}
     */
    _makeTransactionData() {
        return {
            key: this._key != null ? keyToProtobuf(this._key) : null,
            initialBalance:
                this._initialBalance != null
                    ? this._initialBalance.toTinybars()
                    : null,
            autoRenewPeriod: {
                seconds: this._autoRenewPeriod,
            },
            proxyTokenID:
                this._proxyTokenId != null
                    ? this._proxyTokenId._toProtobuf()
                    : null,
            receiveRecordThreshold: this._receiveRecordThreshold.toTinybars(),
            sendRecordThreshold: this._sendRecordThreshold.toTinybars(),
            receiverSigRequired: this._receiverSignatureRequired,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoCreateToken",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenCreateTransaction._fromProtobuf
);
