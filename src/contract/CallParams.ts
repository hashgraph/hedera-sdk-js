import { keccak256 } from "js-sha3";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utf8 = require("utf8");

enum ArgumentType {
    uint32 = "uint32",
    uint64 = "uint64",
    uint256 = "uint256",
    string = "string",
    bool = "bool",
    bytes = "bytes",
}

export class CallParams {
    private readonly func: Uint8Array;
    private argumentList: Argument[] = [];
    private readonly argumentTypes: ArgumentType[];
    private currentArgument = 0;
    // Use Uint8Array to hold the offset in bytes, and use
    // offsetView to get the value as a Uint32; effectively
    // creating a Uint32 value type.
    private offset = new Uint8Array(32);
    private offsetView: DataView;

    public constructor(func: FunctionSelector) {
        const finish = func.finish();

        this.func = finish.hash;
        this.argumentTypes = finish.argumentTypes;
        this.offsetView = new DataView(this.offset.buffer, 28);
        this.offsetView.setUint32(0, this.argumentTypes.length * 32);
    }

    // String type unsupported (directly). See `ArgumentType.String` in
    // the switch statement below
    public addParam(param: string | boolean | number | Uint8Array): this {
        let value = new Uint8Array(32);
        let dynamic = false;
        const offset = new Uint8Array(32);
        const offsetView = new DataView(offset.buffer, 28);
        const length = new Uint8Array(32);
        const lengthView = new DataView(length.buffer, 28);

        switch (this.argumentTypes[ this.currentArgument ]) {
            case ArgumentType.uint32:
                value.set(param as Uint8Array, 28);
                break;
            case ArgumentType.uint64:
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

                // eslint-disable-next-line no-case-declarations
                const par: Uint8Array = param instanceof Uint8Array ?
                    param as Uint8Array :
                    utf8.encode(param);

                // eslint-disable-next-line no-case-declarations
                const length = par.length;
                // resize value to a 32 byte boundary if needed
                if (Math.floor(length / 32) >= 0 && Math.floor(length % 32) !== 0) {
                    value = new Uint8Array((Math.floor(length / 32) + 1) * 32);
                }

                // Copy data of parameter into value; left to right
                value.set(Buffer.from(par), 0);

                // Bytes and String types are prefixed with length as an uint256
                lengthView.setUint32(0, par.length);

                // Update offset for next parameter that needs it
                offsetView.setUint32(0, this.offsetView.getUint32(0));

                // The next offset is equal to the last offset + the length of this field + 32 bytes for length.
                // Bytes are encoded as one 32 byte value for the length, and then the value after
                // right-padded to a 32 byte boundary.
                this.offsetView.setUint32(0, offsetView.getUint32(0) + value.length + 32);
                break;
            default: throw new Error(`Unsupported argument type: ${this.argumentTypes[ this.currentArgument ]}`);
        }

        this.argumentList.push({ dynamic, offset, offsetView, length, lengthView, value });
        this.currentArgument += 1;

        return this;
    }

    public finish(): Uint8Array {
        if (this.argumentList.length !== this.argumentTypes.length) {
            throw new Error("Invalid number of parameters provided");
        }

        // Length = 4 bytes for function header + number of arguments * 32 bytes for each argument +
        // (for each dynamic argument take the length of value and add 32 for the length)
        // We have to get this length because Uint8Arrays aren't easily resizable. So create a
        // Uint8Array of appropriate size initially and populate the contents accordingly
        const length = (this.argumentList.length * 32) + this.argumentList
            .map((arg) => arg.dynamic ? arg.value.length + 32 : 0)
            .reduce((sum, value) => sum + value) + 4;

        const func = new Uint8Array(length);
        func.set(this.func, 0);

        // Encode the initial arguments
        // For non dynamic types encode the value in-place,
        // for dynamic types encode the offset
        // The 4 bytes is added to offsets because offset don't account
        // for the function hash
        for (let i = 0; i < this.argumentList.length; i += 1) {
            const arg = this.argumentList[ i ];
            if (arg.dynamic) {
                func.set(arg.offset as Uint8Array, 4 + (i * 32));
            } else {
                func.set(arg.value, 4 + (i * 32));
            }
        }

        // Encode dynamic arguments at the offset.
        for (let i = 0; i < this.argumentList.length; i += 1) {
            const arg = this.argumentList[ i ];
            if (arg.dynamic) {
                const offset = (arg.offsetView as DataView).getUint32(0);
                func.set(arg.length as Uint8Array, 4 + offset);
                func.set(arg.value as Uint8Array, 4 + offset + 32);
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

export class FunctionSelector {
    private func: string;
    private needsComma = false;
    private argumentTypes: ArgumentType[] = [];

    public constructor(func: string) {
        this.func = `${func}(`;
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

    public finish(): { hash: Uint8Array; argumentTypes: ArgumentType[] } {
        this.func += ")";

        return {
            hash: new Uint8Array(keccak256.arrayBuffer(this.func).slice(0, 4)),
            argumentTypes: this.argumentTypes
        };
    }

    public toString(): string {
        return this.func;
    }
}

function stringToArgumentType(ty: string): ArgumentType {
    const argument = ArgumentType[ ty as keyof typeof ArgumentType ];
    if (argument == null) {
        throw new Error(`Argument Type is unsuppored: ${ty}`);
    }

    return argument;
}

