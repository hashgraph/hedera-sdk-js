import {
    CryptoService,
    SmartContractService,
    FileService,
    ConsensusService,
    NetworkService,
    FreezeService,
    TokenService,
} from "@hashgraph/proto";

/**
 * @internal
 * @abstract
 */
export default class Channel {
    /**
     * @protected
     */
    constructor() {
        /**
         * @protected
         * @type {?CryptoService}
         */
        this._crypto = null;

        /**
         * @protected
         * @type {?SmartContractService}
         */
        this._smartContract = null;

        /**
         * @protected
         * @type {?FileService}
         */
        this._file = null;

        /**
         * @protected
         * @type {?ConsensusService}
         */
        this._consensus = null;

        /**
         * @protected
         * @type {?FreezeService}
         */
        this._freeze = null;

        /**
         * @protected
         * @type {?NetworkService}
         */
        this._network = null;

        /**
         * @protected
         * @type {?TokenService}
         */
        this._token = null;
    }

    /**
     * @abstract
     * @returns {void}
     */
    close() {
        throw new Error("not implemented");
    }

    /**
     * @returns {CryptoService}
     */
    get crypto() {
        if (this._crypto != null) {
            return this._crypto;
        }

        this._crypto = CryptoService.create(
            this._createUnaryClient("CryptoService")
        );

        return this._crypto;
    }

    /**
     * @returns {SmartContractService}
     */
    get smartContract() {
        if (this._smartContract != null) {
            return this._smartContract;
        }

        this._smartContract = SmartContractService.create(
            this._createUnaryClient("SmartContractService")
        );

        return this._smartContract;
    }

    /**
     * @returns {FileService}
     */
    get file() {
        if (this._file != null) {
            return this._file;
        }

        this._file = FileService.create(this._createUnaryClient("FileService"));

        return this._file;
    }

    /**
     * @returns {ConsensusService}
     */
    get consensus() {
        if (this._consensus != null) {
            return this._consensus;
        }

        this._consensus = ConsensusService.create(
            this._createUnaryClient("ConsensusService")
        );

        return this._consensus;
    }

    /**
     * @returns {FreezeService}
     */
    get freeze() {
        if (this._freeze != null) {
            return this._freeze;
        }

        this._freeze = FreezeService.create(
            this._createUnaryClient("FreezeService")
        );

        return this._freeze;
    }

    /**
     * @returns {NetworkService}
     */
    get network() {
        if (this._network != null) {
            return this._network;
        }

        this._network = NetworkService.create(
            this._createUnaryClient("NetworkService")
        );

        return this._network;
    }

    /**
     * @returns {TokenService}
     */
    get token() {
        if (this._token != null) {
            return this._token;
        }

        this._token = TokenService.create(
            this._createUnaryClient("TokenService")
        );

        return this._token;
    }

    /**
     * @abstract
     * @protected
     * @param {string} serviceName
     * @returns {import("@hashgraph/protobufjs").RPCImpl}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createUnaryClient(serviceName) {
        throw new Error("not implemented");
    }
}
