const {
    Client,
    MirrorClient,
    MirrorConsensusTopicQuery,
    ConsensusTopicCreateTransaction,
    ConsensusMessageSubmitTransaction,
    Ed25519PrivateKey,
    AccountId,
} = require("@hashgraph/sdk");

async function main() {
    if (
        process.env.OPERATOR_KEY == null ||
        process.env.OPERATOR_ID == null ||
        process.env.MIRROR_NODE_ADDRESS == null
    ) {
        throw new Error("environment variables OPERATOR_KEY, OPERATOR_ID, and MIRROR_NODE_ADDRESS must be present");
    }

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

    let operatorPrivateKey;
    let operatorAccount;

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        operatorAccount = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorAccount, operatorPrivateKey);
    }

    const consensusClient = new MirrorClient(process.env.MIRROR_NODE_ADDRESS);

    const transactionId = await new ConsensusTopicCreateTransaction()
        .setTopicMemo("sdk example create_pub_sub.js")
        .setMaxTransactionFee(100000000000)
    // .setAdminKey(operatorPrivateKey.publicKey) // allows updateTopic
        .setSubmitKey(operatorPrivateKey.publicKey) // allows control access to submit messages
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    const topicId = transactionReceipt.getConsensusTopicId();

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
        await (await new ConsensusMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(`Hello, HCS! Message ${i}`)
            .build(client)[0]
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

