require("dotenv").config();

const {
    Client,
    PrivateKey,
    AccountId,
    TopicCreateTransaction,

} = require("@hashgraph/sdk");

async function main() {

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            // Defaults the operator account ID and key such that all generated transactions will be paid for
            // by this account and be signed by this key
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }    

    //generate a submit key to use with the topic
    let submitKey = PrivateKey.generate();

    //make a new topic ID to use
    let topicId = new TopicCreateTransaction()
    .setTopicMemo("hedera-sdk-js/consensus-pub-sub-chunked")
    .setSubmitKey(submitKey)
    .execute(client)
    .getReceipt(client)
    .topicId;

    if (topicId != null && topicId != undefined){
        console.log("TopicId: " + topicId);

        //wait for mirror to propagate
        await sleep(10000);

        //cont

    } else {
        throw new Error("topicId creation failed.");
    }
}