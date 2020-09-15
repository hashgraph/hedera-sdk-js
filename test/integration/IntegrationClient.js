import { Client, PrivateKey, AccountId } from "../src/browser";

export default function newClient() {
    let client;

    try {
        client = Client.fromJSONFile(process.env.CONFIG_FILE);
    } catch (_) {
        client = Client.forTestnet();
    }

    try {
        // const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        // const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
        const operatorKey = PrivateKey.fromString(
            "302e020100300506032b65700422042091dad4f120ca225ce66deb1d6fb7ecad0e53b5e879aa45b0c5e0db7923f26d08"
        );
        const operatorId = AccountId.fromString("0.0.9523");

        client.setOperator(operatorId, operatorKey);
    } catch (err) {
        // Do nothing
    }

    expect(client.getOperatorId()).to.not.be.null;
    expect(client.getOperatorKey()).to.not.be.null;

    return client;
}
