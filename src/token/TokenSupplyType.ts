import { TokenSupplyTypeMap } from "../generated/basic_types_pb";

interface Indexed {
    [code: number]: TokenSupplyType;
}

export class TokenSupplyType implements Indexed {
    // Index signatures
    [code: number]: TokenSupplyType;

    /**
     * Indicates that tokens of that type have an upper bound of Long.MAX_VALUE.
     */
    public static readonly Infinite = new TokenSupplyType(0);

    /**
     * Indicates that tokens of that type have an upper bound of maxSupply, provided on token creation.
     */
    public static readonly Finite = new TokenSupplyType(1);

    private static [ 0 ] = TokenSupplyType.Infinite;
    private static [ 1 ] = TokenSupplyType.Finite;

    public readonly code: TokenSupplyTypeMap[keyof TokenSupplyTypeMap];

    // NOT A STABLE API
    public constructor(code: TokenSupplyTypeMap[keyof TokenSupplyTypeMap]) {
        this.code = code;
    }

    public toString(): string {
        switch (this) {
            case TokenSupplyType.Infinite: return "INFINITE";
            case TokenSupplyType.Finite: return "FINITE";
            default: return `UNKNOWN TOKEN_TYPE CODE (${this.code})`;
        }
    }

    public static _fromCode(code: TokenSupplyTypeMap[keyof TokenSupplyTypeMap]): TokenSupplyType {
        return (TokenSupplyType as unknown as Indexed)[ code ] ?? new TokenSupplyType(code);
    }
}

