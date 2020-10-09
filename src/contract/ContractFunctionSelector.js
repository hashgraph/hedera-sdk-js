import { keccak256 } from "../cryptography/keccak.js";

/**
 * @enum {number}
 */
export const ArgumentType = {
    uint8: 0,
    int8: 1,
    uint16: 2,
    int16: 3,
    uint32: 4,
    int32: 5,
    uint64: 6,
    int64: 7,
    uint256: 8,
    int256: 9,
    string: 10,
    bool: 11,
    bytes: 12,
    bytes32: 13,
    address: 14,
    func: 15,
};

/**
 * @typedef {object} Argument
 * @property {boolean} dynamic
 * @property {Uint8Array} value
 */

/**
 * @typedef {object} SolidityType
 * @property {ArgumentType} ty
 * @property {boolean} array
 */

export default class ContractFunctionSelector {
    /**
     * @param {string} [name]
     */
    constructor(name) {
        /**
         * @type {?string}
         */
        this.name = null;

        /**
         * @type {string}
         */
        this._params = "";

        /**
         * @type {SolidityType[]}
         */
        this._paramTypes = [];

        if (name != null) {
            this._name = name;
        }
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addString() {
        return this._addParam({ ty: ArgumentType.string, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addStringArray() {
        return this._addParam({ ty: ArgumentType.string, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addBytes() {
        return this._addParam({ ty: ArgumentType.bytes, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addBytes32() {
        return this._addParam({ ty: ArgumentType.bytes32, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addBytesArray() {
        return this._addParam({ ty: ArgumentType.bytes, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addBytes32Array() {
        return this._addParam({ ty: ArgumentType.bytes32, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addInt8() {
        return this._addParam({ ty: ArgumentType.int8, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addInt32() {
        return this._addParam({ ty: ArgumentType.int32, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addInt64() {
        return this._addParam({ ty: ArgumentType.int64, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addInt256() {
        return this._addParam({ ty: ArgumentType.int256, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addInt8Array() {
        return this._addParam({ ty: ArgumentType.int8, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addInt32Array() {
        return this._addParam({ ty: ArgumentType.int32, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addInt64Array() {
        return this._addParam({ ty: ArgumentType.int64, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addInt256Array() {
        return this._addParam({ ty: ArgumentType.int256, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addUint8() {
        return this._addParam({ ty: ArgumentType.uint8, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addUint32() {
        return this._addParam({ ty: ArgumentType.uint32, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addUint64() {
        return this._addParam({ ty: ArgumentType.uint64, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addUint256() {
        return this._addParam({ ty: ArgumentType.uint256, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addUint8Array() {
        return this._addParam({ ty: ArgumentType.uint8, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addUint32Array() {
        return this._addParam({ ty: ArgumentType.uint32, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addUint64Array() {
        return this._addParam({ ty: ArgumentType.uint64, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addUint256Array() {
        return this._addParam({ ty: ArgumentType.uint256, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addBool() {
        return this._addParam({ ty: ArgumentType.bool, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addAddress() {
        return this._addParam({ ty: ArgumentType.address, array: false });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addAddressArray() {
        return this._addParam({ ty: ArgumentType.address, array: true });
    }

    /**
     * @returns {ContractFunctionSelector}
     */
    addFunction() {
        return this._addParam({ ty: ArgumentType.func, array: false });
    }

    /**
     * @param {SolidityType} ty
     * @returns {ContractFunctionSelector}
     */
    _addParam(ty) {
        if (this._paramTypes.length > 0) {
            this._params += ",";
        }

        this._params += solidityTypeToString(ty);
        this._paramTypes.push(ty);

        return this;
    }

    /**
     * @param {string} [name]
     * @returns {Uint8Array}
     */
    _build(name) {
        if (name != null) {
            this._name = name;
        } else if (this._name == null) {
            throw new Error("`name` required for ContractFunctionSelector");
        }

        return new Uint8Array(keccak256(this.toString()).slice(0, 4));
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this._name != null ? this._name.toString() : ""}(${
            this._params
        })`;
    }
}

/**
 * @param {SolidityType} ty
 * @returns {string}
 */
function solidityTypeToString(ty) {
    let s = "";
    switch (ty.ty) {
        case ArgumentType.uint8:
            s = "uint8";
            break;
        case ArgumentType.int8:
            s = "int8";
            break;
        case ArgumentType.uint16:
            s = "uint16";
            break;
        case ArgumentType.int16:
            s = "int16";
            break;
        case ArgumentType.uint32:
            s = "uint32";
            break;
        case ArgumentType.int32:
            s = "int32";
            break;
        case ArgumentType.uint64:
            s = "uint64";
            break;
        case ArgumentType.int64:
            s = "int64";
            break;
        case ArgumentType.uint256:
            s = "uint256";
            break;
        case ArgumentType.int256:
            s = "int256";
            break;
        case ArgumentType.string:
            s = "string";
            break;
        case ArgumentType.bool:
            s = "bool";
            break;
        case ArgumentType.bytes:
            s = "bytes";
            break;
        case ArgumentType.bytes32:
            s = "bytes32";
            break;
        case ArgumentType.address:
            s = "address";
            break;
        case ArgumentType.func:
            s = "function";
            break;
        default:
            s = "";
            break;
    }

    if (ty.array) {
        s += "[]";
    }

    return s;
}
