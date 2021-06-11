/**
 * @typedef {object} MirrorError
 * @property {number} code
 * @property {string} details
 */

/**
 * @internal
 * @abstract
 */
export default class MirrorChannel {
    /**
     * @abstract
     * @returns {void}
     */
    close() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @internal
     * @param {Uint8Array} requestData
     * @param {(data: Uint8Array) => void} callback
     * @param {(error: MirrorError | Error) => void} error
     * @param {() => void} end
     * @returns {() => void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    makeServerStreamRequest(requestData, callback, error, end) {
        throw new Error("not implemented");
    }
}
