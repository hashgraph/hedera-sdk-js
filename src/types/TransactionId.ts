import {AccountId, AccountIdLike, accountIdToSdk} from "./AccountId";
import {TransactionID} from "../generated/BasicTypes_pb";
import {orThrow} from "../util";

/**
 * Normalized transaction ID returned by various methods in the SDK.
 */
export type TransactionId = {
    account: AccountId;
    validStartSeconds: number;
    validStartNanos: number;
};

/**
 * Input type for an ID of a new transaction.
 */
export type TransactionIdLike = { account: AccountIdLike }
    & ({ validStart: Date } | { validStartSeconds: number; validStartNanos: number });

export function transactionIdToSdk(txnId: TransactionID): TransactionId {
    return {
        account: accountIdToSdk(orThrow(txnId.getAccountid())),
        validStartSeconds: orThrow(txnId.getTransactionvalidstart()).getSeconds(),
        validStartNanos: orThrow(txnId.getTransactionvalidstart()).getNanos(),
    };
}