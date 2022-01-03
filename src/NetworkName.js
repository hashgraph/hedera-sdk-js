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
        this._networkName = NetworkName.NETNAMES.includes(
            networkName.toString()
        )
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
            case NetworkName.NETNAMES[0]:
            case "0":
                return NetworkName.MAINNET;
            case NetworkName.NETNAMES[1]:
            case "1":
                return NetworkName.TESTNET;
            case NetworkName.NETNAMES[2]:
            case "2":
                return NetworkName.PREVIEWNET;
            case NetworkName.NETNAMES[3]:
            case "3":
                return NetworkName.OTHER;
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

        if (NetworkName.NETNAMES.includes(ledgerId.toString())) {
            //if LedgerId was constructed with a network name, return name
            return ledgerId.toString();
        }

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
                return NetworkName.NETNAMES[3];
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
                return 3;
        }
    }
}

NetworkName.NETNAMES = ["mainnet", "testnet", "previewnet", "other"];

NetworkName.MAINNET = new NetworkName("mainnet");

NetworkName.TESTNET = new NetworkName("testnet");

NetworkName.PREVIEWNET = new NetworkName("previewnet");

NetworkName.OTHER = new NetworkName("other");
