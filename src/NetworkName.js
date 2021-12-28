const DEFAULT_ERROR = "Default case reached for: ";

export default class NetworkName {
    /**
     * @hideconstructor
     * @internal
     * @param {number|string} networkId
     */
    constructor(networkId) {
        /**
         * @readonly
         * @type {number}
         */
        this._networkId =
            typeof networkId == "string" ? parseInt(networkId) : networkId;

        /**
         * @readonly
         * @type {string}
         */
        this._networkName = NetworkName.networkNameFromId(this._networkId);

        Object.freeze(this);
    }

    /**
     * @returns {number}
     */
    get networkId() {
        return this._networkId;
    }

    /**
     * @returns {string}
     */
    get networkName() {
        return this._networkName;
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.networkId.toString();
    }

    /**
     * @param {string} networkNameOrId
     * @returns {NetworkName}
     */
    static fromString(networkNameOrId) {
        switch (networkNameOrId) {
            case "0":
            case NetworkName.MAINNET:
                return new NetworkName(0);
            case "1":
            case NetworkName.TESTNET:
                return new NetworkName(1);
            case "2":
            case NetworkName.PREVIEWNET:
                return new NetworkName(2);
            default:
                throw new Error(DEFAULT_ERROR.concat("fromString"));
        }
    }

    /**
     * @param {string|number} networkId
     * @returns {Uint8Array}
     */
    static networkIdToProtobuf(networkId) {
        return new Uint8Array(
            typeof networkId != "string" ? [networkId] : [parseInt(networkId)]
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toProtobuf() {
        // TODO
        // rename?
        return new Uint8Array([this._networkId]);
    }

    /**
     * @param {Uint8Array} networkName
     * @returns {NetworkName}
     */
    static fromProtobuf(networkName) {
        // TODO
        // rename?
        return this.fromNetworkId(networkName[0]);
    }

    /**
     * @param {number|string} networkId
     * @returns {NetworkName}
     */
    static fromNetworkId(networkId) {
        switch (networkId) {
            case 0:
            case "0":
                return new NetworkName(0);
            case 1:
            case "1":
                return new NetworkName(1);
            case 2:
            case "2":
                return new NetworkName(2);
            default:
                throw new Error(DEFAULT_ERROR.concat("fromNetworkId"));
        }
    }

    /**
     * @param {string} networkName
     * @returns {NetworkName}
     */
    static fromNetworkName(networkName) {
        switch (networkName) {
            case NetworkName.MAINNET:
                return new NetworkName(0);
            case NetworkName.TESTNET:
                return new NetworkName(1);
            case NetworkName.PREVIEWNET:
                return new NetworkName(2);
            default:
                throw new Error(DEFAULT_ERROR.concat("fromNetworkName"));
        }
    }

    /**
     * @param {string} networkName
     * @returns {number}
     */
    static networkIdFromName(networkName) {
        switch (networkName) {
            case NetworkName.MAINNET:
                return 0;
            case NetworkName.TESTNET:
                return 1;
            case NetworkName.PREVIEWNET:
                return 2;
            default:
                throw new Error(DEFAULT_ERROR.concat("networkIdFromName"));
        }
    }

    /**
     * @param {number|string} networkId
     * @returns {string}
     */
    static networkNameFromId(networkId) {
        switch (networkId) {
            case 0:
            case "0":
                return NetworkName.MAINNET;
            case 1:
            case "1":
                return NetworkName.TESTNET;
            case 2:
            case "2":
                return NetworkName.PREVIEWNET;
            default:
                throw new Error(DEFAULT_ERROR.concat("networkNameFromId"));
        }
    }
}

NetworkName.MAINNET = "mainnet";

NetworkName.TESTNET = "testnet";

NetworkName.PREVIEWNET = "previewnet";
