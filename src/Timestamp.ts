import { Timestamp as ProtoTimestamp } from "./generated/timestamp_pb";
import BigNumber from "bignumber.js";

export interface Timestamp {
    seconds: number;
    nanos: number;
}

export function dateToTimestamp(dateOrMs: number | Date): Timestamp {
    const dateMs = dateOrMs instanceof Date ? dateOrMs.getTime() : dateOrMs;

    return {
        // get whole seconds since the epoch
        seconds: Math.floor(dateMs / 1000),
        // get remainder as nanoseconds
        nanos: Math.floor(dateMs % 1000 * 1_000_000)
    };
}

export function timestampToDate(timestamp: ProtoTimestamp): Date {
    return new Date(timestampToMs(timestamp));
}

export function timestampToMs(timestamp: ProtoTimestamp): number {
    return new BigNumber(timestamp.getSeconds())
        .multipliedBy(1000)
        .plus(Math.floor(timestamp.getNanos() / 1_000_000))
        .toNumber();
}

/* eslint-disable-next-line max-len */
export function timestampToProto({ seconds, nanos }: { seconds: number; nanos: number }): ProtoTimestamp {
    const timestamp = new ProtoTimestamp();
    timestamp.setSeconds(seconds.toString());
    timestamp.setNanos(nanos);
    return timestamp;
}
