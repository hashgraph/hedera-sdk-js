import { keccak256 } from "js-sha3";

interface Argument {
    dynamic: boolean;
    value: Uint8Array;
}

export enum ArgumentType {
    uint8 = 0,
    int8 = 1,
    uint16 = 2,
    int16 = 3,
    uint32 = 4,
    int32 = 5,
    uint64 = 6,
    int64 = 7,
    uint256 = 8,
    int256 = 9,
    string = 10,
    bool = 11,
    bytes = 12,
    bytes32 = 13,
    address = 14,
    func = 15,
}

export interface SolidityType {
    ty: ArgumentType;
    array: boolean;
}

export class ContractFunctionSelector {
    private _name: string | null = null;
    private _params = "";

    // Unstable
    public _paramTypes: SolidityType[] = [];

    public constructor(name: string | null = null) {
        if (name != null) {
            this._name = name;
        }
    }

    public addString(): this {
        return this._addParam({ ty: ArgumentType.string, array: false });
    }

    public addStringArray(): this {
        return this._addParam({ ty: ArgumentType.string, array: true });
    }

    public addBytes(): this {
        return this._addParam({ ty: ArgumentType.bytes, array: false });
    }

    public addBytes32(): this {
        return this._addParam({ ty: ArgumentType.bytes32, array: false });
    }

    public addBytesArray(): this {
        return this._addParam({ ty: ArgumentType.bytes, array: true });
    }

    public addBytes32Array(): this {
        return this._addParam({ ty: ArgumentType.bytes32, array: true });
    }

    public addInt8(): this {
        return this._addParam({ ty: ArgumentType.int8, array: false });
    }

    public addInt32(): this {
        return this._addParam({ ty: ArgumentType.int32, array: false });
    }

    public addInt64(): this {
        return this._addParam({ ty: ArgumentType.int64, array: false });
    }

    public addInt256(): this {
        return this._addParam({ ty: ArgumentType.int256, array: false });
    }

    public addInt8Array(): this {
        return this._addParam({ ty: ArgumentType.int8, array: true });
    }

    public addInt32Array(): this {
        return this._addParam({ ty: ArgumentType.int32, array: true });
    }

    public addInt64Array(): this {
        return this._addParam({ ty: ArgumentType.int64, array: true });
    }

    public addInt256Array(): this {
        return this._addParam({ ty: ArgumentType.int256, array: true });
    }

    public addUint8(): this {
        return this._addParam({ ty: ArgumentType.uint8, array: false });
    }

    public addUint32(): this {
        return this._addParam({ ty: ArgumentType.uint32, array: false });
    }

    public addUint64(): this {
        return this._addParam({ ty: ArgumentType.uint64, array: false });
    }

    public addUint256(): this {
        return this._addParam({ ty: ArgumentType.uint256, array: false });
    }

    public addUint8Array(): this {
        return this._addParam({ ty: ArgumentType.uint8, array: true });
    }

    public addUint32Array(): this {
        return this._addParam({ ty: ArgumentType.uint32, array: true });
    }

    public addUint64Array(): this {
        return this._addParam({ ty: ArgumentType.uint64, array: true });
    }

    public addUint256Array(): this {
        return this._addParam({ ty: ArgumentType.uint256, array: true });
    }

    public addBool(): this {
        return this._addParam({ ty: ArgumentType.bool, array: false });
    }

    public addAddress(): this {
        return this._addParam({ ty: ArgumentType.address, array: false });
    }

    public addAddressArray(): this {
        return this._addParam({ ty: ArgumentType.address, array: true });
    }

    public addFunction(): this {
        return this._addParam({ ty: ArgumentType.func, array: false });
    }

    private _addParam(ty: SolidityType): this {
        if (this._paramTypes.length > 0) {
            this._params += ",";
        }

        this._params += solidityTypeToString(ty);
        this._paramTypes.push(ty);

        return this;
    }

    /**
     * NOT A STABLE API
     */
    public _build(name: string | null): Uint8Array {
        if (name != null) {
            this._name = name;
        } else if (this._name == null) {
            throw new Error("`name` required for ContractFunctionSelector");
        }

        return new Uint8Array(keccak256.arrayBuffer(this.toString()).slice(0, 4));
    }

    public toString(): string {
        return `${this._name}(${this._params})`;
    }
}

function solidityTypeToString(ty: SolidityType): string {
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
