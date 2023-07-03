import * as rlp from "@ethersproject/rlp";
import * as hex from "./encoding/hex.js";
import EthereumTransactionData from "./EthereumTransactionData.js";
import CACHE from "./Cache.js";

/**
 * @typedef {object} EthereumTransactionDataEip2930JSON
 * @property {string} chainId
 * @property {string} nonce
 * @property {string} gasPrice
 * @property {string} gasLimit
 * @property {string} to
 * @property {string} value
 * @property {string} callData
 * @property {string[]} accessList
 * @property {string} recId
 * @property {string} r
 * @property {string} s
 */

export default class EthereumTransactionDataEip2930 extends EthereumTransactionData {
    /**
     * @private
     * @param {object} props
     * @param {Uint8Array} props.chainId
     * @param {Uint8Array} props.nonce
     * @param {Uint8Array} props.gasPrice
     * @param {Uint8Array} props.gasLimit
     * @param {Uint8Array} props.to
     * @param {Uint8Array} props.value
     * @param {Uint8Array} props.callData
     * @param {Uint8Array[]} props.accessList
     * @param {Uint8Array} props.recId
     * @param {Uint8Array} props.r
     * @param {Uint8Array} props.s
     */
    constructor(props) {
        super(props);

        this.chainId = props.chainId;
        this.nonce = props.nonce;
        this.gasPrice = props.gasPrice;
        this.gasLimit = props.gasLimit;
        this.to = props.to;
        this.value = props.value;
        this.accessList = props.accessList;
        this.recId = props.recId;
        this.r = props.r;
        this.s = props.s;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {EthereumTransactionData}
     */
    static fromBytes(bytes) {
        if (bytes.length === 0) {
            throw new Error("empty bytes");
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const decoded = /** @type {string[]} */ (rlp.decode(bytes.subarray(1)));

        if (!Array.isArray(decoded)) {
            throw new Error("ethereum data is not a list");
        }

        if (decoded.length !== 11) {
            throw new Error("invalid ethereum transaction data");
        }

        // TODO
        return new EthereumTransactionDataEip2930({
            chainId: hex.decode(/** @type {string} */ (decoded[0])),
            nonce: hex.decode(/** @type {string} */ (decoded[1])),
            gasPrice: hex.decode(/** @type {string} */ (decoded[2])),
            gasLimit: hex.decode(/** @type {string} */ (decoded[3])),
            to: hex.decode(/** @type {string} */ (decoded[4])),
            value: hex.decode(/** @type {string} */ (decoded[5])),
            callData: hex.decode(/** @type {string} */ (decoded[6])),
            // @ts-ignore
            accessList: /** @type {string[]} */ (decoded[7]).map((v) =>
                hex.decode(v)
            ),
            recId: hex.decode(/** @type {string} */ (decoded[8])),
            r: hex.decode(/** @type {string} */ (decoded[9])),
            s: hex.decode(/** @type {string} */ (decoded[10])),
        });
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        const encoded = rlp.encode([
            this.chainId,
            this.nonce,
            this.gasPrice,
            this.gasLimit,
            this.to,
            this.value,
            this.callData,
            this.accessList,
            this.recId,
            this.r,
            this.s,
        ]);
        return hex.decode("01" + encoded.substring(2));
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON(), null, 2);
    }

    /**
     * @returns {EthereumTransactionDataEip2930JSON}
     */
    toJSON() {
        return {
            chainId: hex.encode(this.chainId),
            nonce: hex.encode(this.nonce),
            gasPrice: hex.encode(this.gasPrice),
            gasLimit: hex.encode(this.gasLimit),
            to: hex.encode(this.to),
            value: hex.encode(this.value),
            callData: hex.encode(this.callData),
            accessList: this.accessList.map((v) => hex.encode(v)),
            recId: hex.encode(this.recId),
            r: hex.encode(this.r),
            s: hex.encode(this.s),
        };
    }
}

CACHE.setEthereumTransactionDataEip2930FromBytes((bytes) =>
    EthereumTransactionDataEip2930.fromBytes(bytes)
);
