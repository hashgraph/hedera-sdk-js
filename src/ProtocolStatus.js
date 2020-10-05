export default class ProtocolStatus {
    /**
     * @hideconstructor
     * @internal
     * @param {number} code
     */
    constructor(code) {
        /** @readonly */
        this._code = code;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {number} code
     * @returns {ProtocolStatus}
     */
    static _fromValue(code) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return ProtocolStatus[code] != null
            ? // @ts-ignore
              ProtocolStatus[code]
            : new ProtocolStatus(code);
    }

    /**
     * @override
     * @returns {string}
     */
    toString() {
        switch (this) {
            case ProtocolStatus.Ok:
                return "OK";
            case ProtocolStatus.Cancelled:
                return "CANCELLED";
            case ProtocolStatus.Unknown:
                return "UNKNOWN";
            case ProtocolStatus.InvalidArgument:
                return "INVALID_ARGUMENT";
            case ProtocolStatus.DeadlineExceeded:
                return "DEADLINE_EXCEEDED";
            case ProtocolStatus.NotFound:
                return "NOT_FOUND";
            case ProtocolStatus.AlreadyExists:
                return "ALREADY_EXISTS";
            case ProtocolStatus.PermissionDenied:
                return "PERMISSION_DENIED";
            case ProtocolStatus.Unauthenticated:
                return "UNAUTHENTICATED";
            case ProtocolStatus.ResourceExhausted:
                return "RESOURCE_EXHAUSTED";
            case ProtocolStatus.FailedPrecondition:
                return "FAILED_PRECONDITION";
            case ProtocolStatus.Aborted:
                return "ABORTED";
            case ProtocolStatus.OutOfRange:
                return "OUT_OF_RANGE";
            case ProtocolStatus.Unimplemented:
                return "UNIMPLEMENTED";
            case ProtocolStatus.Internal:
                return "INTERNAL";
            case ProtocolStatus.Unavailable:
                return "UNAVAILABLE";
            case ProtocolStatus.DataLoss:
                return "DATA_LOSS";

            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @returns {number}
     */
    valueOf() {
        return this._code;
    }
}

ProtocolStatus.Ok = ProtocolStatus[0] = new ProtocolStatus(0);
ProtocolStatus.Cancelled = ProtocolStatus[1] = new ProtocolStatus(1);
ProtocolStatus.Unknown = ProtocolStatus[2] = new ProtocolStatus(2);
ProtocolStatus.InvalidArgument = ProtocolStatus[3] = new ProtocolStatus(3);
ProtocolStatus.DeadlineExceeded = ProtocolStatus[4] = new ProtocolStatus(4);
ProtocolStatus.NotFound = ProtocolStatus[5] = new ProtocolStatus(5);
ProtocolStatus.AlreadyExists = ProtocolStatus[6] = new ProtocolStatus(6);
ProtocolStatus.PermissionDenied = ProtocolStatus[7] = new ProtocolStatus(7);
ProtocolStatus.Unauthenticated = ProtocolStatus[16] = new ProtocolStatus(16);
ProtocolStatus.ResourceExhausted = ProtocolStatus[8] = new ProtocolStatus(8);
ProtocolStatus.FailedPrecondition = ProtocolStatus[9] = new ProtocolStatus(9);
ProtocolStatus.Aborted = ProtocolStatus[10] = new ProtocolStatus(10);
ProtocolStatus.OutOfRange = ProtocolStatus[11] = new ProtocolStatus(11);
ProtocolStatus.Unimplemented = ProtocolStatus[12] = new ProtocolStatus(12);
ProtocolStatus.Internal = ProtocolStatus[13] = new ProtocolStatus(13);
ProtocolStatus.Unavailable = ProtocolStatus[14] = new ProtocolStatus(14);
ProtocolStatus.DataLoss = ProtocolStatus[15] = new ProtocolStatus(15);
