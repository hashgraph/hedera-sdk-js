import { CustomFee } from "../../lib";

export interface CreateTokenParams {
    readonly name?: string;
    readonly symbol?: string;
    readonly decimals?: number;
    readonly initialSupply?: number;
    readonly treasuryAccountId?: string;
    readonly adminKey?: string;
    readonly kycKey?: string;
    readonly freezeKey?: string;
    readonly wipeKey?: string;
    readonly supplyKey?: string;
    readonly freezeDefault?: boolean;
    readonly expirationTime?: number;
    readonly autoRenewPeriod?: number;
    readonly memo?: string;
    readonly tokenType?: string;
    readonly supplyType?: string;
    readonly maxSupply?: number;
    readonly feeScheduleKey?: string;
    readonly customFees?: CustomFee[];
    readonly pauseKey?: string;
    readonly metadata?: string;
    readonly metadataKey?: string;
    readonly commonTransactionParams?: Record<string, any>;
}

export interface DeleteTokenParams {
    readonly tokenId?: string;
    readonly commonTransactionParams?: Record<string, any>;
}
