import ContractId from "./ContractId";
import AccountId from "../account/AccountId";
import Timestamp from "../Timestamp";
import proto from "@hashgraph/proto";
import Hbar from "../Hbar";
import { _fromProtoKey, _toProtoKey } from "../util";
import { Key } from "@hashgraph/cryptography";
import Long from "long";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class ContractInfo {
    /**
     * @private
     * @param {object} properties
     * @param {ContractId} properties.contractId
     * @param {AccountId} properties.accountId
     * @param {string} properties.contractAccountId
     * @param {?Key} properties.adminKey
     * @param {Timestamp} properties.expirationTime
     * @param {Long} properties.autoRenewPeriod
     * @param {Long} properties.storage
     * @param {string} properties.contractMemo
     * @param {Hbar} properties.balance
     */
    constructor(properties) {
        /**
         * ID of the contract instance, in the format used in transactions.
         *
         * @readonly
         */
        this.contractId = properties.contractId;

        /**
         * ID of the cryptocurrency account owned by the contract instance,
         * in the format used in transactions.
         *
         * @readonly
         */
        this.accountId = properties.accountId;

        /**
         * ID of both the contract instance and the cryptocurrency account owned by the contract
         * instance, in the format used by Solidity.
         *
         * @readonly
         */
        this.contractAccountId = properties.contractAccountId;

        /**
         * The state of the instance and its fields can be modified arbitrarily if this key signs a
         * transaction to modify it. If this is null, then such modifications are not possible,
         * and there is no administrator that can override the normal operation of this smart
         * contract instance. Note that if it is created with no admin keys, then there is no
         * administrator to authorize changing the admin keys, so there can never be any admin keys
         * for that instance.
         *
         * @readonly
         */
        this.adminKey =
            properties.adminKey != null ? properties.adminKey : null;

        /**
         * The current time at which this contract instance (and its account) is set to expire.
         *
         * @readonly
         */
        this.expirationTime = properties.expirationTime;

        /**
         * The expiration time will extend every this many seconds. If there are insufficient funds,
         * then it extends as long as possible. If the account is empty when it expires,
         * then it is deleted.
         *
         * @readonly
         */
        this.autoRenewPeriod = properties.autoRenewPeriod;

        /**
         * Number of bytes of storage being used by this instance (which affects the cost to
         * extend the expiration time).
         *
         * @readonly
         */
        this.storage = properties.storage;

        /**
         * The memo associated with the contract (max 100 bytes).
         *
         * @readonly
         */
        this.contractMemo = properties.contractMemo;

        /**
         * The current balance of the contract.
         *
         * @readonly
         */
        this.balance = properties.balance;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ContractGetInfoResponse.IContractInfo} info
     */
    static _fromProtobuf(info) {
        const autoRenewPeriod = /** @type {Long | number} */ (
            /** @type {proto.IDuration} */ (info.autoRenewPeriod).seconds
        );

        return new ContractInfo({
            contractId: ContractId._fromProtobuf(
                /** @type {proto.IContractID} */ (info.contractID)
            ),
            accountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (info.accountID)
            ),
            contractAccountId:
                info.contractAccountID != null ? info.contractAccountID : "",
            adminKey:
                info.adminKey != null ? _fromProtoKey(info.adminKey) : null,
            expirationTime: Timestamp._fromProtobuf(
                /** @type {proto.ITimestamp} */ (info.expirationTime)
            ),
            autoRenewPeriod:
                autoRenewPeriod instanceof Long
                    ? autoRenewPeriod
                    : Long.fromValue(autoRenewPeriod),
            storage:
                info.storage != null
                    ? info.storage instanceof Long
                        ? info.storage
                        : Long.fromValue(info.storage)
                    : Long.ZERO,
            contractMemo: info.memo != null ? info.memo : "",
            balance: Hbar.fromTinybars(info.balance != null ? info.balance : 0),
        });
    }

    /**
     * @internal
     * @returns {proto.ContractGetInfoResponse.IContractInfo}
     */
    _toProtobuf() {
        return {
            contractID: this.contractId._toProtobuf(),
            accountID: this.accountId._toProtobuf(),
            contractAccountID: this.contractAccountId,
            adminKey: this.adminKey != null ? _toProtoKey(this.adminKey) : null,
            expirationTime: this.expirationTime._toProtobuf(),
            autoRenewPeriod: {
                seconds: this.autoRenewPeriod,
            },
            storage: this.storage,
            memo: this.contractMemo,
            balance: this.balance.toTinybars(),
        };
    }
}
