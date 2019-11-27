import { keccak256 } from "js-sha3";
import BigNumber from "bignumber.js";

enum ArgumentType {
    uint8 = 0,
    int8 = 1,
    uint16 = 2,
    int16 = 3,
    uint32 = 4,
    int32 = 5,
    uint64 = 6,
    int64 = 7,
    uint256 = 8,
    string = 9,
    bool = 10,
    bytes = 11,
    bytesfix = 12,
    address = 13,
    func = 14,
}

type SolidityType = {
    ty: ArgumentType;
    array: boolean;
}

function solidityTypeToString(ty: SolidityType, length?: number): string {
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
        case ArgumentType.string:
            s = "string";
            break;
        case ArgumentType.bool:
            s = "bool";
            break;
        case ArgumentType.bytes:
            s = "bytes";
            break;
        case ArgumentType.bytesfix:
            s = `bytes${length}`;
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

function stringToSoldityType(ty: string): SolidityType {
    const argument = ArgumentType[ ty as keyof typeof ArgumentType ];
    if (argument == null) {
        throw new Error(`Argument Type is unsuppored: ${ty}`);
    }

    const array = ty.endsWith("[]");

    return {
        ty: argument,
        array
    };
}

export class FunctionSelector {
    private _func?: string;
    private _needsComma = false;
    public argumentTypes: SolidityType[] = [];
    public argumentList: Argument[] = [];

    public constructor(func?: string) {
        if (func) {
            this._func = `${func}(`;
        }
    }

    public setFunction(func: string): this {
        if (this._func) {
            throw new Error("Function Name has already been set");
        }

        this._func = func ? `${func}(` : "";

        return this;
    }

    public addParamType(ty: string | SolidityType, length?: number): this {
        if (this._needsComma) {
            this._func += ",";
        }

        const argument: SolidityType = typeof ty === "string" ?
            stringToSoldityType(ty) :
            ty as SolidityType;

        this._func += solidityTypeToString(argument, length);

        this.argumentTypes.push(argument);
        this._needsComma = true;

        return this;
    }

    public static identifier(func: string): Uint8Array {
        return new Uint8Array(keccak256.arrayBuffer(func).slice(0, 4));
    }

    /**
     * NOT A STABLE API
     */
    public _toProto(): Uint8Array {
        this._func += ")";

        return FunctionSelector.identifier(this._func!);
    }

    public toString(): string {
        return `${this._func!})`;
    }
}

export class CallParams {
    private readonly _func: FunctionSelector;
    private _currentArgument = 0;

    public constructor(func?: string | FunctionSelector) {
        if (func && typeof func == "string") {
            this._func = new FunctionSelector(func);
        } else if (func instanceof FunctionSelector) {
            this._func = func;
        } else {
            this._func = new FunctionSelector();
        }
    }

    public setFunction(func: string): this {
        this._func.setFunction(func);

        return this;
    }

    private _conditionallyAddType(ty: SolidityType, length?: number): void {
        if (this._func.argumentTypes.length === this._currentArgument) {
            this._func.addParamType(ty, length);
        }
    }

    private static _validateBitWidth(bitwidth: number): void {
        if (bitwidth > 256 || bitwidth % 8 !== 0) {
            throw new Error("bitwidth must be less than or equal to 256 and a multiple of 8");
        }
    }

    public addUint(param: number | BigNumber, bitwidth: number): this {
        CallParams._validateBitWidth(bitwidth);

        this._conditionallyAddType(solidityTypeFromBitwidth(bitwidth, false, false));

        return this._addParam(param, false);
    }

    public addInt(param: number | BigNumber, bitwidth: number): this {
        CallParams._validateBitWidth(bitwidth);

        this._conditionallyAddType(solidityTypeFromBitwidth(bitwidth, true, false));

        return this._addParam(param, false);
    }

    public addUintArray(param: number[] | BigNumber[], bitwidth: number): this {
        CallParams._validateBitWidth(bitwidth);

        this._conditionallyAddType(solidityTypeFromBitwidth(bitwidth, false, true));

        return this._addParam(param, true);
    }

    public addIntArray(param: number[] | BigNumber[], bitwidth: number): this {
        CallParams._validateBitWidth(bitwidth);

        this._conditionallyAddType(solidityTypeFromBitwidth(bitwidth, true, true));

        return this._addParam(param, true);
    }

    public addBoolean(param: boolean): this {
        this._conditionallyAddType({ ty: ArgumentType.bool, array: false });

        return this._addParam(param, false);
    }

    public addString(param: string): this {
        this._conditionallyAddType({ ty: ArgumentType.string, array: false });

        return this._addParam(param, true);
    }

    public addAddress(param: Uint8Array | string): this {
        const par = param instanceof Uint8Array ?
            param :
            Buffer.from(param as string, "hex");

        if (par.length !== 20) {
            throw new Error("`address` type requires parameter to be exactly 20 bytes");
        }

        this._conditionallyAddType({ ty: ArgumentType.address, array: false });

        return this._addParam(par, false);
    }

    public addBytes(param: Uint8Array, length?: number): this {
        // If a length is supplied then the parameter type would be `byte<M>` where M is equal to length
        // and M is less than or equal to 32
        if (length) {
            console.error(`length: ${length}`);
            if (length !== param.length) {
                throw new Error("length of parameter is not equal to the length passed in");
            } else if (length > 32) {
                throw new Error("`bytes<M>` type requires parameter length to be less than or equal to 32 bytes");
            }

            this._conditionallyAddType({ ty: ArgumentType.bytesfix, array: false }, length);
        } else {
            this._conditionallyAddType({ ty: ArgumentType.bytes, array: false });
        }

        return this._addParam(param, length == null);
    }

    public addFunction(address: Uint8Array | string, func: FunctionSelector | string): this {
        const addressParam = address instanceof Uint8Array ?
            address :
            Buffer.from(address as string, "hex");

        const functionSelector = func instanceof FunctionSelector ?
            (func as FunctionSelector)._toProto() :
            FunctionSelector.identifier(func as string);

        if (addressParam.length !== 20) {
            throw new Error("`function` type requires parameter `address` to be exactly 20 bytes");
        }

        this._conditionallyAddType({ ty: ArgumentType.func, array: false });

        const proto = new Uint8Array(24);
        proto.set(addressParam, 0);
        proto.set(functionSelector, 20);

        return this._addParam(proto, false);
    }

    public addStringArray(strArray: string[]): this {
        this._conditionallyAddType({ ty: ArgumentType.string, array: true });

        return this._addParam(strArray, true);
    }

    public addByteArray(byteArray: Uint8Array[]): this {
        this._conditionallyAddType({ ty: ArgumentType.bytes, array: true });

        return this._addParam(byteArray, true);
    }

    public addAddressArray(addresses: string[] | Uint8Array[]): this {
        // Compiler would not allow the use of `.entries` without this assertion
        if (!Array.isArray(addresses)) {
            throw new TypeError(`expected array, got ${typeof addresses}`);
        }

        const par: Uint8Array[] = [];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [ _, a ] of addresses.entries()) {
            if (a instanceof Uint8Array) {
                if (a.length !== 20) {
                    throw new Error("`address` type requires parameter to be exactly 20 bytes");
                }

                par.push(a);
            } else {
                const buf = Buffer.from(a as string, "hex");

                if (buf.length !== 20) {
                    throw new Error("`address` type requires parameter to be exactly 20 bytes");
                }

                par.push();
            }
        }

        this._conditionallyAddType({ ty: ArgumentType.address, array: true });

        return this._addParam(par, true);
    }

    private _addParam(
        param: string | boolean | number | Uint8Array | BigNumber |
        string[] | boolean[] | number[] | Uint8Array[] | BigNumber[],
        dynamic: boolean
    ): this {
        const value = argumentToBytes(param, this._func.argumentTypes[ this._currentArgument ]);

        this._func.argumentList.push({ dynamic, value });

        this._currentArgument += 1;

        return this;
    }

    /**
     * NOT A STABLE API
     */
    public _toProto(): Uint8Array {
        if (this._func.argumentList.length !== this._func.argumentTypes.length) {
            throw new Error("Invalid number of parameters provided");
        }

        const length = this._func.argumentList.length === 0 ?
            0 :
            (this._func.argumentList.length * 32) + this._func.argumentList
                .map((arg) => arg.dynamic ? arg.value.length : 0)
                .reduce((sum, value) => sum + value) + 4;

        const func = new Uint8Array(length);
        func.set(this._func._toProto(), 0);

        let offset = 32 * this._func.argumentList.length;

        for (const [ i, { dynamic, value }] of this._func.argumentList.entries()) {
            if (dynamic) {
                const view = new DataView(func.buffer, 4 + (i * 32) + 28);
                view.setUint32(0, offset);
                func.set(value, view.getUint32(0) + 4);
                offset += value.length;
            } else {
                func.set(value, 4 + (i * 32));
            }
        }

        return func;
    }
}

type Argument = {
    dynamic: boolean;
    value: Uint8Array;
};

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

        value = new Uint8Array((values.length * 32) + totalLengthOfValues + 32);

        valueView = new DataView(value.buffer, 28);
        valueView.setUint32(0, values.length);

        let offset = 32 * values.length;

        for (const [ i, e ] of values.entries()) {
            const view = new DataView(value.buffer, ((i + 1) * 32) + 28);
            view.setUint32(0, offset);
            value.set(e, view.getUint32(0) + 32);
            offset += e.length;
        }

        return value;
    }

    switch (ty.ty) {
        case ArgumentType.uint8:
            if (typeof param === "number") {
                valueView.setUint8(31, param as number);
            } else {
                valueView.setUint8(31, (param as BigNumber).toNumber());
            }
            return value;
        case ArgumentType.int8:
            if (typeof param === "number") {
                valueView.setInt8(31, param as number);
            } else {
                valueView.setInt8(31, (param as BigNumber).toNumber());
            }
            return value;
        case ArgumentType.uint16:
            if (typeof param === "number") {
                valueView.setUint16(30, param as number);
            } else {
                valueView.setUint16(30, (param as BigNumber).toNumber());
            }
            return value;
        case ArgumentType.int16:
            if (typeof param === "number") {
                valueView.setInt16(30, param as number);
            } else {
                valueView.setInt16(30, (param as BigNumber).toNumber());
            }
            return value;
        case ArgumentType.uint32:
            if (typeof param === "number") {
                valueView.setUint32(28, param as number);
            } else {
                valueView.setUint32(28, (param as BigNumber).toNumber());
            }
            return value;
        case ArgumentType.int32:
            if (typeof param === "number") {
                valueView.setInt32(28, param as number);
            } else {
                valueView.setInt32(28, (param as BigNumber).toNumber());
            }
            return value;
        // int64, uint64, and uint256 both expect the parameter to be an Uint8Array instead of number
        case ArgumentType.uint64:
        case ArgumentType.int64:
            if (param instanceof BigNumber) {
                // eslint-disable-next-line no-case-declarations
                const par = (param as BigNumber).toString(16);
                if (par.length > 16) {
                    throw new TypeError("uint64/int64 requires BigNumber to be less than or equal to 8 bytes");
                } else if (!(param as BigNumber).isInteger()) {
                    throw new TypeError("uint64/int64 requires BigNumber to be an integer");
                }

                // eslint-disable-next-line no-case-declarations
                const buf = Buffer.from(par, "hex");
                value.set(buf, 32 - buf.length);
            }
            return value;
        case ArgumentType.uint256:
            value = (param as Uint8Array);
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
                param as Uint8Array :
                Buffer.from(param as string, "utf8");

            // Resize value to a 32 byte boundary if needed
            if (Math.floor(par.length / 32) >= 0 && Math.floor(par.length % 32) !== 0) {
                value = new Uint8Array(((Math.floor(par.length / 32) + 1) * 32) + 32);
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

function solidityTypeFromBitwidth(bitwidth: number, signed: boolean, array: boolean): SolidityType {
    let ty: SolidityType;

    switch (bitwidth) {
        case 8: ty = { ty: signed ? ArgumentType.int8 : ArgumentType.uint8, array };
            break;
        case 16: ty = { ty: signed ? ArgumentType.int16 : ArgumentType.uint16, array };
            break;
        case 32: ty = { ty: signed ? ArgumentType.int32 : ArgumentType.uint32, array };
            break;
        case 64: ty = { ty: signed ? ArgumentType.int64 : ArgumentType.uint64, array };
            break;
        default: ty = { ty: ArgumentType.uint256, array };
    }

    return ty;
}
