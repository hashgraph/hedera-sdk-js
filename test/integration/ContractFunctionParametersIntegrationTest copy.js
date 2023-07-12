import {
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractCallQuery,
    Hbar,
    ContractFunctionParameters,
    FileAppendTransaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";
import BigNumber from "bignumber.js";

let smartContractBytecode =
    "0x608060405234801561001057600080fd5b5060408051608081018252600491810182815263082d8caf60e31b6060830190815290825260016020830152909160009161004d91839190610060565b5060208201518160010155905050610134565b82805461006c906100f9565b90600052602060002090601f01602090048101928261008e57600085556100d4565b82601f106100a757805160ff19168380011785556100d4565b828001600101855582156100d4579182015b828111156100d45782518255916020019190600101906100b9565b506100e09291506100e4565b5090565b5b808211156100e057600081556001016100e5565b600181811c9082168061010d57607f821691505b6020821081141561012e57634e487b7160e01b600052602260045260246000fd5b50919050565b6101e6806101436000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063fba1bc4c14610030575b600080fd5b61003861004e565b6040516100459190610111565b60405180910390f35b604080518082019091526060815260006020820152600060405180604001604052908160008201805461008090610175565b80601f01602080910402602001604051908101604052809291908181526020018280546100ac90610175565b80156100f95780601f106100ce576101008083540402835291602001916100f9565b820191906000526020600020905b8154815290600101906020018083116100dc57829003601f168201915b50505050508152602001600182015481525050905090565b6000602080835283516040828501528051806060860152835b818110156101465782810184015186820160800152830161012a565b818111156101575784608083880101525b50949091015160408401525050601f91909101601f19160160800190565b600181811c9082168061018957607f821691505b602082108114156101aa57634e487b7160e01b600052602260045260246000fd5b5091905056fea26469706673582212207b733d3e78d1b5818d33ad5602b825d8375bb8281300f06c2408102f454a120764736f6c63430008040033";

describe("ContractFunctionParameters", function () {
    this.timeout(120000);
    let env;
    let newContractId;

    before(async function () {
        env = await IntegrationTestEnv.new({ balance: 100000 });
        // Create a file on Hedera and store the bytecode
        const fileCreateTx = new FileCreateTransaction()
            .setKeys([env.operatorKey])
            .freezeWith(env.client);
        const fileCreateSign = await fileCreateTx.sign(env.operatorKey);
        const fileCreateSubmit = await fileCreateSign.execute(env.client);
        const fileCreateRx = await fileCreateSubmit.getReceipt(env.client);
        const bytecodeFileId = fileCreateRx.fileId;
        console.log(`- The bytecode file ID is: ${bytecodeFileId} \n`);

        //Append contents to the file
        const fileAppendTx = new FileAppendTransaction()
            .setFileId(bytecodeFileId)
            .setContents(smartContractBytecode)
            .setMaxChunks(10)
            .freezeWith(env.client);
        const fileAppendSign = await fileAppendTx.sign(env.operatorKey);
        const fileAppendSubmit = await fileAppendSign.execute(env.client);
        const fileAppendRx = await fileAppendSubmit.getReceipt(env.client);
        console.log(
            "Status of file append is",
            fileAppendRx.status.toString(10)
        );

        // Instantiate the contract instance
        const contractTx = await new ContractCreateTransaction()
            //Set the file ID of the Hedera file storing the bytecode
            .setBytecodeFileId(bytecodeFileId)
            //Set the gas to instantiate the contract
            .setGas(100000)
            //Provide the constructor parameters for the contract
            .setConstructorParameters();

        //Submit the transaction to the Hedera test network
        const contractResponse = await contractTx.execute(env.client);

        //Get the receipt of the file create transaction
        const contractReceipt = await contractResponse.getReceipt(env.client);

        //Get the smart contract ID
        newContractId = contractReceipt.contractId;

        //Log the smart contract ID
        console.log("The smart contract ID is " + newContractId);
    });
    it("should return the right User value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction("get_user")
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        const result = txResponse.getResult(["tuple(string, uint256)"]);

        console.log(result);
    });

    after(async function () {
        await env.close();
    });
});
