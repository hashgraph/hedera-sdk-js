import Client from "../../src/client/WebClient";

export function newIntegrationClient() {
    const client = Client.forTestnet();

    const operatorId = import.meta.env.VITE_OPERATOR_ID;

    if (operatorId == null) {
        throw new Error("missing environment variable OPERATOR_ID");
    }

    const operatorKey = import.meta.env.VITE_OPERATOR_KEY;

    if (operatorKey == null) {
        throw new Error("missing environment variable OPERATOR_KEY");
    }

    client.setOperator(operatorId, operatorKey);

    return client;
}

// TODO: Remove this
export default newIntegrationClient;
