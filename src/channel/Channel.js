import proto from "@hashgraph/proto";

/**
 * @abstract
 */
export default class Channel {
    /**
     * @param {string} _
     */
    constructor(_) {
        /**
         * @protected
         * @type {?proto.CryptoService}
         */
        this._crypto = null;

        /**
         * @protected
         * @type {?proto.SmartContractService}
         */
        this._smartContract = null;

        /**
         * @protected
         * @type {?proto.FileService}
         */
        this._file = null;

        /**
         * @protected
         * @type {?proto.ConsensusService}
         */
        this._consensus = null;
    }

    /**
     * @abstract
     * @returns {proto.CryptoService}
     */
    get crypto() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {proto.SmartContractService}
     */
    get smartContract() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {proto.FileService}
     */
    get file() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {proto.ConsensusService}
     */
    get consensus() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {proto.FreezeService}
     */
    get freeze() {
        throw new Error("not implemented");
    }
}
