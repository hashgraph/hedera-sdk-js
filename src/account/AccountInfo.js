import AccountId from "./AccountId";
import proto from "@hashgraph/proto";
import Hbar from "../Hbar";
import Time from "../Time";
import { _fromProtoKey } from "../util";
import { Key } from "@hashgraph/cryptography";
import Long from "long";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class AccountInfo {
    /**
     * @private
     * @param {object} properties
     * @param {AccountId} properties.accountId
     * @param {string} [properties.contractAccountId]
     * @param {boolean} properties.isDeleted
     * @param {AccountId} [properties.proxyAccountId]
     * @param {Hbar} properties.proxyReceived
     * @param {Key} properties.key
     * @param {Hbar} properties.balance
     * @param {Hbar} properties.generateSendRecordThreshold
     * @param {Hbar} properties.generateReceiveRecordThreshold
     * @param {boolean} properties.isReceiverSignatureRequired
     * @param {Time} properties.expirationTime
     * @param {number} properties.autoRenewPeriod
     *
     */
    constructor(properties) {
        /**
         * The account ID for which this information applies.
         */
        this.accountId = properties.accountId;

        /**
         * The Contract Account ID comprising of both the contract instance and the cryptocurrency
         * account owned by the contract instance, in the format used by Solidity.
         */
        this.contractAccountId = null;
        if (properties.contractAccountId != null) {
            this.contractAccountId = properties.contractAccountId;
        }

        /**
         * If true, then this account has been deleted, it will disappear when it expires, and
         * all transactions for it will fail except the transaction to extend its expiration date.
         */
        this.isDeleted = properties.isDeleted;

        /**
         * The Account ID of the account to which this is proxy staked. If proxyAccountID is null,
         * or is an invalid account, or is an account that isn't a node, then this account is
         * automatically proxy staked to a node chosen by the network, but without earning payments.
         * If the proxyAccountID account refuses to accept proxy staking , or if it is not currently
         * running a node, then it will behave as if proxyAccountID was null.
         */
        this.proxyAccountId = null;
        if (properties.proxyAccountId != null) {
            this.proxyAccountId = properties.proxyAccountId;
        }

        /**
         * The total number of tinybars proxy staked to this account.
         */
        this.proxyReceived = properties.proxyReceived;

        /**
         * The key for the account, which must sign in order to transfer out, or to modify the account
         * in any way other than extending its expiration date.
         */
        this.key = properties.key;

        /**
         * The current balance of account in tinybars.
         */
        this.balance = properties.balance;

        /**
         * The threshold amount (in tinybars) for which an account record is created (and this account
         * charged for them) for any send/withdraw transaction.
         */
        this.generateSendRecordThreshold =
            properties.generateSendRecordThreshold;

        /**
         * The threshold amount (in tinybars) for which an account record is created
         * (and this account charged for them) for any transaction above this amount.
         */
        this.generateReceiveRecordThreshold =
            properties.generateReceiveRecordThreshold;

        /**
         * If true, no transaction can transfer to this account unless signed by this account's key.
         */
        this.isReceiverSignatureRequired =
            properties.isReceiverSignatureRequired;

        /**
         * The TimeStamp time at which this account is set to expire.
         */
        this.expirationTime = properties.expirationTime;

        /**
         * The duration for expiration time will extend every this many seconds. If there are
         * insufficient funds, then it extends as long as possible. If it is empty when it
         * expires, then it is deleted.
         */
        this.autoRenewPeriod = properties.autoRenewPeriod;

        Object.freeze(this);
    }

    /**
     * @param {proto.CryptoGetInfoResponse.IAccountInfo} info
     */
    static _fromProtobuf(info) {
        const sendThreshold = Hbar.fromTinybars(
            // @ts-ignore
            info.generateSendRecordThreshold
        );
        const receiveThreshold = Hbar.fromTinybars(
            // @ts-ignore
            info.generateReceiveRecordThreshold
        );

        return new AccountInfo({
            // @ts-ignore
            accountId: AccountId._fromProtobuf(info.accountID),
            // @ts-ignore
            contractAccountId: info.contractAccountID,
            // @ts-ignore
            isDeleted: info.deleted,
            // @ts-ignore
            key: _fromProtoKey(info.key),
            // @ts-ignore
            balance: Hbar.fromTinybars(info.balance),
            generateSendRecordThreshold: sendThreshold,
            generateReceiveRecordThreshold: receiveThreshold,
            // @ts-ignore
            isReceiverSignatureRequired: info.receiverSigRequired,
            // @ts-ignore
            expirationTime: Time._fromProtobuf(info.expirationTime),
            autoRenewPeriod:
                info.autoRenewPeriod?.seconds instanceof Long
                    ? info.autoRenewPeriod.seconds.toInt()
                    : info.autoRenewPeriod?.seconds ?? 0,
            proxyAccountId:
                info.proxyAccountID != null
                    ? AccountId._fromProtobuf(info.proxyAccountID)
                    : undefined,
            proxyReceived: Hbar.fromTinybars(info.proxyReceived ?? 0),
        });
    }
}
