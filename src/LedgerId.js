import * as hex from "./encoding/hex.js";

const DEFAULT_ERROR = "Default case reached for: ";

export default class LedgerId {
    /**
     * @hideconstructor
     * @internal
     * @param {Uint8Array} ledgerId
     */
    constructor(ledgerId) {
        /**
         * @readonly
         * @type {Uint8Array}
         */
        this._ledgerId = ledgerId;

        Object.freeze(this);
    }

    /**
     * @returns {Uint8Array}
     */
    get ledgerId() {
        return this._ledgerId;
    }

    /**
     * @param {string} ledgerId
     * @returns {LedgerId}
     */
    static fromString(ledgerId) {
        ledgerId =
            hex.decode(ledgerId).toString().length >= 1
                ? hex.decode(ledgerId).toString()
                : ledgerId;

        switch (ledgerId) {
            case LedgerId.NETNAMES[0]:
            case "0":
                return LedgerId.MAINNET;
            case LedgerId.NETNAMES[1]:
            case "1":
                return LedgerId.TESTNET;
            case LedgerId.NETNAMES[2]:
            case "2":
                return LedgerId.PREVIEWNET;
            default:
                throw new Error(
                    DEFAULT_ERROR.concat("fromString: ledgerId = ").concat(
                        ledgerId
                    )
                );
        }
    }

    /**
     * If the ledger ID is a known value such as `[0]`, `[1]`, `[2]` this method
     * will instead return "mainnet", "testnet", or "previewnet", otherwise it will
     * hex encode the bytes.
     *
     * @returns {string}
     */
    toString() {
        switch (this._ledgerId[0]) {
            case 0:
                return LedgerId.NETNAMES[0];
            case 1:
                return LedgerId.NETNAMES[1];
            case 2:
                return LedgerId.NETNAMES[2];
            default:
                return hex.encode(this._ledgerId);
        }
    }

    /**
     * Using the UTF-8 byte representation of "mainnet", "testnet",
     * or "previewnet" is NOT supported.
     *
     * @param {Uint8Array} bytes
     * @returns {LedgerId}
     */
    static fromBytes(bytes) {
        return new LedgerId(bytes);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return this._ledgerId;
    }

    /**
     * @returns {boolean}
     */
    isMainnet() {
        return this.toString() == LedgerId.NETNAMES[0];
    }

    /**
     * @returns {boolean}
     */
    isTestnet() {
        return this.toString() == LedgerId.NETNAMES[1];
    }

    /**
     * @returns {boolean}
     */
    isPreviewnet() {
        return this.toString() == LedgerId.NETNAMES[2];
    }
}

LedgerId.MAINNET = new LedgerId(new Uint8Array([0]));

LedgerId.TESTNET = new LedgerId(new Uint8Array([1]));

LedgerId.PREVIEWNET = new LedgerId(new Uint8Array([2]));

LedgerId.NETNAMES = ["mainnet", "testnet", "previewnet"];
