require("dotenv").config();

const {
    Client,
    PrivateKey,
    FileId,
    ContractCreateTransaction,
    Hbar,
    AccountId,
} = require("@hashgraph/sdk");

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

    const props={
        byteCodeField:new FileId(1,1,1),
        adminKey:PrivateKey.generate(),
        gas:500,
        initialBalance:new Hbar(111),
        proxyAccoundId:AccountId.fromString("1.1.0"),
        autoRenewPeriod:0,
        constructorParameters:new Uint8Array(),
        contractMemo:"This is a memo"
    };

    console.log(props);

    console.log(`private key = ${props.adminKey}`);
    console.log(`public key = ${props.adminKey.publicKey}`);

    const simpleContract = await new ContractCreateTransaction(props);

    console.log(simpleContract);

}

void main();










