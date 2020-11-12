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
     * @param {(error: number?, data: Uint8Array?) => void} callback
     * @returns {() => void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    makeServerStreamRequest(requestData, callback) {
        throw new Error("not implemented");
    }
}
