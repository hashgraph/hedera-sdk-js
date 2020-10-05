/**
 * @typedef {import("./ProtocolStatus").default} ProtocolStatus
 */

export default class ProtocolError extends Error {
    /**
     * @param {ProtocolStatus} status
     */
    constructor(status) {
        super(`received non-ok status code from gRPC: ${status.toString()}`);

        /**
         * @readonly
         */
        this.status = status;

        this.name = "StatusError";

        if (typeof Error.captureStackTrace !== "undefined") {
            Error.captureStackTrace(this, ProtocolError);
        }
    }
}
