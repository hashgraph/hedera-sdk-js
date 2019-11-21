import { keccak256 } from "js-sha3";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utf8 = require("utf8");

enum ArgumentType {
    uint8 = "uint8",
    int8 = "int8",
    uint16 = "uint16",
    int16 = "int16",
    uint32 = "uint32",
    int32 = "int32",
    uint64 = "uint64",
    int64 = "int64",
    uint256 = "uint256",
    string = "string",
    bool = "bool",
    bytes = "bytes",
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

    public addParamType(ty: string): this {
        if (this.needsComma) {
            this.func += ",";
        }

        const argument = stringToArgumentType(ty);

        this.func += argument;
        this.argumentTypes.push(argument);
        this.needsComma = true;

        return this;
    }

    /**
     * NOT A STABLE API
     */
    public toProto(): Uint8Array {
        this.func += ")";

        return new Uint8Array(keccak256.arrayBuffer(this.func!).slice(0, 4));
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

    private guessType(param: string | boolean | number | Uint8Array): void {
        // This guesses the parameter type from the passed in parameter
        // If the user wants to define this themselves they should pass
        // in a FunctionSelector into the constructor themselves
        switch (typeof param) {
            case "string":
                this.func.addParamType("string");
                break;
            case "boolean":
                this.func.addParamType("bool");
                break;
            case "number":
                if (param as number > 0) {
                    // If number is less than max uint8
                    if (Math.floor(param as number) <= 255) {
                        this.func.addParamType("uint8");
                    // If number is less than max uint16
                    } else if (Math.floor(param as number) <= 65536) {
                        this.func.addParamType("uint16");
                    // If number is less than max uint32
                    } else if (Math.floor(param as number) <= 4294967296) {
                        this.func.addParamType("uint32");
                    // Else type must be uint64
                    } else {
                        this.func.addParamType("uint64");
                    }
                } else {
                    // Disabling no-lonely-if because I think it's valid to have it here
                    // If number is less than max int8
                    // eslint-disable-next-line no-lonely-if
                    if (Math.floor(param as number) >= -128) {
                        this.func.addParamType("int8");
                    // If number is less than max int16
                    } else if (Math.floor(param as number) >= -32768) {
                        this.func.addParamType("int16");
                    // If number is less than max int32
                    } else if (Math.floor(param as number) >= -2147483648) {
                        this.func.addParamType("int32");
                    // Else type must be int64
                    } else {
                        this.func.addParamType("int64");
                    }
                }
                break;
            default:
                if (param instanceof Uint8Array) {
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
                        case 32:
                            this.func.addParamType("uint256");
                            break;
                        default:
                            this.func.addParamType("bytes");
                    }
                } else {
                    throw new TypeError("Should not be possible to get here");
                }
        }
    }

    public addParam(param: string | boolean | number | Uint8Array): this {
        let value = new Uint8Array(32);
        let dynamic = false;
        const length = new Uint8Array(32);
        const lengthView = new DataView(length.buffer, 28);
        const valueView = new DataView(value.buffer, 0);

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
            case ArgumentType.uint8:
                if (typeof param === "number") {
                    valueView.setUint8(31, param as number);
                } else {
                    value.set(param as Uint8Array, 31);
                }
                break;
            case ArgumentType.int8:
                if (typeof param === "number") {
                    valueView.setInt8(31, param as number);
                } else {
                    value.set(param as Uint8Array, 31);
                }
                break;
            case ArgumentType.uint16:
                if (typeof param === "number") {
                    valueView.setUint16(30, param as number);
                } else {
                    value.set(param as Uint8Array, 30);
                }
                break;
            case ArgumentType.int16:
                if (typeof param === "number") {
                    valueView.setInt16(30, param as number);
                } else {
                    value.set(param as Uint8Array, 30);
                }
                break;
            case ArgumentType.uint32:
                if (typeof param === "number") {
                    valueView.setUint32(28, param as number);
                } else {
                    value.set(param as Uint8Array, 28);
                }
                break;
            case ArgumentType.int32:
                if (typeof param === "number") {
                    valueView.setInt32(28, param as number);
                } else {
                    value.set(param as Uint8Array, 28);
                }
                break;
            // int64, uint64, and uint256 both expect the parameter to be an Uint8Array instead of number
            case ArgumentType.uint64:
                value.set(param as Uint8Array, 24);
                break;
            case ArgumentType.int64:
                value.set(param as Uint8Array, 24);
                break;
            case ArgumentType.uint256:
                value = (param as Uint8Array);
                break;
            case ArgumentType.bool:
                value[ 31 ] = (param as boolean) ? 1 : 0;
                break;
            // Bytes should have not the length already encoded
            // JS String type is encoded as UTF-16 whilst Solidity `string` type is UTF-8 encoded.
            // So if will assume is already correctly updated to being a Uint8Array of UTF-8 string
            case ArgumentType.bytes:
            case ArgumentType.string:
                // Bytes and string are dynamic types
                dynamic = true;

                // If param is of type string, encode it in UTF-8 format and conver it to Uint8Array
                // Required because JS Strings are UTF-16
                // eslint-disable-next-line no-case-declarations
                const par: Uint8Array = param instanceof Uint8Array ?
                    param as Uint8Array :
                    utf8.encode(param);

                // Resize value to a 32 byte boundary if needed
                if (Math.floor(par.length / 32) >= 0 && Math.floor(par.length % 32) !== 0) {
                    value = new Uint8Array((Math.floor(par.length / 32) + 1) * 32);
                }

                // Copy data of parameter into value; left to right
                value.set(Buffer.from(par), 0);

                // Bytes and String types are prefixed with length as an uint256
                lengthView.setUint32(0, par.length);

                // Update offset for next parameter that needs it
                // offsetView.setUint32(0, this.offsetView.getUint32(0));

                // The next offset is equal to the last offset + the length of this field + 32 bytes for length.
                // Bytes are encoded as one 32 byte value for the length, and then the value after
                // right-padded to a 32 byte boundary.
                // this.offsetView.setUint32(0, offsetView.getUint32(0) + value.length + 32);
                break;
            default: throw new Error(`Unsupported argument type: ${this.func.argumentTypes[ this.currentArgument ]}`);
        }

        this.func.argumentList.push({
            dynamic,
            offset: null,
            offsetView: null,
            length,
            lengthView,
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

        // Length = 4 bytes for function header + number of arguments * 32 bytes for each argument +
        // (for each dynamic argument take the length of value and add 32 for the length)
        // We have to get this length because Uint8Arrays aren't easily resizable. So create a
        // Uint8Array of appropriate size initially and populate the contents accordingly
        const length = (this.func.argumentList.length * 32) + this.func.argumentList
            .map((arg) => arg.dynamic ? arg.value.length + 32 : 0)
            .reduce((sum, value) => sum + value) + 4;

        const func = new Uint8Array(length);
        func.set(this.func.toProto(), 0);

        const { offset, offsetView } = this.func.initialOffset();

        // Encode the initial arguments
        // For non dynamic types encode the value in-place,
        // for dynamic types encode the offset
        // The 4 bytes is added to offsets because offset don't account
        // for the function hash
        for (let i = 0; i < this.func.argumentList.length; i += 1) {
            const arg = this.func.argumentList[ i ];
            if (arg.dynamic) {
                // Set the offset in the argument. This is used later write the argument data into the
                // appopriate position in the buffer
                arg.offset = new Uint8Array(Buffer.from(offset.buffer));
                arg.offsetView = new DataView((arg.offset as Uint8Array).buffer, 28);

                func.set(offset, 4 + (i * 32));

                offsetView.setUint32(
                    0,
                    offsetView.getUint32(0) +
                    arg.value.length + 32
                );
            } else {
                func.set(arg.value, 4 + (i * 32));
            }
        }

        // Encode dynamic arguments at the offset.
        for (let i = 0; i < this.func.argumentList.length; i += 1) {
            const arg = this.func.argumentList[ i ];
            if (arg.dynamic) {
                const argOffset = (arg.offsetView as DataView).getUint32(0);
                func.set(arg.length as Uint8Array, 4 + argOffset);
                func.set(arg.value as Uint8Array, 4 + argOffset + 32);
            }
        }

        return func;
    }
}

type Argument = {
    dynamic: boolean;
    offset: null | Uint8Array;
    offsetView: null | DataView;
    length: null | Uint8Array;
    lengthView: null | DataView;
    value: Uint8Array;
};

function stringToArgumentType(ty: string): ArgumentType {
    const argument = ArgumentType[ ty as keyof typeof ArgumentType ];
    if (argument == null) {
        throw new Error(`Argument Type is unsuppored: ${ty}`);
    }

    return argument;
}

