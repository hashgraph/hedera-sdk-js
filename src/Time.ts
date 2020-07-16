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
        let ms;

        if (typeof date === "number") {
            ms = date;
        } else if (date instanceof Date) {
            ms = date.getTime();
        } else {
            throw new TypeError(`Invalid type ${JSON.stringify(date)} is not 'number' or 'Date'`);
        }

        const seconds = Math.floor(ms / 1000);
        const nanos = Math.floor(ms % 1000) * 1_000_000;
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

    public _increment(): Time {
        if (Math.floor(this.nanos + 1) === 1_000_000_000) {
            return new Time(this.seconds + 1, 0);
        }
        return new Time(this.seconds, this.nanos + 1);
    }
}
