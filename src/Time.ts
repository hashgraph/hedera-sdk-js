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
}
