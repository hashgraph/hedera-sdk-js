const {
    Client,
    MirrorClient,
    MirrorConsensusTopicQuery,
    ConsensusTopicCreateTransaction,
    ConsensusSubmitMessageTransaction,
    Ed25519PrivateKey
} = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
    const operatorAccount = process.env.OPERATOR_ID;
    const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;
    const nodeAddress = process.env.NODE_ADDRESS;

    if (operatorPrivateKey == null ||
      operatorAccount == null ||
      mirrorNodeAddress == null ||
      nodeAddress == null) {
        throw new Error("environment variables OPERATOR_KEY, OPERATOR_ID, MIRROR_NODE_ADDRESS, NODE_ADDRESS must be present");
    }

    const consensusClient = new MirrorClient(mirrorNodeAddress);

    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);

    const transactionId = await new ConsensusTopicCreateTransaction()
        .setTopicMemo("sdk example create_pub_sub.js")
        .setMaxTransactionFee(100000000000)
    // .setAdminKey(operatorPrivateKey.publicKey) // allows updateTopic
        .setSubmitKey(operatorPrivateKey.publicKey) // allows control access to submit messages
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    const topicId = transactionReceipt.getTopicId();

    console.log(`topicId = ${topicId}`);

    new MirrorConsensusTopicQuery()
        .setTopicId(topicId)
        .subscribe(
            consensusClient,
            (message) => console.log(message.toString()),
            (error) => console.log(`Error: ${error}`)
        );

    for (let i = 0; ; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await (await new ConsensusSubmitMessageTransaction()
            .setTopicId(topicId)
            .setMessage(`Hello, HCS! Message ${i}`)
            .sign(operatorPrivateKey) // Must sign by the topic's submitKey
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

