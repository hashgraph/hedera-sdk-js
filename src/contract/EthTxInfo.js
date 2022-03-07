import { Buffer } from "buffer";
import RLP from "rlp";
import keccak256 from "keccak256";
import secp256k1 from "secp256k1";

export default class EthTxInfo {
    /**
     * @param {object} props
     * @param {string} props.transaction
     * @param {Uint8Array} props.chainId
     * @param {number} props.nonce
     * @param {BigInt} props.maxPriortyFee
     * @param {BigInt} props.maxGasFee
     * @param {BigInt} props.gasPrice
     * @param {number} props.gasLimit
     * @param {Uint8Array} props.receiver
     * @param {BigInt} props.amount
     * @param {Uint8Array} props.callData
     * @param {number} props.callDataStart
     * @param {number} props.callDataLength
     * @param {number} props.recId
     * @param {Uint8Array} props.r
     * @param {Uint8Array} props.s
     * @param {string} props.senderAddress
     * @param {Uint8Array} props.senderPubKey
     */
    constructor(props) {
        /**
         * Address of a contract that emitted the event.
         *
         * @readonly
         * @type {Uint8Array}
         */
        this.receiver = props.receiver;

        /**
         * //TODO doc transaction
         *
         * @readonly
         * @type {string}
         */
        this.transaction = props.transaction;
        /**
         * //TODO doc chainId
         *
         * @readonly
         * @type {Uint8Array}
         */
        this.chainId = props.chainId;
        /**
         * //TODO doc nonce
         *
         * @readonly
         * @type {number}
         */
        this.nonce = props.nonce;
        /**
         * //TODO doc maxPriortyFee
         *
         * @readonly
         * @type {BigInt}
         */
        this.maxPriortyFee = props.maxPriortyFee;
        /**
         * //TODO doc maxGasFee
         *
         * @readonly
         * @type {BigInt}
         */
        this.maxGasFee = props.maxGasFee;
        /**
         * //TODO doc gasPrice
         *
         * @readonly
         * @type {BigInt}
         */
        this.gasPrice = props.gasPrice;
        /**
         * //TODO doc gasLimit
         *
         * @readonly
         * @type {number}
         */
        this.gasLimit = props.gasLimit;
        /**
         * //TODO doc receiver
         *
         * @readonly
         * @type {Uint8Array}
         */
        this.receiver = props.receiver;
        /**
         * //TODO doc amount
         *
         * @readonly
         * @type {BigInt}
         */
        this.amount = props.amount;
        /**
         * //TODO doc callData
         *
         * @readonly
         * @type {Uint8Array}
         */
        this.callData = props.callData;
        /**
         * //TODO doc callDataStart
         *
         * @readonly
         * @type {number}
         */
        this.callDataStart = props.callDataStart;
        /**
         * //TODO doc callDataLength
         *
         * @readonly
         * @type {number}
         */
        this.callDataLength = props.callDataLength;
        /**
         * //TODO doc recId
         *
         * @readonly
         * @type {number}
         */
        this.recId = props.recId;
        /**
         * //TODO doc r
         *
         * @readonly
         * @type {Uint8Array}
         */
        this.r = props.r;
        /**
         * //TODO doc s
         *
         * @readonly
         * @type {Uint8Array}
         */
        this.s = props.s;
        /**
         * //TODO doc senderAddress
         *
         * @readonly
         * @type {string}
         */
        this.senderAddress = props.senderAddress;
        /**
         * //TODO doc senderPubKey
         *
         * @readonly
         * @type {Uint8Array}
         */
        this.senderPubKey = props.senderPubKey;
    }

    /**
     *
     * @param {string} foreignTx
     * @returns {EthTxInfo}
     */
    static from(foreignTx) {
        if (foreignTx.startsWith("0x")) {
            foreignTx = foreignTx.slice(2);
        }
        if (foreignTx.startsWith("02")) {
            return this.fromEIP1559(foreignTx);
        } else {
            return this.fromFrontier(foreignTx);
        }
    }

    /**
     *
     * @param {string} foreignTx
     * @returns {EthTxInfo}
     */
    static fromFrontier(foreignTx) {
        var data = Buffer.from(foreignTx, "hex");

        var decoded = RLP.decode(Uint8Array.from(data));

        var nonce = ArrayBuffer.isView(decoded[0])
            ? Buffer.from(decoded[0]).readIntBE(0, decoded[0].length)
            : 0;

        var gasPrice = ArrayBuffer.isView(decoded[1])
            ? bufToBigint(decoded[1])
            : BigInt(0);

        var gasLimit = ArrayBuffer.isView(decoded[2])
            ? Buffer.from(decoded[2]).readIntBE(0, decoded[2].length)
            : 0;

        var receiver = ArrayBuffer.isView(decoded[3])
            ? Buffer.from(decoded[3])
            : Buffer.of();

        var amount = ArrayBuffer.isView(decoded[4])
            ? bufToBigint(Buffer.from(decoded[4]))
            : BigInt(0);

        var callData = ArrayBuffer.isView(decoded[5])
            ? Buffer.from(decoded[5])
            : Buffer.of();

        var callDataStart =
            callData != null
                ? Buffer.from(foreignTx, "hex").indexOf(callData)
                : -1;

        var callDataLength = callData != null ? callData.length : 0;

        var v = ArrayBuffer.isView(decoded[6])
            ? Buffer.from(decoded[6]).readIntBE(0, decoded[6].length)
            : 0;
        var recId = (v + 1) % 2;
        var chainId = v > 34 ? (v - 35 - recId) / 2 : 0;
        var chainIdHex = chainId.toString(16);
        if (chainIdHex.length % 2 == 1) {
            chainIdHex = "0" + chainIdHex;
        }

        var r = ArrayBuffer.isView(decoded[7])
            ? Buffer.from(decoded[7])
            : Buffer.of();

        var s = ArrayBuffer.isView(decoded[8])
            ? Buffer.from(decoded[8])
            : Buffer.of();

        var senderPubKey;

        if (
            chainId != null &&
            nonce != null &&
            gasPrice != null &&
            gasLimit != null &&
            receiver != null &&
            amount != null &&
            callData != null &&
            recId != null &&
            r != null &&
            s != null
        ) {
            senderPubKey = EthTxInfo.frontierRecoverEcdsaSecp256k1Key(
                chainId,
                nonce,
                gasPrice,
                gasLimit,
                receiver,
                amount,
                callData,
                recId,
                r,
                s
            );
        } else {
            senderPubKey = Buffer.of();
        }

        const uncompressedKey = secp256k1.publicKeyConvert(senderPubKey, false);
        const senderAddress = keccak256(Buffer.from(uncompressedKey.slice(1)))
            .slice(-20)
            .toString("hex");

        return new EthTxInfo({
            transaction: foreignTx,
            chainId: Buffer.from(chainIdHex, "hex"),
            nonce: nonce,
            maxPriortyFee: 0n,
            maxGasFee: 0n,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            receiver: receiver,
            amount: amount,
            callData: callData,
            callDataStart: callDataStart,
            callDataLength: callDataLength,
            recId: recId,
            r: r,
            s: s,
            senderAddress: senderAddress,
            senderPubKey: senderPubKey,
        });
    }

    /**
     *
     * @param {number} chainId
     * @param {number} nonce
     * @param {BigInt} gasPrice
     * @param {number} gasLimit
     * @param {Uint8Array} receiver
     * @param {BigInt} amount
     * @param {Uint8Array} callData
     * @param {number} recId
     * @param {Uint8Array} r
     * @param {Uint8Array} s
     * @reture {Uint8Array}
     */
    static frontierRecoverEcdsaSecp256k1Key(
        chainId,
        nonce,
        gasPrice,
        gasLimit,
        receiver,
        amount,
        callData,
        recId,
        r,
        s
    ) {
        var message = RLP.encode([
            nonce,
            gasPrice.valueOf(),
            gasLimit,
            receiver,
            amount.valueOf(),
            callData,
            chainId,
            0,
            0,
        ]);

        const signature = Buffer.concat([r, s]);

        const hash = keccak256(Buffer.from(message));

        const newPubKey = secp256k1.ecdsaRecover(
            signature,
            recId,
            Buffer.from(hash),
            true
        );

        return newPubKey;
    }

    /**
     *
     * @param {string} foreignTx
     * @returns {EthTxInfo}
     */
    static fromEIP1559(foreignTx) {
        var data = Buffer.from(foreignTx.substring(2), "hex");

        var decoded = RLP.decode(Uint8Array.from(data));

        var chainId = ArrayBuffer.isView(decoded[0])
            ? Buffer.from(decoded[0])
            : Buffer.of();

        var nonce = ArrayBuffer.isView(decoded[1])
            ? Buffer.from(decoded[1]).readIntBE(0, decoded[1].length)
            : 0;

        var maxPriorityFee = ArrayBuffer.isView(decoded[2])
            ? bufToBigint(decoded[2])
            : BigInt(0);

        var maxGasFee = ArrayBuffer.isView(decoded[3])
            ? bufToBigint(decoded[3])
            : BigInt(0);

        var gasLimit = ArrayBuffer.isView(decoded[4])
            ? Buffer.from(decoded[4]).readIntBE(0, decoded[4].length)
            : 0;

        var receiver = ArrayBuffer.isView(decoded[5])
            ? Buffer.from(decoded[5])
            : Buffer.of();

        var amount = ArrayBuffer.isView(decoded[6])
            ? bufToBigint(Buffer.from(decoded[6]))
            : BigInt(0);

        var callData = ArrayBuffer.isView(decoded[7])
            ? Buffer.from(decoded[7])
            : Buffer.of();

        var callDataStart =
            callData != null
                ? Buffer.from(foreignTx, "hex").indexOf(callData)
                : -1;

        var callDataLength = callData != null ? callData.length : 0;

        // fixme handle access list?
        // var accessList = decoded[8];

        var recId = 0;
        if (ArrayBuffer.isView(decoded[9])) {
            if (Buffer.from(decoded[9]).length === 0) {
                recId = 0;
            } else {
                recId = Buffer.from(decoded[9]).readIntBE(0, decoded[9].length);
            }
        }

        var r = ArrayBuffer.isView(decoded[10])
            ? Buffer.from(decoded[10])
            : Buffer.of();

        var s = ArrayBuffer.isView(decoded[11])
            ? Buffer.from(decoded[11])
            : Buffer.of();

        var senderPubKey;

        if (
            chainId != null &&
            nonce != null &&
            maxPriorityFee != null &&
            maxGasFee != null &&
            gasLimit != null &&
            receiver != null &&
            amount != null &&
            callData != null &&
            recId != null &&
            r != null &&
            s != null
        ) {
            senderPubKey = EthTxInfo.eip1559RecoverEcdsaSecp256k1Key(
                chainId,
                nonce,
                maxPriorityFee,
                maxGasFee,
                gasLimit,
                receiver,
                amount,
                callData,
                recId,
                r,
                s
            );
        } else {
            senderPubKey = Buffer.of();
        }

        const uncompressedKey = secp256k1.publicKeyConvert(senderPubKey, false);
        const senderAddress = keccak256(Buffer.from(uncompressedKey.slice(1)))
            .slice(-20)
            .toString("hex");

        return new EthTxInfo({
            transaction: foreignTx,
            chainId: chainId,
            nonce: nonce,
            maxPriortyFee: maxPriorityFee,
            maxGasFee: maxGasFee,
            gasPrice: 0n,
            gasLimit: gasLimit,
            receiver: receiver,
            amount: amount,
            callData: callData,
            callDataStart: callDataStart,
            callDataLength: callDataLength,
            recId: recId,
            r: r,
            s: s,
            senderAddress: senderAddress,
            senderPubKey: senderPubKey,
        });
    }

    /**
     *
     * @param {Uint8Array} chainId
     * @param {number} nonce
     * @param {BigInt} maxPriorityFee
     * @param {BigInt} maxGasFee
     * @param {number} gasLimit
     * @param {Uint8Array} receiver
     * @param {BigInt} amount
     * @param {Uint8Array} callData
     * @param {number} recId
     * @param {Uint8Array} r
     * @param {Uint8Array} s
     * @reture {Uint8Array}
     */
    static eip1559RecoverEcdsaSecp256k1Key(
        chainId,
        nonce,
        maxPriorityFee,
        maxGasFee,
        gasLimit,
        receiver,
        amount,
        callData,
        recId,
        r,
        s
    ) {
        var message = RLP.encode([
            chainId,
            nonce.valueOf(),
            maxPriorityFee.valueOf(),
            maxGasFee.valueOf(),
            gasLimit,
            receiver,
            amount.valueOf(),
            callData,
            [],
        ]);

        const zeroTwo = new Uint8Array([2]);

        message = Buffer.concat([zeroTwo, Buffer.from(message)]);

        const signature = Buffer.concat([r, s]);

        const hash = keccak256(Buffer.from(message));

        const newPubKey = secp256k1.ecdsaRecover(
            signature,
            recId,
            Buffer.from(hash),
            true
        );

        return newPubKey;
    }
}

/**
 *
 * @param buf {Uint8Array}
 * @returns {bigint}
 */
function bufToBigint(buf) {
    let bits = 8n;
    if (ArrayBuffer.isView(buf)) bits = BigInt(buf.BYTES_PER_ELEMENT * 8);
    else buf = new Uint8Array(buf);
    let ret = 0n;
    for (const i of buf.values()) {
        const bi = BigInt(i);
        ret = (ret << bits) + bi;
    }
    return ret;
}
