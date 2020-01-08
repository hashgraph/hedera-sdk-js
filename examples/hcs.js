const {
    Client,
    ConsensusClient,
    ConsensusTopicCreateTransaction,
    ConsensusSubmitMessageTransaction
} = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;
    const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;
    const nodeAddress = process.env.NODE_ADDRESS;

    if (operatorPrivateKey == null ||
        operatorAccount == null ||
        mirrorNodeAddress == null ||
        nodeAddress == null) {
        throw new Error("environment variables OPERATOR_KEY, OPERATOR_ID, MIRROR_NODE_ADDRESS, NODE_ADDRESS must be present");
    }

    const consensusClient = new ConsensusClient(mirrorNodeAddress)
        .setErrorHandler((error) => {
            console.log(`Error: ${error}`);
        });

    const network = {};
    network[ nodeAddress ] = "0.0.3";

    const client = new Client({
        network,
        operator: {
            account: operatorAccount,
            privateKey: operatorPrivateKey
        }
    });

    const transactionId = await new ConsensusTopicCreateTransaction()
        .setMemo("sdk example create_pub_sub.js")
        .setMaxTransactionFee(1000000000)
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    const topicId = transactionReceipt.getTopicId();

    console.log(`topicId = ${topicId}`);

    consensusClient.subscribe(topicId, null, (message) => {
        console.log(message.toString());
    });

    for (let i = 0; ; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await (await new ConsensusSubmitMessageTransaction()
            .setTopicId(topicId)
            .setMessage(`Hello, HCS! Message ${i}`)
            .execute(client))
            .getReceipt(client);

        console.log(`Sent message ${i}`);

        // eslint-disable-next-line no-await-in-loop
        await sleep(2500);
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

main();

