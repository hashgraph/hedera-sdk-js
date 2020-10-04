/**
 * @internal
 * @abstract
 */
export default class Channel {
    /**
     * @param {string} address
     */
    constructor(address) {
        /**
         * @protected
         * @type {?import("@hashgraph/proto").CryptoService}
         */
        this._crypto = null;

        /**
         * @protected
         * @type {?import("@hashgraph/proto").SmartContractService}
         */
        this._smartContract = null;

        /**
         * @protected
         * @type {?import("@hashgraph/proto").FileService}
         */
        this._file = null;

        /**
         * @protected
         * @type {?import("@hashgraph/proto").ConsensusService}
         */
        this._consensus = null;

        /**
         * @protected
         * @type {?import("@hashgraph/proto").FreezeService}
         */
        this._freeze = null;

        /**
         * @protected
         * @type {?import("@hashgraph/proto").NetworkService}
         */
        this._network = null;
    }

    /**
     * @abstract
     * @returns {import("@hashgraph/proto").CryptoService}
     */
    get crypto() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {import("@hashgraph/proto").SmartContractService}
     */
    get smartContract() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {import("@hashgraph/proto").FileService}
     */
    get file() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {import("@hashgraph/proto").ConsensusService}
     */
    get consensus() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {import("@hashgraph/proto").FreezeService}
     */
    get freeze() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {import("@hashgraph/proto").NetworkService}
     */
    get network() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {import("../topic/SubscriptionHandle").default} _
     * @returns {import("@hashgraph/proto").MirrorConsensusService}
     */
    mirror(_) {
        throw new Error("not implemented");
    }
}
