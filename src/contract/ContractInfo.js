import ContractId from "./ContractId";
import AccountId from "../account/AccountId";
import proto from "@hashgraph/proto";
import Hbar from "../Hbar";
import { _fromProtoKey } from "../util";
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
     * @param {Key} [properties.adminKey]
     * @param {Date} properties.expirationTime
     * @param {number} properties.autoRenewPeriod
     * @param {Long} properties.storage
     * @param {string} properties.contractMemo
     * @param {Hbar} properties.balance
     */
    constructor(properties) {
        /**
         * ID of the contract instance, in the format used in transactions.
         */
        this.contractId = properties.contractId;

        /**
         * ID of the cryptocurrency account owned by the contract instance,
         * in the format used in transactions.
         */
        this.accountId = properties.accountId;

        /**
         * ID of both the contract instance and the cryptocurrency account owned by the contract
         * instance, in the format used by Solidity.
         */
        this.contractAccountId = properties.contractAccountId;

        /**
         * The state of the instance and its fields can be modified arbitrarily if this key signs a
         * transaction to modify it. If this is null, then such modifications are not possible,
         * and there is no administrator that can override the normal operation of this smart
         * contract instance. Note that if it is created with no admin keys, then there is no
         * administrator to authorize changing the admin keys, so there can never be any admin keys
         * for that instance.
         */
        this.adminKey = null;
        if (properties.adminKey != null) {
            this.adminKey = properties.adminKey;
        }

        /**
         * The current time at which this contract instance (and its account) is set to expire.
         */
        this.expirationTime = properties.expirationTime;

        /**
         * The expiration time will extend every this many seconds. If there are insufficient funds,
         * then it extends as long as possible. If the account is empty when it expires,
         * then it is deleted.
         */
        this.autoRenewPeriod = properties.autoRenewPeriod;

        /**
         * Number of bytes of storage being used by this instance (which affects the cost to
         * extend the expiration time).
         */
        this.storage = properties.storage;

        /**
         * The memo associated with the contract (max 100 bytes).
         */
        this.contractMemo = properties.contractMemo;

        /**
         * The current balance of the contract.
         */
        this.balance = properties.balance;

        Object.freeze(this);
    }

    /**
     * @param {proto.ContractGetInfoResponse.IContractInfo} info
     */
    static _fromProtobuf(info) {
        return new ContractInfo({
            // @ts-ignore
            contractId: ContractId._fromProtobuf(info.contractID),
            // @ts-ignore
            accountId: AccountId._fromProtobuf(info.accountID),
            // @ts-ignore
            contractAccountId: info.contractAccountID,
            // @ts-ignore
            adminKey:
                info.adminKey != null
                    ? _fromProtoKey(info.adminKey)
                    : undefined,
            // @ts-ignore
            expirationTime: new Date(info.expirationTime * 1000),
            autoRenewPeriod:
                info.autoRenewPeriod?.seconds instanceof Long
                    ? info.autoRenewPeriod.seconds.toInt()
                    : info.autoRenewPeriod?.seconds ?? 0,
            storage:
                info.storage != null
                    ? info.storage instanceof Long
                        ? info.storage
                        : Long.fromValue(info.storage)
                    : Long.ZERO,
            contractMemo: info.memo ?? "",
            // @ts-ignore
            balance: Hbar.fromTinybars(info.balance),
        });
    }
}
