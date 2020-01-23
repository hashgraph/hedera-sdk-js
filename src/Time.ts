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

    public static fromDate(date: number | Date): Time {
        const ms = typeof date === "number" ?
            date :
            date.getMilliseconds();
        const seconds = ms / 1000;
        const nanos = ms % 1000 * 1_000_000;
        return new Time(seconds, nanos);
    }

    public _toProto(): ProtoTimestamp {
        const proto = new ProtoTimestamp();
        proto.setSeconds(this.seconds);
        proto.setNanos(this.nanos);
        return proto;
    }

    public static _fromProto(timestamp: ProtoTimestamp): Time {
        return new Time(timestamp.getSeconds(), timestamp.getNanos());
    }
}
