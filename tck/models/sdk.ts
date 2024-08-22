export interface SdkSetupParams {
    readonly operatorAccountId: string;
    readonly operatorPrivateKey: string;
    readonly nodeIp?: string;
    readonly nodeAccountId?: string;
    readonly mirrorNetworkIp?: string;
}

export interface SdkResponse {
    readonly status: string;
    readonly message?: string;
}

type Method = {
    readonly name: string;
    readonly param: any;
};

export interface Input {
    readonly callClass: string;
    readonly methods: Method[];
}
