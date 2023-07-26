import { Client, AccountId } from "@hashgraph/sdk";
import { sdk } from "../sdk_data";

export default {
  setup: ({
    operatorAccountId,
    operatorPrivateKey,
    nodeIp,
    nodeAccountId,
    mirrorNetworkIp,
  }: {
    operatorAccountId: string;
    operatorPrivateKey: string;
    nodeIp?: string;
    nodeAccountId?: string;
    mirrorNetworkIp?: string;
  }) => {
    let clientType: string;
    if (nodeIp && nodeAccountId && mirrorNetworkIp) {
      const node = { [nodeIp]: new AccountId(parseInt(nodeAccountId)) };
      sdk.client = Client.forNetwork(node).setMirrorNetwork(mirrorNetworkIp);
      clientType = "custom";
    } else {
      sdk.client = Client.forTestnet();
      clientType = "testnet";
    }
    sdk.getClient().setOperator(operatorAccountId, operatorPrivateKey);
    return {
      message: `Successfully setup ${clientType} client.`,
      status: "SUCCESS",
    };
  },
  reset: () => {
    sdk.client = null;
    return { status: "SUCCESS" };
  },
};
