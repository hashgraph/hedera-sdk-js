import { Client, PrivateKey, AccountId } from "../src/index";
import { expect } from "chai";

export default function newClient() {
    let client;

    try {
        client = Client.fromJSONFile(process.env.CONFIG_FILE);
    } catch (_) {
        client = Client.forTestnet();
    }

    try {
        const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorId = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorId, operatorKey);
    } catch (err) {
        // Do nothing
    }

    expect(client.getOperatorId()).to.not.be.null;
    expect(client.getOperatorKey()).to.not.be.null;

    return client;
}
