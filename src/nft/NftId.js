import * as proto from "../../packages/proto";
import TokenId from "../token/TokenId.js";
import Long from "long";

/**
 * The ID for a crypto-currency token on Hedera.
 *
 * @augments {EntityId<proto.INftID>}
 */
export default class NftId {
    /**
     * @param {TokenId} token
     * @param {(number | Long)=} serial
     */
    constructor( token, serial) {
        this.tokenId = token;
        if(serial !== undefined){
            this.serial = serial;
        } else {
            this.serial = 0
        }
    }

    /**
     * @param {string} text
     * @returns {NftId}
     */
    static fromString(text) {
        const strings = text.split("@");

        for (const string of strings) {
            if (string === "") {
                throw new Error("invalid format for NftId");
            }
        }

        const serial = Long.fromString(strings[0])
        const token = TokenId.fromString(strings[1])

        return new NftId(token, serial);
    }

    /**
     * @internal
     * @param {proto.INftID} id
     * @returns {NftId}
     */
    static _fromProtobuf(id) {
        return new NftId(
            TokenId._fromProtobuf(/** @type {proto.ITokenID} */ (id.tokenID)),
            id.serialNumber !== null ? id.serialNumber : 0);
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {NftId}
     */
    static fromBytes(bytes) {
        return NftId._fromProtobuf(proto.NftID.decode(bytes));
    }

    /**
     * @internal
     * @override
     * @returns {proto.INftID}
     */
    _toProtobuf() {
        return {
            tokenID: this.tokenId._toProtobuf(),
            serialNumber: Long.fromValue(this.serial !== undefined ? this.serial : 0),
        };
    }

    /**
     * @override
     * @returns {string}
     */
    toString() {
        return `${this.serial.toString()}@${this.tokenId.toString()}`;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.NftID.encode(this._toProtobuf()).finish();
    }
}
