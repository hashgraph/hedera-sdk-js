const {Client, AccountId} = require("@hashgraph/sdk");
const {sdk} = require("../sdk_data");

module.exports = {

    /**
     * Setup SDK Client
     * defaults to testnet
     *
     * @param operatorAccountId
     * @param operatorPrivateKey
     * @param nodeIp (optional)
     * @param nodeAccountId (optional)
     * @param mirrorNetworkIp (optional)
     */
    setup: ({operatorAccountId, operatorPrivateKey, nodeIp, nodeAccountId, mirrorNetworkIp}) => {
        let clientType
        if (nodeIp && nodeAccountId && mirrorNetworkIp) {
            //Create custom client
            const node = {[nodeIp]: new AccountId(parseInt(nodeAccountId))};
            sdk.client = Client.forNetwork(node).setMirrorNetwork(mirrorNetworkIp);
            clientType = "custom"
        } else {
            // Default to testnet client
            sdk.client = Client.forTestnet();
            clientType = "testnet"
        }
        sdk.getClient().setOperator(operatorAccountId, operatorPrivateKey);
        return {
            "message": "Successfully setup " + clientType + " client.",
            "status": "SUCCESS"
        };
    },
    reset: () => {
        sdk.client = null;
        return {"status": "SUCCESS"};
    }
};