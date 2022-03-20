import ContractLogInfo from "./ContractLogInfo.js";
import ContractId from "./ContractId.js";
import BigNumber from "bignumber.js";
import * as hex from "../encoding/hex.js";
import * as utf8 from "../encoding/utf8.js";
import * as util from "../util.js";
import Long from "long";
import ContractStateChange from "./ContractStateChange.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IContractFunctionResult} HashgraphProto.proto.IContractFunctionResult
 * @typedef {import("@hashgraph/proto").proto.IContractID} HashgraphProto.proto.IContractID
 */
/**
 * The result returned by a call to a smart contract function. This is part of the response to
 * a ContractCallLocal query, and is in the record for a ContractCall or ContractCreateInstance
 * transaction. The ContractCreateInstance transaction record has the results of the call to
 * the constructor.
 */
export default class ContractFunctionResult {
    /**
     * Constructor isn't part of the stable API
     *
     * @param {object} result
     * @param {?ContractId} result.contractId
     * @param {?string} result.errorMessage
     * @param {Uint8Array} result.bloom
     * @param {Long} result.gasUsed
     * @param {ContractLogInfo[]} result.logs
     * @param {ContractId[]} result.createdContractIds
     * @param {Uint8Array | null} result.evmAddress
     * @param {ContractStateChange[]} result.stateChanges
     * @param {Uint8Array} result.bytes
     */
    constructor(result) {
        /**
         * The smart contract instance whose function was called.
         */
        this.contractId = result.contractId;

        this.bytes = result.bytes;

        /**
         * Message In case there was an error during smart contract execution.
         */
        this.errorMessage = result.errorMessage;

        /**
         * Bloom filter for record
         */
        this.bloom = result.bloom;

        /**
         * Units of gas used  to execute contract.
         */
        this.gasUsed = result.gasUsed;

        /**
         * The log info for events returned by the function.
         */
        this.logs = result.logs;

        /**
         * @deprecated the list of smart contracts that were created by the function call.
         *
         * The created ids will now _also_ be externalized through internal transaction
         * records, where each record has its alias field populated with the new contract's
         * EVM address. (This is needed for contracts created with CREATE2, since
         * there is no longer a simple relationship between the new contract's 0.0.X id
         * and its Solidity address.)
         */
        // eslint-disable-next-line deprecation/deprecation
        this.createdContractIds = result.createdContractIds;

        this.evmAddress = result.evmAddress;

        this.stateChanges = result.stateChanges;
    }

    /**
     * @param {HashgraphProto.proto.IContractFunctionResult} result
     * @returns {ContractFunctionResult}
     */
    static _fromProtobuf(result) {
        const contractId =
            /** @type {HashgraphProto.proto.IContractID | null} */ (
                result.contractID
            );
        const gas = /** @type {Long | number} */ (result.gasUsed);

        return new ContractFunctionResult({
            bytes: /** @type {Uint8Array} */ (result.contractCallResult),
            contractId:
                contractId != null
                    ? ContractId._fromProtobuf(contractId)
                    : null,
            errorMessage:
                result.errorMessage != null ? result.errorMessage : null,
            bloom: /** @type {Uint8Array} */ (result.bloom),
            gasUsed: gas instanceof Long ? gas : Long.fromValue(gas),
            logs: (result.logInfo != null ? result.logInfo : []).map((info) =>
                ContractLogInfo._fromProtobuf(info)
            ),
            createdContractIds: (result.createdContractIDs != null
                ? result.createdContractIDs
                : []
            ).map((contractId) => ContractId._fromProtobuf(contractId)),
            evmAddress:
                result.evmAddress != null && result.evmAddress.value != null
                    ? result.evmAddress.value
                    : null,
            stateChanges: (result.stateChanges != null
                ? result.stateChanges
                : []
            ).map((change) => ContractStateChange._fromProtobuf(change)),
        });
    }

    /**
     * @returns {Uint8Array}
     */
    asBytes() {
        return this.bytes;
    }

    /**
     * @param {number} [index]
     * @returns {string}
     */
    getString(index) {
        return utf8.decode(this.getBytes(index));
    }

    /**
     * @private
     * @param {number} [index]
     * @returns {Uint8Array}
     */
    getBytes(index) {
        // Len should never be larger than Number.MAX
        // index * 32 is the position of the lenth
        // (index + 1) * 32 onward to (index + 1) * 32 + len will be the elements of the array
        // Arrays in solidity cannot be longer than 1024:
        // https://solidity.readthedocs.io/en/v0.4.21/introduction-to-smart-contracts.html
        const offset = this.getInt32(index);
        const len = util.safeView(this.bytes).getInt32(offset + 28);

        return this.bytes.subarray(offset + 32, offset + 32 + len);
    }

    /**
     * @param {number} [index]
     * @returns {Uint8Array}
     */
    getBytes32(index) {
        return this.bytes.subarray(
            (index != null ? index : 0) * 32,
            (index != null ? index : 0) * 32 + 32
        );
    }

    /**
     * @param {number} [index]
     * @returns {boolean}
     */
    getBool(index) {
        return this.bytes[(index != null ? index : 0) * 32 + 31] !== 0;
    }

    /**
     * @param {number} [index]
     * @returns {number}
     */
    getInt8(index) {
        return this.bytes[(index != null ? index : 0) * 32 + 31];
    }

    /**
     * @param {number} [index]
     * @returns {number}
     */
    getUint8(index) {
        return this.bytes[(index != null ? index : 0) * 32 + 31];
    }

    /**
     * @param {number} [index]
     * @returns {number}
     */
    getInt32(index) {
        // .getInt32() interprets as big-endian
        // Using DataView instead of Uint32Array because the latter interprets
        // using platform endianness which is little-endian on x86
        const position = (index != null ? index : 0) * 32 + 28;
        return util.safeView(this.bytes).getInt32(position);
    }

    /**
     * @param {number} [index]
     * @returns {number}
     */
    getUint32(index) {
        // .getUint32() interprets as big-endian
        // Using DataView instead of Uint32Array because the latter interprets
        // using platform endianness which is little-endian on x86
        const position = (index != null ? index : 0) * 32 + 28;
        return util.safeView(this.bytes).getUint32(position);
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt40(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(27, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint40(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(27, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt48(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(26, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint48(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(26, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt56(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(25, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint56(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(25, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt64(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(24, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint64(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(24, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt72(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(23, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint72(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(23, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt80(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(22, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint80(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(22, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt88(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(21, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint88(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(21, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt96(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(20, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint96(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(20, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt104(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(19, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint104(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(19, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt112(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(18, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint112(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(18, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt120(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(17, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint120(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(17, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt128(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(16, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint128(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(16, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt136(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(15, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint136(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(15, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt144(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(14, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint144(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(14, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt152(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(13, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint152(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(13, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt160(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(12, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint160(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(12, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt168(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(11, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint168(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(11, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt176(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(10, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint176(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(10, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt184(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(9, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint184(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(9, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt192(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(8, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint192(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(8, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt200(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(7, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint200(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(7, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt208(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(6, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint208(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(6, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt216(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(5, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint216(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(5, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt224(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(4, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint224(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(4, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt232(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(3, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint232(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(3, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt240(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(2, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint240(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(2, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt248(index) {
        return new BigNumber(
            hex.encode(
                this._getBytes32(index != null ? index : 0).subarray(1, 32)
            ),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint248(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index).subarray(1, 32)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getInt256(index) {
        return new BigNumber(
            hex.encode(this._getBytes32(index != null ? index : 0)),
            16
        );
    }

    /**
     * @param {number} [index]
     * @returns {BigNumber}
     */
    getUint256(index) {
        return new BigNumber(hex.encode(this._getBytes32(index)), 16);
    }

    /**
     * @param {number} [index]
     * @returns {string}
     */
    getAddress(index) {
        return hex.encode(
            this.bytes.subarray(
                (index != null ? index : 0) * 32 + 12,
                (index != null ? index : 0) * 32 + 32
            )
        );
    }

    /**
     * @param {number} [index]
     * @returns {Uint8Array}
     */
    _getBytes32(index) {
        return this.bytes.subarray(
            (index != null ? index : 0) * 32,
            (index != null ? index : 0) * 32 + 32
        );
    }
}
