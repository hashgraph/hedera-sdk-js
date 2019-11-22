import { keccak256 } from "js-sha3";

enum ArgumentType {
    uint8,
    int8,
    uint16,
    int16,
    uint32,
    int32,
    uint64,
    int64,
    uint256,
    string,
    stringArray,
    bool,
    bytes,
    bytesArray,
    bytesfix,
    address,
    func,
}

function argumentTypeToString(ty: ArgumentType, length?: number): string {
    switch (ty) {
        case ArgumentType.uint8:
            return "uint8";
        case ArgumentType.int8:
            return "int8";
        case ArgumentType.uint16:
            return "uint16";
        case ArgumentType.int16:
            return "int16";
        case ArgumentType.uint32:
            return "uint32";
        case ArgumentType.int32:
            return "int32";
        case ArgumentType.uint64:
            return "uint64";
        case ArgumentType.int64:
            return "int64";
        case ArgumentType.uint256:
            return "uint256";
        case ArgumentType.string:
            return "string";
        case ArgumentType.stringArray:
            return "string[]";
        case ArgumentType.bool:
            return "bool";
        case ArgumentType.bytes:
            return "bytes";
        case ArgumentType.bytesArray:
            return "bytes[]";
        case ArgumentType.bytesfix:
            return `bytes${length}`;
        case ArgumentType.address:
            return "address";
        case ArgumentType.func:
            return "function";
        default:
            return "";
    }
}

function stringToArgumentType(ty: string): ArgumentType {
    const argument = ArgumentType[ ty as keyof typeof ArgumentType ];
    if (argument == null) {
        throw new Error(`Argument Type is unsuppored: ${ty}`);
    }

    return argument;
}

export class FunctionSelector {
    private func?: string;
    private needsComma = false;
    public argumentTypes: ArgumentType[] = [];
    public argumentList: Argument[] = [];

    public constructor(func?: string) {
        if (func) {
            this.func = `${func}(`;
        }
    }

    public setFunction(func: string): this {
        if (this.func) {
            throw new Error("Function Name has already been set");
        }

        this.func = func ? `${func}(` : "";

        return this;
    }

    /**
     * NOT A STABLE API
     */
    public initialOffset(): { offset: Uint8Array; offsetView: DataView } {
        const offset = new Uint8Array(32);
        const offsetView = new DataView(offset.buffer, 28);

        offsetView.setUint32(0, 32 * this.argumentTypes.length);

        return {
            offset,
            offsetView
        };
    }

    public addParamType(ty: string, length?: number): this {
        if (this.needsComma) {
            this.func += ",";
        }

        const argument: ArgumentType = stringToArgumentType(ty);

        this.func += argumentTypeToString(argument, length);

        this.argumentTypes.push(argument);
        this.needsComma = true;

        return this;
    }

    public static identifier(func: string): Uint8Array {
        return new Uint8Array(keccak256.arrayBuffer(func).slice(0, 4));
    }

    /**
     * NOT A STABLE API
     */
    public toProto(): Uint8Array {
        this.func += ")";

        return FunctionSelector.identifier(this.func!);
    }

    public toString(): string {
        return `${this.func!})`;
    }
}

export class CallParams {
    private readonly func: FunctionSelector;
    private currentArgument = 0;
    // Use Uint8Array to hold the offset in bytes, and use
    // offsetView to get the value as a Uint32; effectively
    // creating a Uint32 value type.
    private offset = new Uint8Array(32);
    private offsetView: DataView;

    public constructor(func?: string | FunctionSelector) {
        if (func && typeof func == "string") {
            this.func = new FunctionSelector(func);
        } else if (func instanceof FunctionSelector) {
            this.func = func;
        } else {
            this.func = new FunctionSelector();
        }

        this.offsetView = new DataView(this.offset.buffer, 28);
        this.offsetView.setUint32(0, this.func.argumentTypes.length * 32);
    }

    public setFunction(func: string): this {
        this.func.setFunction(func);

        return this;
    }

    private guessType(param: string | boolean | number | Uint8Array | 
        string[] | Uint8Array[]): void {
        switch (typeof param) {
            case "string":
                this.func.addParamType("string");
                break;
            case "boolean":
                this.func.addParamType("bool");
                break;
            case "number":
                if (param as number > 0) {
                    if (Math.floor(param as number) <= 255) {
                        this.func.addParamType("uint8");
                    } else if (Math.floor(param as number) <= 65536) {
                        this.func.addParamType("uint16");
                    } else if (Math.floor(param as number) <= 4294967296) {
                        this.func.addParamType("uint32");
                    } else {
                        this.func.addParamType("uint64");
                    }
                } else {
                    // eslint-disable-next-line no-lonely-if
                    if (Math.floor(param as number) >= -128) {
                        this.func.addParamType("int8");
                    } else if (Math.floor(param as number) >= -32768) {
                        this.func.addParamType("int16");
                    } else if (Math.floor(param as number) >= -2147483648) {
                        this.func.addParamType("int32");
                    } else {
                        this.func.addParamType("int64");
                    }
                }
                break;
            default:
                if (Array.isArray(param) && param[ 0 ] instanceof Uint8Array) {
                    this.func.addParamType("bytesArray");
                } else if (Array.isArray(param) && typeof param[ 0 ] === "string") {
                    this.func.addParamType("stringArray");
                } else if (param instanceof Uint8Array) {
                    switch ((param as Uint8Array).length) {
                        case 1:
                            this.func.addParamType("uint8");
                            break;
                        case 2:
                            this.func.addParamType("uint16");
                            break;
                        case 4:
                            this.func.addParamType("uint32");
                            break;
                        case 8:
                            this.func.addParamType("uint64");
                            break;
                        case 20:
                            this.func.addParamType("address");
                            break;
                        case 24:
                            this.func.addParamType("function");
                            break;
                        case 32:
                            this.func.addParamType("uint256");
                            break;
                        default:
                            if ((param as Uint8Array).length < 32) {
                                this.func.addParamType("bytesfix", (param as Uint8Array).length);
                            } else {
                                this.func.addParamType("bytes");
                            }
                    }
                } else {
                    throw new TypeError("Should not be possible to get here");
                }
        }
    }

    private conditionallyAddType(ty: string, length?: number): void {
        if (this.func.argumentTypes.length === this.currentArgument) {
            this.func.addParamType(ty, length);
        }
    }

    public addUin8(param: number): this {
        this.conditionallyAddType("uint8");

        return this.addParam(param);
    }

    public addInt8(param: number): this {
        this.conditionallyAddType("int8");

        return this.addParam(param);
    }

    public addUint16(param: number): this {
        this.conditionallyAddType("uint16");

        return this.addParam(param);
    }

    public addInt16(param: number): this {
        this.conditionallyAddType("int16");

        return this.addParam(param);
    }

    public addUint32(param: number): this {
        this.conditionallyAddType("uint32");

        return this.addParam(param);
    }

    public addInt32(param: number): this {
        this.conditionallyAddType("int32");

        return this.addParam(param);
    }

    public addUint64(param: Uint8Array): this {
        this.conditionallyAddType("uint64");

        return this.addParam(param);
    }

    public addInt64(param: Uint8Array): this {
        this.conditionallyAddType("int64");

        return this.addParam(param);
    }

    public addUint256(param: Uint8Array): this {
        this.conditionallyAddType("uint256");

        return this.addParam(param);
    }

    public addString(param: string): this {
        this.conditionallyAddType("string");

        return this.addParam(param);
    }

    public addAddress(param: Uint8Array | string): this {
        const par = param instanceof Uint8Array ?
            param :
            Buffer.from(param as string, "hex");

        if (par.length !== 20) {
            throw new Error("`address` type requires parameter to be exactly 20 bytes");
        }

        this.conditionallyAddType("address");

        return this.addParam(par);
    }

    public addBytes(param: Uint8Array): this {
        this.conditionallyAddType("bytes");

        return this.addParam(param);
    }

    public addBytesFixed(param: Uint8Array): this {
        if (param.length > 32) {
            throw new Error("`bytes<M>` type requires parameter length to be less than or equal to 32 bytes");
        }

        this.conditionallyAddType("bytes", param.length);

        return this.addParam(param);
    }

    public addFunction(address: Uint8Array | string, func: FunctionSelector | string): this {
        const addressParam = address instanceof Uint8Array ?
            address :
            Buffer.from(address as string, "hex");

        const functionSelector = func instanceof FunctionSelector ?
            (func as FunctionSelector).toProto() :
            FunctionSelector.identifier(func as string);

        if (addressParam.length !== 20) {
            throw new Error("`function` type requires parameter `address` to be exactly 20 bytes");
        }

        this.conditionallyAddType("function");

        const proto = new Uint8Array(24);
        proto.set(addressParam, 0);
        proto.set(functionSelector, 20);

        return this.addParam(proto);
    }

    // Allows user to add any parameter they wish and they type will be guessed from the
    // type and size of the parameter passed in
    // For more control, use the `add<Type>` methods instead.
    public addParam(param: string | boolean | number | Uint8Array | 
        string[] | Uint8Array[]): this {
        let value;
        let dynamic = false;

        // Determine if we need to guess the parameter type or if it's already defined
        // The reason we even have this code is because javascript doesn't support 64-bit numbers.
        // Note: BigInt isn't allowed to be used because this sdk is supposed to support older
        // browsers; some of which don't support BigInt. So if the function requires a uint64,
        // but this sdk is being used, the user is expected to construct the function selector
        // him/herself, supplying all the required parameters initially, then constructing
        // this class from that selector. OR, the user is required to constructor a Uint8Array
        // of appropriate size. For a uint64 the size would be 8 bytes, so `new Uint8Array(8)`.
        if (this.func.argumentTypes.length === this.currentArgument) {
            this.guessType(param);
        }

        // This is required because the user might have already defined the parameter types
        switch (this.func.argumentTypes[ this.currentArgument ]) {
            case ArgumentType.bytes:
            case ArgumentType.bytesArray:
            case ArgumentType.string:
            case ArgumentType.stringArray:
                dynamic = true;
            // eslint-disable-next-line no-fallthrough
            case ArgumentType.uint8:
            case ArgumentType.int8:
            case ArgumentType.uint16:
            case ArgumentType.int16:
            case ArgumentType.uint32:
            case ArgumentType.int32:
            case ArgumentType.uint64:
            case ArgumentType.int64:
            case ArgumentType.uint256:
            case ArgumentType.address:
            case ArgumentType.bool:
            case ArgumentType.func:
            case ArgumentType.bytesfix:
                value = argumentToBytes(param, this.func.argumentTypes[ this.currentArgument ]);
                break;
            default: throw new Error(`Unsupported argument type: ${this.func.argumentTypes[ this.currentArgument ]}`);
        }

        this.func.argumentList.push({
            dynamic,
            value
        });

        this.currentArgument += 1;

        return this;
    }

    /**
     * NOT A STABLE API
     */
    public toProto(): Uint8Array {
        if (this.func.argumentList.length !== this.func.argumentTypes.length) {
            throw new Error("Invalid number of parameters provided");
        }

        const length = (this.func.argumentList.length * 32) + this.func.argumentList
            .map((arg) => arg.dynamic ? arg.value.length : 0)
            .reduce((sum, value) => sum + value) + 4;

        console.error(`length: ${length}`);

        const func = new Uint8Array(length);
        func.set(this.func.toProto(), 0);

        let offset = 32 * this.func.argumentList.length;

        for (const [ i, { dynamic, value }] of this.func.argumentList.entries()) {
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
    param: string | boolean | number | Uint8Array | string[] | Uint8Array[],
    ty: ArgumentType
): Uint8Array {
    let value = new Uint8Array(32);
    let valueView = new DataView(value.buffer, 0);

    console.error(`type: ${ty}`);

    switch (ty) {
        case ArgumentType.uint8:
            if (typeof param === "number") {
                valueView.setUint8(31, param as number);
            } else {
                value.set(param as Uint8Array, 31);
            }
            return value;
        case ArgumentType.int8:
            if (typeof param === "number") {
                valueView.setInt8(31, param as number);
            } else {
                value.set(param as Uint8Array, 31);
            }
            return value;
        case ArgumentType.uint16:
            if (typeof param === "number") {
                valueView.setUint16(30, param as number);
            } else {
                value.set(param as Uint8Array, 30);
            }
            return value;
        case ArgumentType.int16:
            if (typeof param === "number") {
                valueView.setInt16(30, param as number);
            } else {
                value.set(param as Uint8Array, 30);
            }
            return value;
        case ArgumentType.uint32:
            if (typeof param === "number") {
                valueView.setUint32(28, param as number);
            } else {
                value.set(param as Uint8Array, 28);
            }
            return value;
        case ArgumentType.int32:
            if (typeof param === "number") {
                valueView.setInt32(28, param as number);
            } else {
                value.set(param as Uint8Array, 28);
            }
            return value;
        // int64, uint64, and uint256 both expect the parameter to be an Uint8Array instead of number
        case ArgumentType.uint64:
            value.set(param as Uint8Array, 24);
            return value;
        case ArgumentType.int64:
            value.set(param as Uint8Array, 24);
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
        case ArgumentType.bytesArray:
        case ArgumentType.stringArray:
            // eslint-disable-next-line no-case-declarations
            let values: Uint8Array[];

            // w0w this is dumb, but `param instanceof Array<Uint8Array>` doesn't work
            // This introduces a limitation where there must be at least one value supplied
            if (Array.isArray(param) && param[ 0 ] instanceof Uint8Array) {
                values = (param as Uint8Array[])
                    .map((s: Uint8Array) => argumentToBytes(s, ArgumentType.bytes));
            } else {
                values = (param as string[])
                    .map((s: string) => argumentToBytes(s, ArgumentType.string));
            }

            // eslint-disable-next-line no-case-declarations
            const totalLengthOfValues = values
                .map((a) => a.length)
                .reduce((total, current) => total + current);

            value = new Uint8Array((values.length * 32) + totalLengthOfValues + 32);

            valueView = new DataView(value.buffer, 28);
            valueView.setUint32(0, values.length);

            // eslint-disable-next-line no-case-declarations
            let offset = 32 * values.length;

            for (const [ i, e ] of values.entries()) {
                const view = new DataView(value.buffer, ((i + 1) * 32) + 28);
                view.setUint32(0, offset);
                value.set(e, view.getUint32(0) + 32);
                offset += e.length;
            }

            return value;
        default: throw new Error(`Unsupported argument type: ${ty}`);
    }
}
