export interface AccountKeyGenerationParams {
    readonly type: string;
    readonly fromKey?: string;
    readonly threshold?: number;
    readonly keys?: AccountKeyGenerationParams[];
}

export interface AccountKeyGenerationResponse {
    key: string;
    privateKeys: string[];
}
