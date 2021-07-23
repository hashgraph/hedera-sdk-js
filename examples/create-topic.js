require("dotenv").config();

const {
    Client,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    PrivateKey,
    AccountId,
} = require("@hashgraph/sdk");

async function main() {
    let client;

    if (process.env.HEDERA_NETWORK != null) {
        if (process.env.OPERATOR_KEY != null) {
            if (process.env.OPERATOR_ID != null) {
                client = Client.forName(process.env.HEDERA_NETWORK);   
                
                const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
                const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
        
                client.setOperator(operatorId, operatorKey);
            }
            else {
                throw new Error("Environment Variable:\tOPERATOR_ID is required to initialize the client.");
            }
        }
        else {
            throw new Error("Environment Variable:\tOPERATOR_KEY is required to initialize the client.");
        }
    }
    else {
        throw new Error("Environment Variable:\tHEDERA_NETWORK is required to initialize the client.\nThis value can be \"mainnet\", \"testnet\", or \"previewnet\".");
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
