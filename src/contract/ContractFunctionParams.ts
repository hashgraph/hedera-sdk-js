import BigNumber from "bignumber.js";
import { ContractFunctionSelector, ArgumentType, SolidityType } from "./ContractFunctionSelector";

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

    public addBytesArray(value: Uint8Array[]): this {
        this._selector.addBytesArray();

        return this._addParam(value, true);
    }

    public addBool(value: boolean): this {
        this._selector.addBool();

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

    public addInt32Array(value: number[]): this {
        this._selector.addInt32();

        return this._addParam(value, false);
    }

    public addInt64Array(value: BigNumber[]): this {
        this._selector.addInt64();

        return this._addParam(value, false);
    }

    public addInt256Array(value: BigNumber[]): this {
        this._selector.addInt256();

        return this._addParam(value, false);
    }

    public addAddress(value: string): this {
        const par = Buffer.from(value, "hex");

        if (par.length !== 20) {
            throw new Error("`address` type requires parameter to be exactly 20 bytes");
        }

        this._selector.addAddress();

        return this._addParam(par, false);
    }

    public addAddressArray(value: string[]): this {
        const par: Uint8Array[] = [];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [ _, a ] of value.entries()) {
            const buf = Buffer.from(a, "hex");

            if (buf.length !== 20) {
                throw new Error("`address` type requires parameter to be exactly 20 bytes");
            }

            par.push();
        }

        this._selector.addAddressArray();

        return this._addParam(par, true);
    }

    public addFunction(address: string, selector: ContractFunctionSelector): this {
        const addressParam = Buffer.from(address, "hex");
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
            values.push(argumentToBytes(p, { ty: ty.ty, array: false }));
        }

        const totalLengthOfValues = values
            .map((a) => a.length)
            .reduce((total, current) => total + current);

        value = new Uint8Array(values.length * 32 + totalLengthOfValues + 32);

        valueView = new DataView(value.buffer, 28);
        valueView.setUint32(0, values.length);

        let offset = 32 * values.length;

        for (const [ i, e ] of values.entries()) {
            const view = new DataView(value.buffer, (i + 1) * 32 + 28);
            view.setUint32(0, offset);
            value.set(e, view.getUint32(0) + 32);
            offset += e.length;
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
            if (param instanceof BigNumber) {
                // eslint-disable-next-line no-case-declarations
                const par = param.toString(16);
                if (par.length > 16) {
                    throw new TypeError("uint64/int64 requires BigNumber to be less than or equal to 8 bytes");
                } else if (!param.isInteger()) {
                    throw new TypeError("uint64/int64 requires BigNumber to be an integer");
                }

                // eslint-disable-next-line no-case-declarations
                const buf = Buffer.from(par, "hex");
                value.set(buf, 32 - buf.length);
            }
            return value;
        case ArgumentType.int256:
            value = param as Uint8Array;
            return value;
        case ArgumentType.address:
            value.set(param as Uint8Array, 20);
            return value;
        case ArgumentType.bool:
            value[ 31 ] = (param as boolean) ? 1 : 0;
            return value;
        case ArgumentType.func:
            value.set(param as Uint8Array, 0);
            return value;
        case ArgumentType.bytesfix:
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
                Uint8Array.from(new TextEncoder().encode(param as string));

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
    const value = param instanceof BigNumber ? param.toNumber() : param;

    func(byteoffset, value);
}
