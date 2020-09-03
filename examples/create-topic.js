require("dotenv").config();

const { Client, TopicCreateTransaction, TopicMessageSubmitTransaction } = require("@hashgraph/sdk");

async function main() {
    const client = Client.forTestnet();

    client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

    // create topic

    const createResponse = await new TopicCreateTransaction().execute(client);

    // TODO: add back retries
    // wait 10s
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const createReceipt = await createResponse.getReceipt(client);

    console.log(`topic id = ${createReceipt.topicId}`);

    // send one message

    const sendResponse = await new TopicMessageSubmitTransaction({
        topicId: createReceipt.topicId,
        message: "Hello World",
    }).execute(client);

    // TODO: add back retries
    // wait 10s
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const sendReceipt = await sendResponse.getReceipt(client);

    console.log(`topic sequence number = ${sendReceipt.topicSequenceNumber}`);

}

void main();
