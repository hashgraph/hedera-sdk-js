import AccountId from "./AccountId.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IGrantedCryptoAllowance} HashgraphProto.proto.IGrantedCryptoAllowance
 * @typedef {import("@hashgraph/proto").proto.ICryptoRemoveAllowance} HashgraphProto.proto.ICryptoRemoveAllowance
 * @typedef {import("@hashgraph/proto").proto.ICryptoAllowance} HashgraphProto.proto.ICryptoAllowance
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 */

/**
 * @typedef {import("long")} Long
 */

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

export default class HbarAllowance {
    /**
     * @internal
     * @param {object} props
     * @param {AccountId | null} props.spenderAccountId
     * @param {AccountId | null} props.ownerAccountId
     * @param {Hbar | null} props.amount
     */
    constructor(props) {
        /**
         * The account ID of the hbar allowance spender.
         *
         * @readonly
         */
        this.spenderAccountId = props.spenderAccountId;

        /**
         * The account ID of the hbar allowance owner.
         *
         * @readonly
         */
        this.ownerAccountId = props.ownerAccountId;

        /**
         * The current balance of the spender's allowance in tinybars.
         *
         * @readonly
         */
        this.amount = props.amount;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ICryptoAllowance} allowance
     * @returns {HbarAllowance}
     */
    static _fromProtobuf(allowance) {
        return new HbarAllowance({
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {HashgraphProto.proto.IAccountID} */ (
                    allowance.spender
                )
            ),
            ownerAccountId:
                allowance.owner != null
                    ? AccountId._fromProtobuf(
                          /**@type {HashgraphProto.proto.IAccountID}*/ (
                              allowance.owner
                          )
                      )
                    : null,
            amount: Hbar.fromTinybars(
                allowance.amount != null ? allowance.amount : 0
            ),
        });
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IGrantedCryptoAllowance} allowance
     * @param {AccountId} ownerAccountId
     * @returns {HbarAllowance}
     */
    static _fromGrantedProtobuf(allowance, ownerAccountId) {
        return new HbarAllowance({
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {HashgraphProto.proto.IAccountID} */ (
                    allowance.spender
                )
            ),
            ownerAccountId,
            amount: Hbar.fromTinybars(
                allowance.amount != null ? allowance.amount : 0
            ),
        });
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ICryptoRemoveAllowance} allowance
     * @returns {HbarAllowance}
     */
    static _fromRemoveProtobuf(allowance) {
        return new HbarAllowance({
            spenderAccountId: null,
            ownerAccountId:
                allowance.owner != null
                    ? AccountId._fromProtobuf(
                          /**@type {HashgraphProto.proto.IAccountID}*/ (
                              allowance.owner
                          )
                      )
                    : null,
            amount: null,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ICryptoAllowance}
     */
    _toProtobuf() {
        return {
            spender:
                this.spenderAccountId != null
                    ? this.spenderAccountId._toProtobuf()
                    : null,
            owner:
                this.ownerAccountId != null
                    ? this.ownerAccountId._toProtobuf()
                    : null,
            amount: this.amount != null ? this.amount.toTinybars() : null,
        };
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this.spenderAccountId != null) {
            this.spenderAccountId.validateChecksum(client);
        }
    }

    /**
     * @returns {object}
     */
    toJSON() {
        return {
            ownerAccountId:
                this.ownerAccountId != null
                    ? this.ownerAccountId.toString()
                    : null,
            spenderAccountId:
                this.spenderAccountId != null
                    ? this.spenderAccountId.toString()
                    : null,
            amount: this.amount != null ? this.amount.toString() : null,
        };
    }
}
