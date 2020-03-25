import BigNumber from "bignumber.js";
import { ArgumentType, ContractFunctionSelector, SolidityType } from "./ContractFunctionSelector";
import * as utf8 from "@stablelib/utf8";
import * as hex from "@stablelib/hex";

interface Argument {
    dynamic: boolean;
    value: Uint8Array;
}

export class ContractFunctionParams {
    private readonly _selector: ContractFunctionSelector;
    private readonly _arguments: Argument[] = [];

    public constructor() {
        this._selector = new ContractFunctionSelector();
    }

    public addString(value: string): this {
        this._selector.addString();

        return this._addParam(value, true);
    }

    public addStringArray(value: string[]): this {
        this._selector.addStringArray();

        return this._addParam(value, true);
    }

    public addBytes(value: Uint8Array): this {
        this._selector.addBytes();

        return this._addParam(value, true);
    }

    public addBytes32(value: Uint8Array): this {
        if (value.length !== 32) {
            throw new Error(`addBytes32 expected array to be of length 32, but received ${value.length}`);
        }

        this._selector.addBytes32();

        return this._addParam(value, true);
    }

    public addBytesArray(value: Uint8Array[]): this {
        this._selector.addBytesArray();

        return this._addParam(value, true);
    }

    public addBytes32Array(value: Uint8Array[]): this {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [ _, entry ] of value.entries()) {
            if (entry.length !== 32) {
                throw new Error(`addBytes32 expected array to be of length 32, but received ${entry.length}`);
            }
        }

        this._selector.addBytes32Array();

        return this._addParam(value, true);
    }

    public addBool(value: boolean): this {
        this._selector.addBool();

        return this._addParam(value, false);
    }

    public addInt8(value: number): this {
        this._selector.addInt8();

        return this._addParam(value, false);
    }

    public addInt32(value: number): this {
        this._selector.addInt32();

        return this._addParam(value, false);
    }

    public addInt64(value: BigNumber): this {
        this._selector.addInt64();

        return this._addParam(value, false);
    }

    public addInt256(value: BigNumber): this {
        this._selector.addInt256();

        return this._addParam(value, false);
    }

    public addInt8Array(value: number[]): this {
        this._selector.addInt8Array();

        return this._addParam(value, true);
    }

    public addInt32Array(value: number[]): this {
        this._selector.addInt32Array();

        return this._addParam(value, true);
    }

    public addInt64Array(value: BigNumber[]): this {
        this._selector.addInt64Array();

        return this._addParam(value, true);
    }

    public addInt256Array(value: BigNumber[]): this {
        this._selector.addInt256Array();

        return this._addParam(value, true);
    }

    public addUint8(value: number): this {
        this._selector.addUint8();

        return this._addParam(value, false);
    }

    public addUint32(value: number): this {
        this._selector.addUint32();

        return this._addParam(value, false);
    }

    public addUint64(value: BigNumber): this {
        this._selector.addUint64();

        return this._addParam(value, false);
    }

    public addUint256(value: BigNumber): this {
        this._selector.addUint256();

        return this._addParam(value, false);
    }

    public addUint8Array(value: number[]): this {
        this._selector.addUint8Array();

        return this._addParam(value, true);
    }

    public addUint32Array(value: number[]): this {
        this._selector.addUint32Array();

        return this._addParam(value, true);
    }

    public addUint64Array(value: BigNumber[]): this {
        this._selector.addUint64Array();

        return this._addParam(value, true);
    }

    public addUint256Array(value: BigNumber[]): this {
        this._selector.addUint256Array();

        return this._addParam(value, true);
    }

    public addAddress(value: string): this {
        // Allow `0x` prefix
        if (value.length !== 40 && value.length !== 42) {
            throw new Error("`address` type requires parameter to be 40 or 42 characters");
        }

        const par = value.length === 40 ?
            hex.decode(value) :
            hex.decode(value.substring(2));

        this._selector.addAddress();

        return this._addParam(par, false);
    }

    public addAddressArray(value: string[]): this {
        const par: Uint8Array[] = [];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [ _, entry ] of value.entries()) {
            if (entry.length !== 40 && entry.length !== 42) {
                throw new Error("`address` type requires parameter to be 40 or 42 characters");
            }

            const buf = entry.length === 40 ?
                hex.decode(entry) :
                hex.decode(entry.substring(2));

            par.push(buf);
        }

        this._selector.addAddressArray();

        return this._addParam(par, true);
    }

    public addFunction(address: string, selector: ContractFunctionSelector): this {
        const addressParam = hex.decode(address);
        const functionSelector = selector._build(null);

        if (addressParam.length !== 20) {
            throw new Error("`function` type requires parameter `address` to be exactly 20 bytes");
        }

        this._selector.addFunction();

        const proto = new Uint8Array(24);
        proto.set(addressParam, 0);
        proto.set(functionSelector, 20);

        return this._addParam(proto, false);
    }

    private _addParam(
        param: string | boolean | number | Uint8Array | BigNumber |
        string[] | boolean[] | number[] | Uint8Array[] | BigNumber[],
        dynamic: boolean
    ): this {
        const index = this._selector._paramTypes.length - 1;
        const value = argumentToBytes(param, this._selector._paramTypes[ index ]);

        this._arguments.push({ dynamic, value });

        return this;
    }

    /**
     * NOT A STABLE API
     */
    public _build(name: string | null): Uint8Array {
        const includeId = name != null;
        const nameOffset = includeId ? 4 : 0;

        const length = this._arguments.length === 0 ?
            nameOffset :
            this._arguments.length * 32 + this._arguments
                .map((arg) => arg.dynamic ? arg.value.length : 0)
                .reduce((sum, value) => sum + value) + nameOffset;

        const func = new Uint8Array(length);

        if (includeId) {
            func.set(this._selector._build(name), 0);
        }

        let offset = 32 * this._arguments.length;

        for (const [ i, { dynamic, value }] of this._arguments.entries()) {
            if (dynamic) {
                const view = new DataView(func.buffer, nameOffset + i * 32 + 28);
                view.setUint32(0, offset);
                func.set(value, view.getUint32(0) + nameOffset);
                offset += value.length;
            } else {
                func.set(value, nameOffset + i * 32);
            }
        }

        return func;
    }
}

function argumentToBytes(
    param: string | boolean | number | Uint8Array | BigNumber |
    string[] | boolean[] | number[] | Uint8Array[] | BigNumber[],
    ty: SolidityType
): Uint8Array {
    let value = new Uint8Array(32);
    let valueView = new DataView(value.buffer, 0);

    if (ty.array) {
        if (!Array.isArray(param)) {
            throw new TypeError("SolidityType indicates type is array, but parameter is not an array");
        }

        const values: Uint8Array[] = [];

        // Generic over any type of array
        // Destructuring required so the first variable must be assigned
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [ _, p ] of param.entries()) {
            const arg = argumentToBytes(p, { ty: ty.ty, array: false });
            values.push(arg);
        }

        const totalLengthOfValues = values
            .map((a) => a.length)
            .reduce((total, current) => total + current);

        switch (ty.ty) {
            case ArgumentType.uint8:
            case ArgumentType.int8:
            case ArgumentType.uint16:
            case ArgumentType.int16:
            case ArgumentType.uint32:
            case ArgumentType.int32:
            case ArgumentType.uint64:
            case ArgumentType.int64:
            case ArgumentType.uint256:
            case ArgumentType.int256:
            case ArgumentType.bool:
            case ArgumentType.bytes32:
            case ArgumentType.address:
            case ArgumentType.func:
                value = new Uint8Array(totalLengthOfValues + 32);
                break;
            case ArgumentType.bytes:
            case ArgumentType.string:
                value = new Uint8Array(values.length * 32 + totalLengthOfValues + 32);
                break;
            default: throw new TypeError(`Expected param type to be ArgumentType, but received ${ty.ty}`);
        }

        valueView = new DataView(value.buffer, 28);
        valueView.setUint32(0, values.length);

        let offset = 32 * values.length;

        for (const [ i, e ] of values.entries()) {
            switch (ty.ty) {
                case ArgumentType.uint8:
                case ArgumentType.int8:
                case ArgumentType.uint16:
                case ArgumentType.int16:
                case ArgumentType.uint32:
                case ArgumentType.int32:
                case ArgumentType.uint64:
                case ArgumentType.int64:
                case ArgumentType.uint256:
                case ArgumentType.int256:
                case ArgumentType.bool:
                case ArgumentType.bytes32:
                case ArgumentType.address:
                case ArgumentType.func:
                    value.set(e, i * 32 + 32);
                    break;
                case ArgumentType.bytes:
                case ArgumentType.string:
                    // eslint-disable-next-line no-case-declarations
                    const view = new DataView(value.buffer, (i + 1) * 32 + 28);
                    view.setUint32(0, offset);
                    value.set(e, view.getUint32(0) + 32);
                    offset += e.length;
                    break;
                default: throw new TypeError(`Expected param type to be ArgumentType, but received ${ty.ty}`);
            }
        }

        return value;
    }

    switch (ty.ty) {
        case ArgumentType.uint8:
            numberToBytes(param as number | BigNumber, 31, valueView.setUint8.bind(valueView));
            return value;
        case ArgumentType.int8:
            numberToBytes(param as number | BigNumber, 31, valueView.setInt8.bind(valueView));
            return value;
        case ArgumentType.uint16:
            numberToBytes(param as number | BigNumber, 30, valueView.setUint16.bind(valueView));
            return value;
        case ArgumentType.int16:
            numberToBytes(param as number | BigNumber, 30, valueView.setInt16.bind(valueView));
            return value;
        case ArgumentType.uint32:
            numberToBytes(param as number | BigNumber, 28, valueView.setUint32.bind(valueView));
            return value;
        case ArgumentType.int32:
            numberToBytes(param as number | BigNumber, 28, valueView.setInt32.bind(valueView));
            return value;
        // int64, uint64, and int256 both expect the parameter to be an Uint8Array instead of number
        case ArgumentType.uint64:
        case ArgumentType.int64:
            if (BigNumber.isBigNumber(param)) {
                // eslint-disable-next-line no-case-declarations
                let par = param.toString(16);
                if (par.length > 16) {
                    throw new TypeError("uint64/int64 requires BigNumber to be less than or equal to 8 bytes");
                } else if (!param.isInteger()) {
                    throw new TypeError("uint64/int64 requires BigNumber to be an integer");
                }

                if (par.length % 2 === 1) {
                    par = `0${par}`;
                }

                // eslint-disable-next-line no-case-declarations
                const buf = hex.decode(par);
                value.set(buf, 32 - buf.length);
            }
            return value;
        case ArgumentType.int256:
        case ArgumentType.uint256:
            if (BigNumber.isBigNumber(param)) {
                let par = param.toString(16);
                if (par.length % 2 === 1) {
                    par = `0${par}`;
                }

                const buf = hex.decode(par);
                value.set(buf, 32 - buf.length);
            }
            return value;
        case ArgumentType.address:
            value.set(param as Uint8Array, 32 - 20);
            return value;
        case ArgumentType.bool:
            value[ 31 ] = (param as boolean) ? 1 : 0;
            return value;
        case ArgumentType.func:
            value.set(param as Uint8Array, (32 - 24));
            return value;
        case ArgumentType.bytes32:
            value.set(param as Uint8Array, 0);
            return value;
        // Bytes should have not the length already encoded
        // JS String type is encoded as UTF-16 whilst Solidity `string` type is UTF-8 encoded.
        // So if will assume is already correctly updated to being a Uint8Array of UTF-8 string
        case ArgumentType.bytes:
        case ArgumentType.string:
            // If value is of type string, encode it in UTF-8 format and conver it to Uint8Array
            // Required because JS Strings are UTF-16
            // eslint-disable-next-line no-case-declarations
            const par: Uint8Array = param instanceof Uint8Array ?
                param :
                utf8.encode(param as string);

            // Resize value to a 32 byte boundary if needed
            if (Math.floor(par.length / 32) >= 0 && Math.floor(par.length % 32) !== 0) {
                value = new Uint8Array((Math.floor(par.length / 32) + 1) * 32 + 32);
            } else {
                value = new Uint8Array(64);
            }

            value.set(par, 32);

            valueView = new DataView(value.buffer, 28);
            valueView.setUint32(0, par.length);
            return value;
        default: throw new Error(`Unsupported argument type: ${ty}`);
    }
}

function numberToBytes(
    param: number | BigNumber,
    byteoffset: number,
    func: (byteOffset: number, value: number) => void
): void {
    const value = BigNumber.isBigNumber(param) ? param.toNumber() : param;

    func(byteoffset, value);
}
