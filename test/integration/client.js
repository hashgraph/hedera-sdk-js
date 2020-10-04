import { Client } from "../src";

export function newIntegrationClient() {
    let client;

    try {
        client = Client.fromJSONFile(process.env.CONFIG_FILE);
    } catch (_) {
        client = Client.forTestnet();
    }

    try {
        const operatorId =
            process.env.OPERATOR_ID || import.meta.env.VITE_OPERATOR_ID;

        const operatorKey =
            process.env.OPERATOR_KEY || import.meta.env.VITE_OPERATOR_KEY;

        client.setOperator(operatorId, operatorKey);
    } catch (err) {
        // Do nothing
    }

    expect(client.getOperatorId()).to.not.be.null;
    expect(client.getOperatorKey()).to.not.be.null;

    return client;
}

// TODO: Remove this
export default newIntegrationClient;
