import {AccountID, TransactionID} from "./generated/BasicTypes_pb";
import {Timestamp} from "./generated/Timestamp_pb";
import {Duration} from "./generated/Duration_pb";
import {ResponseCodeEnum} from "./generated/ResponseCode_pb";
import {AccountId, TransactionId} from "./Client";
import {ResponseHeader} from "./generated/ResponseHeader_pb";
import {Transaction} from "./generated/Transaction_pb";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import {Response} from "./generated/Response_pb";

export function orThrow<T>(val?: T): T {
    if (val === undefined || val === null) {
        throw new Error('value must not be null');
    }

    return val;
}

export function getProtoTxnId({account, validStartSeconds, validStartNanos}: TransactionId): TransactionID {
    const txnId = new TransactionID();
    txnId.setAccountid(getProtoAccountId(account));

    const ts = new Timestamp();
    ts.setSeconds(validStartSeconds);
    ts.setNanos(validStartNanos);
    txnId.setTransactionvalidstart(ts);

    return txnId;
}

export function newTxnId(accountId: AccountId): TransactionID {
    const acctId = getProtoAccountId(accountId);

    const validStart = new Timestamp();

    // allows the transaction to be accepted as long as the node isn't 10 seconds behind us
    const nowMs = Date.now() - 10_000;

    // get whole seconds since the epoch
    validStart.setSeconds(Math.floor(nowMs / 1000));
    // get remainder as nanoseconds
    validStart.setNanos(nowMs % 1000 * 1_000_000);

    const txnId = new TransactionID();
    txnId.setAccountid(acctId);
    txnId.setTransactionvalidstart(validStart);

    return txnId;
}

export function timestampToMs(timestamp: Timestamp): number {
    return timestamp.getSeconds() * 1000 + Math.floor(timestamp.getNanos() / 1_000_000);
}

export function newDuration(seconds: number): Duration {
    if (!Number.isSafeInteger(seconds)) {
        throw new Error('duration cannot have fractional seconds')
    }

    const duration = new Duration();
    duration.setSeconds(seconds);
    return duration;
}

export function isPrecheckCodeOk(code: number, unknownOk = false): boolean {
    switch (code) {
        case ResponseCodeEnum.SUCCESS:
        case ResponseCodeEnum.OK:
            return true;
        case ResponseCodeEnum.UNKNOWN:
            return unknownOk;
        default:
            return false;
    }
}

const reversePrechecks: { [code: number]: string } = Object.entries(ResponseCodeEnum)
    .reduce((map, [name, code]) => ({...map, [code]: name}), {});
export const reversePrecheck = (code: number): string => reversePrechecks[code] || `unknown precheck code: ${code}`;

export function getProtoAccountId({shard, realm, account}: AccountId): AccountID {
    const acctId = new AccountID();
    acctId.setShardnum(shard);
    acctId.setRealmnum(realm);
    acctId.setAccountnum(account);
    return acctId;
}

export const getMyAccountId = (accountId: AccountID): AccountId => (
    {
        shard: accountId.getShardnum(),
        realm: accountId.getRealmnum(),
        account: accountId.getAccountnum()
    }
);
export const getMyTxnId = (txnId: TransactionID): TransactionId => (
    {
        account: getMyAccountId(orThrow(txnId.getAccountid())),
        validStartSeconds: orThrow(txnId.getTransactionvalidstart()).getSeconds(),
        validStartNanos: orThrow(txnId.getTransactionvalidstart()).getNanos(),
    }
);

export function setTimeoutAwaitable(timeoutMs: number): Promise<undefined> {
    return new Promise(resolve => setTimeout(resolve, timeoutMs));
}

export interface GetHeader {
    getHeader(): ResponseHeader | undefined;
}

export function handleTxnPrecheck(resp: TransactionResponse): TransactionResponse {
    const precheck = resp.getNodetransactionprecheckcode();

    if (isPrecheckCodeOk(precheck, true)) {
        return resp;
    } else {
        throw new Error(reversePrecheck(precheck));
    }
}

export function handleQueryPrecheck<T extends GetHeader>(getBody: (r: Response) => T | undefined): (r: undefined | Response) => T {
    return (resp) => {
        const body = getBody(resp);

        if (body === undefined) {
            throw new Error('missing body type from Response');
        }

        const header = body.getHeader();

        if (header === undefined) {
            throw new Error('missing header from Response');
        }

        const precheck = header.getNodetransactionprecheckcode();

        if (isPrecheckCodeOk(precheck)) {
            return body;
        } else {
            throw new Error(reversePrecheck(precheck));
        }
    }
}

const tinybarMaxSignedBigint = BigInt(1) << BigInt(63) - BigInt(1);
const tinybarMinSignedBigint = -tinybarMaxSignedBigint - BigInt(1);

export function checkNumber(amount: number | BigInt) {
    if (typeof amount === 'bigint' && (amount > tinybarMaxSignedBigint || amount < tinybarMinSignedBigint)) {
        throw new Error('`amount` as bigint must be in the range [-2^63, 2^63)');
    } else if (typeof amount === 'number' && !Number.isSafeInteger(amount)) {
        throw new Error('`amount` as number must be in the range [-2^53, 2^53 - 1)');
    }
}
