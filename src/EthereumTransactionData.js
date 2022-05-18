import * as rlp from "@ethersproject/rlp";
import * as hex from "./encoding/hex.js";

/**
 * @typedef {object} EthereumTransactionDataJSON
 * @property {string=} nonce
 * @property {string=} gasPrice
 * @property {string=} gasLimit
 * @property {string=} to
 * @property {string=} value
 * @property {string=} callData
 * @property {string=} v
 * @property {string=} r
 * @property {string=} s
 * @property {string=} chainId
 * @property {string=} maxPriorityGas
 * @property {string=} maxGas
 * @property {string[]=} accessList
 * @property {string=} recId
 */

export default class EthereumTransactionData {
    /**
     * @private
     * @param {object} props
     * @param {object} [props.legacy]
     * @param {Uint8Array} props.legacy.nonce
     * @param {Uint8Array} props.legacy.gasPrice
     * @param {Uint8Array} props.legacy.gasLimit
     * @param {Uint8Array} props.legacy.to
     * @param {Uint8Array} props.legacy.value
     * @param {Uint8Array} props.legacy.callData
     * @param {Uint8Array} props.legacy.v
     * @param {Uint8Array} props.legacy.r
     * @param {Uint8Array} props.legacy.s
     * @param {object} [props.eip1559]
     * @param {Uint8Array} props.eip1559.chainId
     * @param {Uint8Array} props.eip1559.nonce
     * @param {Uint8Array} props.eip1559.maxPriorityGas
     * @param {Uint8Array} props.eip1559.maxGas
     * @param {Uint8Array} props.eip1559.gasLimit
     * @param {Uint8Array} props.eip1559.to
     * @param {Uint8Array} props.eip1559.value
     * @param {Uint8Array} props.eip1559.callData
     * @param {Uint8Array[]} props.eip1559.accessList
     * @param {Uint8Array} props.eip1559.recId
     * @param {Uint8Array} props.eip1559.r
     * @param {Uint8Array} props.eip1559.s
     */
    constructor(props = {}) {
        this.legacy = props.legacy;
        this.eip1559 = props.eip1559;
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const decoded = /** @type {string[]} */ (rlp.decode(bytes));

            if (decoded.length != 9) {
                throw new Error("invalid ethereum transaction data");
            }

            return new EthereumTransactionData({
                legacy: {
                    nonce: hex.decode(/** @type {string} */ (decoded[0])),
                    gasPrice: hex.decode(/** @type {string} */ (decoded[1])),
                    gasLimit: hex.decode(/** @type {string} */ (decoded[2])),
                    to: hex.decode(/** @type {string} */ (decoded[3])),
                    value: hex.decode(/** @type {string} */ (decoded[4])),
                    callData: hex.decode(/** @type {string} */ (decoded[5])),
                    v: hex.decode(/** @type {string} */ (decoded[6])),
                    r: hex.decode(/** @type {string} */ (decoded[7])),
                    s: hex.decode(/** @type {string} */ (decoded[8])),
                },
            });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const decoded = /** @type {string[]} */ (
                rlp.decode(bytes.subarray(1))
            );

            if (!Array.isArray(decoded)) {
                throw new Error("ethereum data is not a list");
            }

            if (decoded.length != 12) {
                throw new Error("invalid ethereum transaction data");
            }

            // TODO
            return new EthereumTransactionData({
                eip1559: {
                    chainId: hex.decode(/** @type {string} */ (decoded[0])),
                    nonce: hex.decode(/** @type {string} */ (decoded[1])),
                    maxPriorityGas: hex.decode(
                        /** @type {string} */ (decoded[2])
                    ),
                    maxGas: hex.decode(/** @type {string} */ (decoded[3])),
                    gasLimit: hex.decode(/** @type {string} */ (decoded[4])),
                    to: hex.decode(/** @type {string} */ (decoded[5])),
                    value: hex.decode(/** @type {string} */ (decoded[6])),
                    callData: hex.decode(/** @type {string} */ (decoded[7])),
                    // @ts-ignore
                    accessList: /** @type {string[]} */ (decoded[8]).map((v) =>
                        hex.decode(v)
                    ),
                    recId: hex.decode(/** @type {string} */ (decoded[9])),
                    r: hex.decode(/** @type {string} */ (decoded[10])),
                    s: hex.decode(/** @type {string} */ (decoded[11])),
                },
            });
        }
    }

    /**
     * @returns {Uint8Array}
     */
    get callData() {
        if (this.legacy != null) {
            return this.legacy.callData;
        } else if (this.eip1559 != null) {
            return this.eip1559.callData;
        } else {
            throw new Error("(BUG) ethereum data was not legacy or eip1559");
        }
    }

    /**
     * @param {Uint8Array} callData
     * @returns {this}
     */
    setCallData(callData) {
        if (this.legacy != null) {
            this.legacy.callData = callData;
        } else if (this.eip1559 != null) {
            this.eip1559.callData = callData;
        }

        return this;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        if (this.legacy != null) {
            return hex.decode(
                rlp.encode([
                    this.legacy.nonce,
                    this.legacy.gasPrice,
                    this.legacy.gasLimit,
                    this.legacy.to,
                    this.legacy.value,
                    this.legacy.callData,
                    this.legacy.v,
                    this.legacy.r,
                    this.legacy.s,
                ])
            );
        } else if (this.eip1559 != null) {
            const encoded = rlp.encode([
                this.eip1559.chainId,
                this.eip1559.nonce,
                this.eip1559.maxPriorityGas,
                this.eip1559.maxGas,
                this.eip1559.gasLimit,
                this.eip1559.to,
                this.eip1559.value,
                this.eip1559.callData,
                this.eip1559.accessList,
                this.eip1559.recId,
                this.eip1559.r,
                this.eip1559.s,
            ]);
            return hex.decode("02" + encoded.substring(2));
        } else {
            throw new Error("(BUG) ethereum data was not legacy or eip1559");
        }
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON(), null, 2);
    }

    /**
     * @returns {EthereumTransactionDataJSON}
     */
    toJSON() {
        if (this.legacy != null) {
            return {
                nonce: hex.encode(this.legacy.nonce),
                gasPrice: hex.encode(this.legacy.gasPrice),
                gasLimit: hex.encode(this.legacy.gasLimit),
                to: hex.encode(this.legacy.to),
                value: hex.encode(this.legacy.value),
                callData: hex.encode(this.legacy.callData),
                v: hex.encode(this.legacy.v),
                r: hex.encode(this.legacy.r),
                s: hex.encode(this.legacy.s),
            };
        } else if (this.eip1559 != null) {
            return {
                chainId: hex.encode(this.eip1559.chainId),
                nonce: hex.encode(this.eip1559.nonce),
                maxPriorityGas: hex.encode(this.eip1559.maxPriorityGas),
                maxGas: hex.encode(this.eip1559.maxGas),
                gasLimit: hex.encode(this.eip1559.gasLimit),
                to: hex.encode(this.eip1559.to),
                value: hex.encode(this.eip1559.value),
                callData: hex.encode(this.eip1559.callData),
                accessList: this.eip1559.accessList.map((v) => hex.encode(v)),
                recId: hex.encode(this.eip1559.recId),
                r: hex.encode(this.eip1559.r),
                s: hex.encode(this.eip1559.s),
            };
        } else {
            throw new Error("(BUG) ethereum data was not legacy or eip1559");
        }
    }
}
