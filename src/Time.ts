import { Timestamp as ProtoTimestamp } from "./generated/Timestamp_pb";

export class Time {
    public readonly seconds: number;
    public readonly nanos: number;

    public constructor(seconds: number, nanos: number) {
        this.seconds = seconds;
        this.nanos = nanos;
    }

    public asDate(): Date {
        return new Date(this.seconds * 1000 + Math.floor(this.nanos / 1_000_000));
    }

    public static _fromProto(timestamp: ProtoTimestamp): Time {
        return new Time(timestamp.getSeconds(), timestamp.getNanos());
    }
}
