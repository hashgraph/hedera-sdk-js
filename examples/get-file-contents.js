const { Client, FileContentsQuery, FileId } = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);

    const resp = await new FileContentsQuery()
        .setFileId(FileId.ADDRESS_BOOK)
        .execute(client);

    console.log(resp);
}

main();
