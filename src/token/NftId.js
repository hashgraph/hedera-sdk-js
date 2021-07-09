import * as proto from "@hashgraph/proto";
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
     * @param {number | Long} serial
     */
    constructor(token, serial) {
        this.tokenId = token;
        this.serial =
            typeof serial === "number" ? Long.fromNumber(serial) : serial;

        Object.freeze(this);
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

        const serial = Long.fromString(strings[0]);
        const token = TokenId.fromString(strings[1]);

        return new NftId(token, serial);
    }

    /**
     * @internal
     * @param {proto.INftID} id
     * @param {(string | null)=} ledgerId
     * @returns {NftId}
     */
    static _fromProtobuf(id, ledgerId) {
        return new NftId(
            TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (id.tokenID),
                ledgerId
            ),
            id.serialNumber != null ? id.serialNumber : Long.ZERO
        );
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
            serialNumber: Long.fromValue(
                this.serial !== undefined ? this.serial : 0
            ),
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
