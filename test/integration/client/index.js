import Client from "../../src/client/NodeClient";
import dotenv from "dotenv";

// load .env (if available)
dotenv.config();

export function newIntegrationClient() {
    // TODO: support reading from a configuration file
    const client = Client.forTestnet();

    try {
        const operatorId =
            process.env.OPERATOR_ID || process.env.VITE_OPERATOR_ID;

        const operatorKey =
            process.env.OPERATOR_KEY || process.env.VITE_OPERATOR_KEY;

        client.setOperator(operatorId, operatorKey);
    } catch (err) {
        // ignore error and complain later
    }

    expect(client.operatorAccountId).to.not.be.null;
    expect(client.operatorPublicKey).to.not.be.null;

    return client;
}

// TODO: Remove this
export default newIntegrationClient;
