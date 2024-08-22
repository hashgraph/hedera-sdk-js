import { Client, AccountId } from "@hashgraph/sdk";

import { sdk } from "../sdk_data";
import {
    SdkResetResponse,
    SdkSetupParams,
    SdkSetupResponse,
} from "../models/sdk";

export default {
    setup: ({
        operatorAccountId,
        operatorPrivateKey,
        nodeIp,
        nodeAccountId,
        mirrorNetworkIp,
    }: SdkSetupParams): SdkSetupResponse => {
        let clientType: string;
        if (nodeIp && nodeAccountId && mirrorNetworkIp) {
            const node = { [nodeIp]: AccountId.fromString(nodeAccountId) };
            sdk.client = Client.forNetwork(node);
            clientType = "custom";
        } else {
            sdk.client = Client.forTestnet();
            clientType = "testnet";
        }
        sdk.getClient().setOperator(operatorAccountId, operatorPrivateKey);
        sdk.getClient().setRequestTimeout(30000);
        return {
            message: `Successfully setup ${clientType} client.`,
            status: "SUCCESS",
        };
    },
    reset: (): SdkResetResponse => {
        sdk.client = null;
        return { status: "SUCCESS" };
    },
};
