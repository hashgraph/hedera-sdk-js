import { TokenSupplyTypeMap } from "../generated/BasicTypes_pb";

interface Indexed {
    [code: number]: TokenType;
}

export class TokenType implements Indexed {
    // Index signatures
    [code: number]: TokenType;

    public static readonly FungibleCommon = new TokenType(0);
    public static readonly NonFungibleUnique = new TokenType(1);

    private static [ 0 ] = TokenType.FungibleCommon;
    private static [ 1 ] = TokenType.NonFungibleUnique;

    public readonly code: TokenSupplyTypeMap[keyof TokenSupplyTypeMap];

    // NOT A STABLE API
    public constructor(code: TokenSupplyTypeMap[keyof TokenSupplyTypeMap]) {
        this.code = code;
    }

    public toString(): string {
        switch (this) {
            case TokenType.FungibleCommon: return "FUNGIBLE_COMMON";
            case TokenType.NonFungibleUnique: return "NON_FUNGIBLE_UNIQUE";
            default: return `UNKNOWN TOKEN_TYPE CODE (${this.code})`;
        }
    }

    public static _fromCode(code: TokenSupplyTypeMap[keyof TokenSupplyTypeMap]): TokenType {
        return (TokenType as unknown as Indexed)[ code ] ?? new TokenType(code);
    }
}

