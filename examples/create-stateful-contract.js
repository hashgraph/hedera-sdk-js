const {
    Client, FileCreateTransaction, ContractCreateTransaction, Hbar, Ed25519PrivateKey,
    ContractFunctionParams, ContractCallQuery
} = require("@hashgraph/sdk");

function createHederaClient() {
    const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    return [
        operatorPrivateKey,
        new Client({
            network: { "0.testnet.hedera.com:50211": "0.0.3" },
            operator: {
                account: operatorAccount,
                privateKey: operatorPrivateKey
            }
        })
    ];
}

async function main() {
    const [ operatorPrivateKey, hederaClient ] = createHederaClient();

    const smartContract = require("./stateful.json");
    const smartContractByteCode = smartContract.contracts[ "stateful.sol:StatefulContract" ].bin;

    console.log("contract bytecode size:", smartContractByteCode.length, "bytes");

    // First we must upload a file containing the byte code
    const byteCodeFileId = (await (await new FileCreateTransaction()
        .setMaxTransactionFee(Hbar.of(3))
        .addKey(operatorPrivateKey.publicKey)
        .setContents(smartContractByteCode)
        .execute(hederaClient))
        .getReceipt(hederaClient))
        .fileId;

    console.log("contract bytecode file:", byteCodeFileId.toString());

    // Next we instantiate the contract instance
    const record = await (await new ContractCreateTransaction()
        .setMaxTransactionFee(Hbar.of(100))
        // Failing to set this to an adequate amount
        // INSUFFICIENT_GAS
        .setGas(10000)
        // Failing to set parameters when parameters are required
        // CONTRACT_REVERT_EXECUTED
        .setConstructorParams(new ContractFunctionParams()
            .addString("hello from hedera"))
        .setBytecodeFileId(byteCodeFileId)
        .execute(hederaClient))
        .getRecord(hederaClient);

    console.log("contract create gas used:", record.contractCreateResult.gasUsed);
    console.log("contract create transaction fee:", record.transactionFee);
    console.log("contract:", record.receipt.contractId.toString());

    // Next let's ask for the current message (we set on creation)
    const callResult = await new ContractCallQuery()
        .setContractId(record.receipt.contractId)
        .setGas(1000)
        .setFunction("getMessage", null)
        .execute(hederaClient);

    console.log("call gas used:", callResult.gasUsed);
    console.log("message:", callResult.getString(0));

    // TODO: Update the message
    // TODO: Set a new message
}

main();
