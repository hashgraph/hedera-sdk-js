import {
    Client,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    PrivateKey,
    AccountId,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch (error) {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    // create topic
    const createResponse = await new TopicCreateTransaction().execute(client);
    const createReceipt = await createResponse.getReceipt(client);

    console.log(`topic id = ${createReceipt.topicId.toString()}`);

    // send one message
    const sendResponse = await new TopicMessageSubmitTransaction({
        topicId: createReceipt.topicId,
        message: "Hello World",
    }).execute(client);

    const sendReceipt = await sendResponse.getReceipt(client);

    console.log(
        `topic sequence number = ${sendReceipt.topicSequenceNumber.toString()}`
    );
}

void main();
