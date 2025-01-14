export interface AllowanceParams {
    readonly ownerAccountId: string;
    readonly spenderAccountId: string;
    readonly hbarAllowanceParams?: HbarAllowanceParams;
    readonly tokenAllowanceParams?: TokenAllowanceParams;
    readonly nftAllowanceParams?: NftAllowanceParams;
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
    readonly approveForAll?: boolean;
    readonly delegateSpenderAccountId?: string;
}
