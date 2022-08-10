import CACHE from "./Cache.js";

export default class EthereumTransactionData {
    /**
     * @protected
     * @param {object} props
     * @param {Uint8Array} props.callData
     */
    constructor(props) {
        this.callData = props.callData;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {EthereumTransactionData}
     */
    static fromBytes(bytes) {
        if (bytes.length === 0) {
            throw new Error("empty bytes");
        }

        if (bytes[0] != 2) {
            return CACHE.ethereumTransactionDataLegacyFromBytes(bytes);
        } else {
            return CACHE.ethereumTransactionDataEip1559FromBytes(bytes);
        }
    }

    // eslint-disable-next-line jsdoc/require-returns-check
    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        throw new Error("not implemented");
    }

    // eslint-disable-next-line jsdoc/require-returns-check
    /**
     * @returns {string}
     */
    toString() {
        throw new Error("not implemented");
    }

    // eslint-disable-next-line jsdoc/require-returns-check
    /**
     * @returns {{[key: string]: any}}
     */
    toJSON() {
        throw new Error("not implemented");
    }
}
