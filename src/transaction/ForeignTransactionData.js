import * as proto from "@hashgraph/proto";
import Long from "long";
import {ForeignTransactionType} from "@hashgraph/proto";

/**
 * The client-generated ID for a transaction.
 *
 * This is used for retrieving receipts and records for a transaction, for appending to a file
 * right after creating it, for instantiating a smart contract with bytecode in a file just created,
 * and internally by the network for detecting when duplicate transactions are submitted.
 */
export default class ForeignTransactionData {
    /**
     * @param {?proto.ForeignTransactionType} foreignTransactionType
     * @param {?Uint8Array} foreignTransactionBytes
     * @param {?number} payloadStart
     * @param {?number} payloadLength
     * @param {?Long | number} nonce
     */

    /**
     * @param {object} [props]
     * @param {proto.ForeignTransactionType} [props.foreignTransactionType]
     * @param {Uint8Array} [props.foreignTransactionBytes]
     * @param {number} [props.payloadStart]
     * @param {number} [props.payloadLength]
     * @param {Long | number} [props.nonce]
     */
    constructor(props = {}) {
        /**
         * @private
         * @type {?proto.ForeignTransactionType}
         */
        this._foreignTransactionType = null;


        if (props.foreignTransactionType != null) {
            this.setForeignTransactionType(props.foreignTransactionType);
        }

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._foreignTransactionBytes = null;
        if (props.foreignTransactionBytes != null) {
            this.setForeignTransactionBytes(props.foreignTransactionBytes);
        }

        /**
         * @private
         * @type {?number}
         */
        this._payloadStart = null;
        if (props.payloadStart) {
            this.setPayloadStart(props.payloadStart);
        }

        /**
         * @private
         * @type {?number}
         */
        this._payloadLength = null;
        if (props.payloadLength != null) {
            this.setPayloadLength(props.payloadLength);
        }

        /**
         * @private
         * @type {?number}
         */
        this.nonce = null;
        if (props.nonce != null && props.nonce != 0) {
            this.setNonce(props.nonce);
        }

        Object.freeze(this);
    }

    /**
     * @param {proto.ForeignTransactionType} foreignTransactionType
     * @returns {ForeignTransactionData}
     */
    setForeignTransactionType(foreignTransactionType) {
        this._foreignTransactionType = foreignTransactionType;
        return this;
    }

    /**
     * @param {Uint8Array} foreignTransactionBytes
     * @returns {ForeignTransactionData}
     */
    setForeignTransactionBytes(foreignTransactionBytes) {
        this._foreignTransactionBytes = foreignTransactionBytes;
        return this;
    }

    /**
     * @param {number} payloadStart
     * @returns {ForeignTransactionData}
     */
    setPayloadStart(payloadStart) {
        this._payloadStart = typeof payloadStart === "number" ? payloadStart : null;
        return this;
    }

    /**
     * @param {number} payloadLength
     * @returns {ForeignTransactionData}
     */
    setPayloadLength(payloadLength) {
        this._payloadLength = typeof payloadLength === "number" ? payloadLength : null;
        return this;
    }

    /**
     * @param {Long | number} nonce
     * @returns {ForeignTransactionData}
     */
    setNonce(nonce) {
        this._nonce = typeof nonce === "number" ? Long.fromNumber(nonce) : nonce;
        return this;
    }

    /**
     * @internal
     * @param {proto.IForeignTransactionData} foreignTransactionData
     * @returns {ForeignTransactionData}
     */
    static _fromProtobuf(foreignTransactionData) {
        if (foreignTransactionData.foreignTransactionType != null
            && foreignTransactionData.foreignTransactionBytes instanceof Uint8Array
            && foreignTransactionData.nonce != null
            && foreignTransactionData.payloadStart
            && foreignTransactionData.payloadLength) {
            return new ForeignTransactionData()
                .setForeignTransactionType(foreignTransactionData.foreignTransactionType)
                .setForeignTransactionBytes(foreignTransactionData.foreignTransactionBytes)
                .setPayloadStart(foreignTransactionData.payloadStart)
                .setPayloadLength(foreignTransactionData.payloadLength)
                .setNonce(foreignTransactionData.nonce);
        } else {
            throw new Error(
                "Neither `nonce` or `foreignTransactionBytes` or `payloadStart` or `payloadLength` are set"
            );
        }
    }

    /**
     * @internal
     * @returns {proto.IForeignTransactionData}
     */
    _toProtobuf() {
        return {
            foreignTransactionType:
                this._foreignTransactionType != null ? this._foreignTransactionType : null,
            foreignTransactionBytes:
                this._foreignTransactionBytes != null ? this._foreignTransactionBytes : null,
            payloadStart:
                this._payloadStart != null ? this._payloadStart : null,
            payloadLength:
                this._payloadLength != null ? this._payloadLength : null,
            nonce:
                this.nonce != null ? Long.fromNumber(this.nonce) : null,
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {ForeignTransactionData}
     */
    static fromBytes(bytes) {
        return ForeignTransactionData._fromProtobuf(proto.ForeignTransactionData.decode(bytes));
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.ForeignTransactionData.encode(this._toProtobuf()).finish();
    }
}
