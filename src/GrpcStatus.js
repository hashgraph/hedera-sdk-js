export default class GrpcStatus {
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
     * @returns {GrpcStatus}
     */
    static _fromValue(code) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return GrpcStatus[code] != null
            ? // @ts-ignore
              GrpcStatus[code]
            : new GrpcStatus(code);
    }

    /**
     * @override
     * @returns {string}
     */
    toString() {
        switch (this) {
            case GrpcStatus.Ok:
                return "OK";
            case GrpcStatus.Cancelled:
                return "CANCELLED";
            case GrpcStatus.Unknown:
                return "UNKNOWN";
            case GrpcStatus.InvalidArgument:
                return "INVALID_ARGUMENT";
            case GrpcStatus.DeadlineExceeded:
                return "DEADLINE_EXCEEDED";
            case GrpcStatus.NotFound:
                return "NOT_FOUND";
            case GrpcStatus.AlreadyExists:
                return "ALREADY_EXISTS";
            case GrpcStatus.PermissionDenied:
                return "PERMISSION_DENIED";
            case GrpcStatus.Unauthenticated:
                return "UNAUTHENTICATED";
            case GrpcStatus.ResourceExhausted:
                return "RESOURCE_EXHAUSTED";
            case GrpcStatus.FailedPrecondition:
                return "FAILED_PRECONDITION";
            case GrpcStatus.Aborted:
                return "ABORTED";
            case GrpcStatus.OutOfRange:
                return "OUT_OF_RANGE";
            case GrpcStatus.Unimplemented:
                return "UNIMPLEMENTED";
            case GrpcStatus.Internal:
                return "INTERNAL";
            case GrpcStatus.Unavailable:
                return "UNAVAILABLE";
            case GrpcStatus.DataLoss:
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

GrpcStatus.Ok = GrpcStatus[0] = new GrpcStatus(0);
GrpcStatus.Cancelled = GrpcStatus[1] = new GrpcStatus(1);
GrpcStatus.Unknown = GrpcStatus[2] = new GrpcStatus(2);
GrpcStatus.InvalidArgument = GrpcStatus[3] = new GrpcStatus(3);
GrpcStatus.DeadlineExceeded = GrpcStatus[4] = new GrpcStatus(4);
GrpcStatus.NotFound = GrpcStatus[5] = new GrpcStatus(5);
GrpcStatus.AlreadyExists = GrpcStatus[6] = new GrpcStatus(6);
GrpcStatus.PermissionDenied = GrpcStatus[7] = new GrpcStatus(7);
GrpcStatus.Unauthenticated = GrpcStatus[16] = new GrpcStatus(16);
GrpcStatus.ResourceExhausted = GrpcStatus[8] = new GrpcStatus(8);
GrpcStatus.FailedPrecondition = GrpcStatus[9] = new GrpcStatus(9);
GrpcStatus.Aborted = GrpcStatus[10] = new GrpcStatus(10);
GrpcStatus.OutOfRange = GrpcStatus[11] = new GrpcStatus(11);
GrpcStatus.Unimplemented = GrpcStatus[12] = new GrpcStatus(12);
GrpcStatus.Internal = GrpcStatus[13] = new GrpcStatus(13);
GrpcStatus.Unavailable = GrpcStatus[14] = new GrpcStatus(14);
GrpcStatus.DataLoss = GrpcStatus[15] = new GrpcStatus(15);
