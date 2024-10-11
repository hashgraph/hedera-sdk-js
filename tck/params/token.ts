import {
    CustomFixedFee,
    CustomFractionalFee,
    CustomRoyaltyFee,
} from "@hashgraph/sdk";

export interface CreateTokenParams {
    readonly name?: string;
    readonly symbol?: string;
    readonly decimals?: number;
    readonly initialSupply?: string;
    readonly treasuryAccountId?: string;
    readonly adminKey?: string;
    readonly kycKey?: string;
    readonly freezeKey?: string;
    readonly wipeKey?: string;
    readonly supplyKey?: string;
    readonly freezeDefault?: boolean;
    readonly expirationTime?: number;
    readonly autoRenewPeriod?: string;
    readonly autoRenewAccountId?: string;
    readonly memo?: string;
    readonly tokenType?: string;
    readonly supplyType?: string;
    readonly maxSupply?: string;
    readonly feeScheduleKey?: string;
    readonly customFees?:
        | CustomFixedFee[]
        | CustomFractionalFee[]
        | CustomRoyaltyFee[];
    readonly pauseKey?: string;
    readonly metadata?: string;
    readonly metadataKey?: string;
    readonly commonTransactionParams?: Record<string, any>;
}

export interface DeleteTokenParams {
    readonly tokenId?: string;
    readonly commonTransactionParams?: Record<string, any>;
}
