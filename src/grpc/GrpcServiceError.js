import GrpcStatus from "./GrpcStatus.js";

/**
 * Describes how the gRPC request failed.
 *
 * Exists in order for the Hedera JavaScript SDK to produce the same error type for gRPC errors regardless of
 * operating in node or the browser.
 *
 * Definition taken from <https://grpc.github.io/grpc/node/grpc.html#~ServiceError>.
 */
export default class GrpcServiceError extends Error {
    /**
     * @param {GrpcStatus} status
     */
    constructor(status) {
        super(`gRPC service failed with status: ${status.toString()}`);

        /**
         * @readonly
         */
        this.status = status;

        this.name = "GrpcServiceError";

        if (typeof Error.captureStackTrace !== "undefined") {
            Error.captureStackTrace(this, GrpcServiceError);
        }
    }

    /**
     * @param {Error & { code?: number; details?: string }} obj
     * @returns {Error}
     */
    static _fromResponse(obj) {
        if (obj.code != null && obj.details != null) {
            const status = GrpcStatus._fromValue(obj.code);
            const err = new GrpcServiceError(status);
            err.message = obj.details;
            return err;
        } else {
            return /** @type {Error} */ (obj);
        }
    }
}
