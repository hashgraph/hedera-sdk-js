export interface KeyGenerationParams {
    readonly type: string;
    readonly fromKey?: string;
    readonly threshold?: number;
    readonly keys?: KeyGenerationParams[];
}

export interface KeyGenerationResponse {
    key: string;
    privateKeys: string[];
}
