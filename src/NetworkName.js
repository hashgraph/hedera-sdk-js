import LedgerId from "./LedgerId.js";

const DEFAULT_ERROR = "Default case reached for: ";

/**
 * @private
 */
export default class NetworkName {
    /**
     * @hideconstructor
     * @internal
     * @param {string|number} networkName
     */
    constructor(networkName) {
        /**
         * 0, 1, 2 are translated to mainnet, testnet, and previewnet.
         * Other values are treated as "other".
         *
         * @readonly
         * @type {string|number}
         */
        this._networkName = NETNAMES.includes(networkName.toString())
            ? networkName
            : NetworkName.toName(networkName);

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
        return typeof this._networkName == "string"
            ? this._networkName
            : this._networkName.toString();
    }

    /**
     * @param {string} networkName
     * @returns {NetworkName}
     */
    static fromString(networkName) {
        switch (networkName) {
            case NETNAMES[0]:
            case "0":
                return MAINNET;
            case NETNAMES[1]:
            case "1":
                return TESTNET;
            case NETNAMES[2]:
            case "2":
                return PREVIEWNET;
            case NETNAMES[3]:
            case "3":
                return OTHER;
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
            ledgerId instanceof LedgerId ? ledgerId.toString() : ledgerId;

        if (NETNAMES.includes(ledgerId.toString())) {
            //if LedgerId was constructed with a network name, return name
            return ledgerId.toString();
        }

        switch (ledgerId) {
            case 0:
            case "0":
                return NETNAMES[0];
            case 1:
            case "1":
                return NETNAMES[1];
            case 2:
            case "2":
                return NETNAMES[2];
            default:
                return NETNAMES[3];
        }
    }

    /**
     * @param {string} networkName
     * @returns {number}
     */
    static toId(networkName) {
        switch (networkName) {
            case NETNAMES[0]:
                return 0;
            case NETNAMES[1]:
                return 1;
            case NETNAMES[2]:
                return 2;
            default:
                return 3;
        }
    }
}

const NETNAMES = ["mainnet", "testnet", "previewnet", "other"];

const MAINNET = new NetworkName("mainnet");

const TESTNET = new NetworkName("testnet");

const PREVIEWNET = new NetworkName("previewnet");

const OTHER = new NetworkName("other");
