require("dotenv").config();

const {
    Client,
    PrivateKey,
    ContractCreateTransaction,
    FileCreateTransaction,
    ContractDeleteTransaction,
    ContractCallQuery,
    Hbar,
    AccountId,
} = require("@hashgraph/sdk");

const helloWorld = require("./hello_world.json");

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const contractByteCode = helloWorld.object;

    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([client.operatorPublicKey])
        .setContents(contractByteCode)
        .execute(client);

    const fileReceipt = await fileTransactionResponse.getReceipt(client);
    const fileId = fileReceipt.fileId;

    console.log(`contract bytecode file: ${fileId}`);

    const contractTransactionResponse = await new ContractCreateTransaction()
        .setGas(75000)
        .setBytecodeFileId(fileId)
        .setAdminKey(client.operatorPublicKey)
        .execute(client);

    const contractReceipt = await contractTransactionResponse.getReceipt(client);
    const contractId = contractReceipt.contractId;

    console.log(`new contract ID: ${contractId}`);

    const contractCallResult = await new ContractCallQuery()
        .setGas(75000)
        .setContractId(contractId)
        .setFunction("greet")
        .setQueryPayment(new Hbar(1))
        .execute(client);

    if (contractCallResult.errorMessage != null && contractCallResult.errorMessage != "") {
        console.log(`error calling contract: ${contractCallResult.errorMessage}`);
    }

    const message = contractCallResult.getString(0);
    console.log(`contract message: ${message}`);

    const contractDeleteResult = await new ContractDeleteTransaction()
        .setContractId(contractId)
        .execute(client);

    const contractDeleteReceipt = await contractDeleteResult.getReceipt(client);

    console.log("contract successfully deleted");
}

void main();
