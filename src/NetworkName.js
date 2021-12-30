import LedgerId from "./LedgerId.js";

const DEFAULT_ERROR = "Default case reached for: ";

/**
 * @private
 */
export default class NetworkName {
    /**
     * @hideconstructor
     * @internal
     * @param {string} networkName
     */
    constructor(networkName) {
        /**
         * @readonly
         * @type {string}
         */
        this._networkName = networkName;

        Object.freeze(this);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return new Uint8Array([NetworkName.toId(this.toString())]);
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {NetworkName}
     */
    static fromBytes(bytes) {
        return NetworkName.fromString(NetworkName.toName(bytes.toString()));
    }

    /**
     * @returns {string}
     */
    toString() {
        return this._networkName;
    }

    /**
     * @param {string} networkName
     * @returns {NetworkName}
     */
    static fromString(networkName) {
        switch (networkName) {
            case NetworkName.NETNAMES[0]:
                return NetworkName.MAINNET;
            case NetworkName.NETNAMES[1]:
                return NetworkName.TESTNET;
            case NetworkName.NETNAMES[2]:
                return NetworkName.PREVIEWNET;
            default:
                throw new Error(
                    DEFAULT_ERROR.concat("fromString: networkName = ").concat(
                        networkName
                    )
                );
        }
    }

    /**
     * @param {LedgerId | number | string} ledgerId
     * @returns {string}
     */
    static toName(ledgerId) {
        ledgerId =
            ledgerId instanceof LedgerId
                ? ledgerId.ledgerId.toString()
                : ledgerId;
        switch (ledgerId) {
            case 0:
            case "0":
                return NetworkName.NETNAMES[0];
            case 1:
            case "1":
                return NetworkName.NETNAMES[1];
            case 2:
            case "2":
                return NetworkName.NETNAMES[2];
            default:
                throw new Error(DEFAULT_ERROR.concat("nameFromId"));
        }
    }

    /**
     * @param {string} networkName
     * @returns {number}
     */
    static toId(networkName) {
        switch (networkName) {
            case NetworkName.NETNAMES[0]:
                return 0;
            case NetworkName.NETNAMES[1]:
                return 1;
            case NetworkName.NETNAMES[2]:
                return 2;
            default:
                throw new Error(DEFAULT_ERROR.concat("idFromName"));
        }
    }

    /**
     * @returns {boolean}
     */
    isMainnet() {
        return this._networkName == NetworkName.NETNAMES[0];
    }

    /**
     * @returns {boolean}
     */
    isTestnet() {
        return this._networkName == NetworkName.NETNAMES[1];
    }

    /**
     * @returns {boolean}
     */
    isPreviewnet() {
        return this._networkName == NetworkName.NETNAMES[2];
    }
}

NetworkName.MAINNET = new NetworkName("mainnet");

NetworkName.TESTNET = new NetworkName("testnet");

NetworkName.PREVIEWNET = new NetworkName("previewnet");

NetworkName.NETNAMES = ["mainnet", "testnet", "previewnet"];
