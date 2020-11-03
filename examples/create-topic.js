require("dotenv").config();

const {
    Client,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

async function main() {
    let client;

    if (process.env.HEDERA_NETWORK != null) {
        switch (process.env.HEDERA_NETWORK) {
            case "previewnet":
                client = Client.forPreviewnet();
                break;
            default:
                client = Client.forTestnet();
        }
    } else {
        try {
            client = Client.fromConfigFile(process.env.CONFIG_FILE);
        } catch (err) {
            client = Client.forTestnet();
        }
    }

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorId = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorId, operatorKey);
    }

    // create topic
    const createResponse = await new TopicCreateTransaction().execute(client);
    const createReceipt = await createResponse.getReceipt(client);

    console.log(`topic id = ${createReceipt.topicId}`);

    // send one message
    const sendResponse = await new TopicMessageSubmitTransaction({
        topicId: createReceipt.topicId,
        message: "Hello World",
    }).execute(client);

    const sendReceipt = await sendResponse.getReceipt(client);

    console.log(`topic sequence number = ${sendReceipt.topicSequenceNumber}`);
}

void main();
