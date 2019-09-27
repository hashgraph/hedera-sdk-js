import {Timestamp as ProtoTimestamp} from "../generated/Timestamp_pb";

export type Timestamp = {
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
    return new Date(timestamp.getSeconds() * 1_000 + timestamp.getNanos() / 1_000_000);
}

export function timestampToMs(timestamp: ProtoTimestamp): number {
    return timestamp.getSeconds() * 1000 + Math.floor(timestamp.getNanos() / 1_000_000);
}