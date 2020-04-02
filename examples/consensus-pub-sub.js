const {
    Client,
    MirrorClient,
    MirrorConsensusTopicQuery,
    ConsensusTopicCreateTransaction,
    EncryptionKey,
    ConsensusClient
} = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;
    const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;
    const passphrase = process.env.PASSPHRASE;

    if (operatorPrivateKey == null ||
        operatorAccount == null ||
        mirrorNodeAddress == null ||
        passphrase == null) {
        throw new Error("environment variables OPERATOR_KEY, OPERATOR_ID, MIRROR_NODE_ADDRESS, PASSPHRASE must be present");
    }

    const encryptionKey = await EncryptionKey.fromPassphrase(passphrase);

    const mirrorClient = new MirrorClient(mirrorNodeAddress);

    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);

    const transactionId = await new ConsensusTopicCreateTransaction()
        .setTopicMemo("sdk example create_pub_sub.js")
        .setMaxTransactionFee(100000000000)
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    const topicId = transactionReceipt.getConsensusTopicId();

    console.log(`topicId = ${topicId}`);

    const consensusClient = new ConsensusClient(client)
        .setTopicId(topicId)
        .setEncryptionKey(encryptionKey);

    /* eslint-disable no-unused-vars */
    new MirrorConsensusTopicQuery()
        .setTopicId(topicId)
        .setEncryptionKeyProvider((
            keyFingerPrint,
            passphraseFingerPrint,
            salt
        ) => encryptionKey)
        .subscribe(
            mirrorClient,
            (message) => console.log(message.toString()),
            (error) => console.log(`Error: ${error}`)
        );
    /* eslint-enable */

    for (let i = 0; ; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        consensusClient.send(`Sent message ${i}`);

        console.log(`Sent message ${i}`);

        // eslint-disable-next-line no-await-in-loop
        await sleep(2500);
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

main();

