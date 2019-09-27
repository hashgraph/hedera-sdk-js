import {AccountId, AccountIdLike, accountIdToProto, accountIdToSdk, normalizeAccountId} from "./AccountId";
import {TransactionID} from "../generated/BasicTypes_pb";
import {orThrow} from "../util";
import {Timestamp} from "../generated/Timestamp_pb";
import {dateToTimestamp} from "./Timestamp";

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

export function newTxnId(accountId: AccountIdLike): TransactionID {
    const acctId = accountIdToProto(accountId);

    // allows the transaction to be accepted as long as the node isn't 10 seconds behind us
    const {seconds, nanos} = dateToTimestamp(Date.now() - 10_000);

    const validStart = new Timestamp();
    validStart.setSeconds(seconds);
    validStart.setNanos(nanos);

    const txnId = new TransactionID();
    txnId.setAccountid(acctId);
    txnId.setTransactionvalidstart(validStart);

    return txnId;
}

export function getProtoTxnId(transactionId: TransactionIdLike): TransactionID {
    const { account, validStartSeconds, validStartNanos } = normalizeTxnId(transactionId);

    const txnId = new TransactionID();
    txnId.setAccountid(accountIdToProto(account));

    const ts = new Timestamp();
    ts.setSeconds(validStartSeconds);
    ts.setNanos(validStartNanos);
    txnId.setTransactionvalidstart(ts);

    return txnId;
}

export function normalizeTxnId(txnId: TransactionIdLike): TransactionId {
    const account = normalizeAccountId(txnId.account);

    if ('validStart' in txnId) {
        const validStart = txnId.validStart;
        const { seconds: validStartSeconds, nanos: validStartNanos } = dateToTimestamp(validStart);

        return {
            account,
            validStartSeconds,
            validStartNanos
        };
    } else {
        return {
            ...txnId,
            account
        };
    }
}