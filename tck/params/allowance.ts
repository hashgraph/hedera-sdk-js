export interface AllowanceParams {
    readonly ownerAccountId: string;
    readonly spenderAccountId: string;
    readonly hbar: HbarAllowanceParams;
    readonly token?: TokenAllowanceParams;
    readonly nft?: NftAllowanceParams;
}

interface HbarAllowanceParams {
    readonly amount: string;
}

interface TokenAllowanceParams {
    readonly tokenId: string;
    readonly amount: string;
}

interface NftAllowanceParams {
    readonly tokenId: string;
    readonly serialNumbers?: string[];
    readonly approvedForAll?: boolean;
    readonly delegateSpenderAccountId?: string;
}
