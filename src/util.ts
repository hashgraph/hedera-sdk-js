import {AccountID, TransactionID} from "./generated/BasicTypes_pb";
import {Timestamp} from "./generated/Timestamp_pb";
import {Duration} from "./generated/Duration_pb";
import {AccountId, TransactionId} from "./typedefs";
import {ResponseHeader} from "./generated/ResponseHeader_pb";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import {Response} from "./generated/Response_pb";
import BigNumber from "bignumber.js";
import {throwIfExceptional} from "./errors";
import {Hbar} from "./Hbar";

export function orThrow<T>(val?: T, msg = 'value must not be null'): T {
    if (val === undefined || val === null) {
        throw new Error(msg);
    }

    return val;
}

export function getProtoTxnId({ account, validStartSeconds, validStartNanos }: TransactionId): TransactionID {
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
        throw new TypeError('duration cannot have fractional seconds')
    }

    const duration = new Duration();
    duration.setSeconds(seconds);
    return duration;
}

export function getProtoAccountId({ shard, realm, account }: AccountId): AccountID {
    const acctId = new AccountID();
    acctId.setShardnum(shard);
    acctId.setRealmnum(realm);
    acctId.setAccountnum(account);
    return acctId;
}

export const getSdkAccountId = (accountId: AccountID): AccountId => (
    {
        shard: accountId.getShardnum(),
        realm: accountId.getRealmnum(),
        account: accountId.getAccountnum()
    }
);
export const getSdkTxnId = (txnId: TransactionID): TransactionId => (
    {
        account: getSdkAccountId(orThrow(txnId.getAccountid())),
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

export function handleQueryPrecheck<T extends GetHeader>(getBody: (r: Response) => T | undefined): (r: undefined | Response) => T {
    return (resp) => {
        const body = reqDefined(
            getBody(reqDefined(resp, 'missing Response')),
            'missing body from Response'
        );

        const header = reqDefined(body.getHeader(), 'missing header from Response');

        const precheck = header.getNodetransactionprecheckcode();

        throwIfExceptional(precheck);
        return body;
    }
}

export function handlePrecheck(resp_: TransactionResponse | undefined): TransactionResponse {
    const resp = reqDefined(resp_, 'missing TransactionResponse');
    const precheck = resp.getNodetransactionprecheckcode();

    throwIfExceptional(precheck);
    return resp;
}

const maxTinybarBignum = new BigNumber(2).pow(63).minus(1);
const minTinybarBignum = new BigNumber(2).pow(63).negated();

export function checkNumber(amount: number | BigNumber): void {
    if (amount instanceof BigNumber && (!amount.isInteger() || amount.gt(maxTinybarBignum) || amount.lt(minTinybarBignum))) {
        throw new Error('`amount` as BigNumber must be an integer in the range [-2^63, 2^63)');
    } else if (typeof amount === 'number' && !Number.isSafeInteger(amount)) {
        throw new TypeError('`amount` as number must be in the range [-2^53, 2^53 - 1)');
    }
}

export function toTinybarString(amount: number | BigNumber | Hbar): string {
    if (amount instanceof Hbar) {
        return String(amount.asTinybar());
    } else {
        checkNumber(amount);
        return String(amount);
    }
}

export function toPositiveTinybarString(amount: number | BigNumber | Hbar): string {
    if (amount instanceof Hbar) {
        if (amount.isNegative()) {
            throw new Error(`amount must not be negative: ${amount.asTinybar()}`)
        }

        return String(amount.asTinybar());
    } else {
        checkNumber(amount);

        if ((amount instanceof BigNumber && amount.isNegative()) || amount < 0) {
            throw new Error(`amount must not be negative: ${amount}`)
        }

        return String(amount);
    }
}

export function reqDefined<T>(val: T | undefined, msg: string): T {
    if (val === undefined) {
        throw new Error(msg);
    }

    return val;
}
