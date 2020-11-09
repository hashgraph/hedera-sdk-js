/**
 * @internal
 * @abstract
 */
export default class MirrorChannel {
    /**
     * @internal
     */
    constructor() {
        // do nothing (for now)
    }

    /**
     * @abstract
     * @returns {void}
     */
    close() {
        throw new Error("not implemented");
    }
}
