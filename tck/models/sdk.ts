export interface SdkSetupParams {
    readonly operatorAccountId: string;
    readonly operatorPrivateKey: string;
    readonly nodeIp?: string;
    readonly nodeAccountId?: string;
    readonly mirrorNetworkIp?: string;
}

export interface SdkSetupResponse {
    readonly message: string;
    readonly status: string;
}

export interface SdkResetResponse {
    readonly status: string;
}

type Method = {
    readonly name: string;
    readonly param: any;
};

export interface Input {
    readonly callClass: string;
    readonly methods: Method[];
}
