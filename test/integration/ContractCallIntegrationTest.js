import {
    ContractCallQuery,
    ContractCreateTransaction,
    ContractDeleteTransaction,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    FileCreateTransaction,
    FileDeleteTransaction,
    Hbar,
    Status,
    AccountId,
    PrivateKey,
    FileAppendTransaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

const smartContractBytecode =
    "608060405234801561001057600080fd5b506040516104d73803806104d78339818101604052602081101561003357600080fd5b810190808051604051939291908464010000000082111561005357600080fd5b90830190602082018581111561006857600080fd5b825164010000000081118282018810171561008257600080fd5b82525081516020918201929091019080838360005b838110156100af578181015183820152602001610097565b50505050905090810190601f1680156100dc5780820380516001836020036101000a031916815260200191505b506040525050600080546001600160a01b0319163317905550805161010890600190602084019061010f565b50506101aa565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061015057805160ff191683800117855561017d565b8280016001018555821561017d579182015b8281111561017d578251825591602001919060010190610162565b5061018992915061018d565b5090565b6101a791905b808211156101895760008155600101610193565b90565b61031e806101b96000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063368b87721461004657806341c0e1b5146100ee578063ce6d41de146100f6575b600080fd5b6100ec6004803603602081101561005c57600080fd5b81019060208101813564010000000081111561007757600080fd5b82018360208201111561008957600080fd5b803590602001918460018302840111640100000000831117156100ab57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550610173945050505050565b005b6100ec6101a2565b6100fe6101ba565b6040805160208082528351818301528351919283929083019185019080838360005b83811015610138578181015183820152602001610120565b50505050905090810190601f1680156101655780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6000546001600160a01b0316331461018a5761019f565b805161019d906001906020840190610250565b505b50565b6000546001600160a01b03163314156101b85733ff5b565b60018054604080516020601f600260001961010087891615020190951694909404938401819004810282018101909252828152606093909290918301828280156102455780601f1061021a57610100808354040283529160200191610245565b820191906000526020600020905b81548152906001019060200180831161022857829003601f168201915b505050505090505b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061029157805160ff19168380011785556102be565b828001600101855582156102be579182015b828111156102be5782518255916020019190600101906102a3565b506102ca9291506102ce565b5090565b61024d91905b808211156102ca57600081556001016102d456fea264697066735822122084964d4c3f6bc912a9d20e14e449721012d625aa3c8a12de41ae5519752fc89064736f6c63430006000033";
const readDataBytecode =
    "0x608060405234801561001057600080fd5b5061026c806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806304806dd61461003b5780634278774714610064575b600080fd5b61004e610049366004610178565b610084565b60405161005b91906101a2565b60405180910390f35b610077610072366004610178565b610101565b60405161005b91906101f1565b606060008262ffffff1667ffffffffffffffff8111156100b457634e487b7160e01b600052604160045260246000fd5b6040519080825280602002602001820160405280156100f957816020015b60408051808201909152600080825260208201528152602001906001900390816100d25790505b509392505050565b606060008262ffffff1667ffffffffffffffff81111561013157634e487b7160e01b600052604160045260246000fd5b6040519080825280602002602001820160405280156100f957816020015b60408051602081019091526000815281526020019060019003908161014f579050509392505050565b600060208284031215610189578081fd5b813562ffffff8116811461019b578182fd5b9392505050565b602080825282518282018190526000919060409081850190868401855b828110156101e4578151805185528601518685015292840192908501906001016101bf565b5091979650505050505050565b6020808252825182820181905260009190848201906040850190845b8181101561022a578351518352928401929184019160010161020d565b5090969550505050505056fea26469706673582212201dc78aeb6e1955ac889c23cf72d0595af987863764ccb6270c7825992093969264736f6c63430008040033";

describe("ContractCallIntegration", function () {
    it("should be executable", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        const response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(smartContractBytecode)
            .execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        receipt = await (
            await new ContractCreateTransaction()
                .setAdminKey(operatorKey)
                .setGas(100000)
                .setConstructorParameters(
                    new ContractFunctionParameters().addString(
                        "Hello from Hedera."
                    )
                )
                .setBytecodeFileId(file)
                .setContractMemo("[e2e::ContractCreateTransaction]")
                .execute(env.client)
        ).getReceipt(env.client);

        expect(receipt.contractId).to.not.be.null;
        expect(receipt.contractId != null ? receipt.contractId.num > 0 : false)
            .to.be.true;

        const contract = receipt.contractId;

        const callQuery = new ContractCallQuery()
            .setContractId(contract)
            .setQueryPayment(new Hbar(1))
            .setGas(75000)
            .setFunction("getMessage");

        const cost = callQuery.getCost(env.client);

        let result = await callQuery
            .setMaxQueryPayment(cost)
            .execute(env.client);

        expect(result.getString(0)).to.be.equal("Hello from Hedera.");

        await (
            await new ContractExecuteTransaction()
                .setContractId(contract)
                .setGas(75000)
                .setFunction(
                    "setMessage",
                    new ContractFunctionParameters().addString("new message")
                )
                .execute(env.client)
        ).getReceipt(env.client);

        result = await new ContractCallQuery()
            .setContractId(contract)
            .setQueryPayment(new Hbar(5))
            .setGas(75000)
            .setFunction("getMessage")
            .execute(env.client);

        expect(result.getString(0)).to.be.equal("new message");

        await (
            await new ContractDeleteTransaction()
                .setContractId(contract)
                .setTransferAccountId(env.client.operatorAccountId)
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error when function to call is not set", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        const response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(smartContractBytecode)
            .execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        receipt = await (
            await new ContractCreateTransaction()
                .setAdminKey(operatorKey)
                .setGas(100000)
                .setConstructorParameters(
                    new ContractFunctionParameters().addString(
                        "Hello from Hedera."
                    )
                )
                .setBytecodeFileId(file)
                .setContractMemo("[e2e::ContractCreateTransaction]")
                .execute(env.client)
        ).getReceipt(env.client);

        expect(receipt.contractId).to.not.be.null;
        expect(receipt.contractId != null ? receipt.contractId.num > 0 : false)
            .to.be.true;

        const contract = receipt.contractId;

        let err = false;

        try {
            await new ContractCallQuery()
                .setContractId(contract)
                .setQueryPayment(new Hbar(1))
                .setGas(75000)
                .setMaxQueryPayment(new Hbar(5))
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.ContractRevertExecuted);
        }

        await (
            await new ContractDeleteTransaction()
                .setContractId(contract)
                .setTransferAccountId(env.client.operatorAccountId)
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("query did not error");
        }
        await env.close();
    });

    it("should error when gas is not set", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        const response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(smartContractBytecode)
            .execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        receipt = await (
            await new ContractCreateTransaction()
                .setAdminKey(operatorKey)
                .setGas(100000)
                .setConstructorParameters(
                    new ContractFunctionParameters().addString(
                        "Hello from Hedera."
                    )
                )
                .setBytecodeFileId(file)
                .setContractMemo("[e2e::ContractCreateTransaction]")
                .execute(env.client)
        ).getReceipt(env.client);

        expect(receipt.contractId).to.not.be.null;
        expect(receipt.contractId != null ? receipt.contractId.num > 0 : false)
            .to.be.true;

        const contract = receipt.contractId;

        let err = false;

        try {
            await new ContractCallQuery()
                .setContractId(contract)
                .setQueryPayment(new Hbar(1))
                .setMaxQueryPayment(new Hbar(5))
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InsufficientGas);
        }

        await (
            await new ContractDeleteTransaction()
                .setContractId(contract)
                .setTransferAccountId(env.client.operatorAccountId)
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("query did not error");
        }
        await env.close();
    });

    it("should error when contract ID is not set", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        const response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(smartContractBytecode)
            .execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        receipt = await (
            await new ContractCreateTransaction()
                .setAdminKey(operatorKey)
                .setGas(100000)
                .setConstructorParameters(
                    new ContractFunctionParameters().addString(
                        "Hello from Hedera."
                    )
                )
                .setBytecodeFileId(file)
                .setContractMemo("[e2e::ContractCreateTransaction]")
                .execute(env.client)
        ).getReceipt(env.client);

        expect(receipt.contractId).to.not.be.null;
        expect(receipt.contractId != null ? receipt.contractId.num > 0 : false)
            .to.be.true;

        const contract = receipt.contractId;

        let err = false;

        try {
            await new ContractCallQuery()
                .setGas(75000)
                .setFunction("getMessage")
                .setQueryPayment(new Hbar(1))
                .setMaxQueryPayment(new Hbar(5))
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidContractId);
        }

        await (
            await new ContractDeleteTransaction()
                .setContractId(contract)
                .setTransferAccountId(env.client.operatorAccountId)
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("query did not error");
        }

        await env.close();
    });

    it.skip("should timeout when network node takes longer than 10s to execute the transaction", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        const response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(readDataBytecode)
            .execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        receipt = await (
            await new ContractCreateTransaction()
                .setAdminKey(operatorKey)
                //Set the file ID of the Hedera file storing the bytecode
                .setBytecodeFileId(file)
                //Set the gas to instantiate the contract
                .setGas(100000)
                //Provide the constructor parameters for the contract
                .setConstructorParameters()
                .execute(env.client)
        ).getReceipt(env.client);

        expect(receipt.contractId).to.not.be.null;
        expect(receipt.contractId != null ? receipt.contractId.num > 0 : false)
            .to.be.true;

        const contractId = receipt.contractId;

        let err = false;
        try {
            const contractQuery = await new ContractCallQuery()
                //Set the gas for the query
                .setGas(15_000_000)
                //Set the contract ID to return the request for
                .setContractId(contractId)
                //Set the contract function to call
                .setFunction(
                    "getLotsOfData",
                    new ContractFunctionParameters().addUint24(10000)
                )
                //Set the query payment for the node returning the request
                //This value must cover the cost of the request otherwise will fail
                .setQueryPayment(new Hbar(2));

            //Submit to a Hedera network
            //   const txResponse = await contractQuery.execute(client);
            //   const txResponse2 = await contractQuery2.execute(client);
            await contractQuery.execute(env.client);
        } catch (error) {
            err = error;
        }
        expect(err.toString()).to.includes("TIMEOUT");

        await (
            await new ContractDeleteTransaction()
                .setContractId(contractId)
                .setTransferAccountId(env.client.operatorAccountId)
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("query did not error");
        }

        await env.close();
    });

    it.only("2 should timeout when network node takes longer than 10s to execute the transaction", async function () {
        this.timeout(50000);

        const myAccountId = AccountId.fromString(process.env.OPERATOR_ID);
        const myPrivateKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        const env = await IntegrationTestEnv.new();
        const client = env.client;
        client.setOperator(myAccountId, myPrivateKey);
        // Create a file on Hedera and store the bytecode
        const fileCreateTx = new FileCreateTransaction()
            .setKeys([myPrivateKey])
            .freezeWith(client);
        const fileCreateSign = await fileCreateTx.sign(myPrivateKey);
        const fileCreateSubmit = await fileCreateSign.execute(client);
        const fileCreateRx = await fileCreateSubmit.getReceipt(client);
        const bytecodeFileId = fileCreateRx.fileId;
        console.log(`The bytecode file ID is: ${bytecodeFileId} \n`);

        //Append contents to the file
        const fileAppendTx = new FileAppendTransaction()
            .setFileId(bytecodeFileId)
            .setContents(readDataBytecode)
            .setMaxChunks(10)
            .freezeWith(client);
        const fileAppendSign = await fileAppendTx.sign(myPrivateKey);
        const fileAppendSubmit = await fileAppendSign.execute(client);
        const fileAppendRx = await fileAppendSubmit.getReceipt(client);
        console.log("Status of file append is", fileAppendRx.status.toString());

        // Instantiate the contract instance
        const contractTx = await new ContractCreateTransaction()
            //Set the file ID of the Hedera file storing the bytecode
            .setBytecodeFileId(bytecodeFileId)
            //Set the gas to instantiate the contract
            .setGas(100000)
            //Provide the constructor parameters for the contract
            .setConstructorParameters();

        //Submit the transaction to the Hedera test network
        const contractResponse = await contractTx.execute(client);

        //Get the receipt of the file create transaction
        const contractReceipt = await contractResponse.getReceipt(client);

        expect(contractReceipt.contractId).to.not.be.null;
        expect(
            contractReceipt.contractId != null
                ? contractReceipt.contractId.num > 0
                : false
        ).to.be.true;

        const contractId = contractReceipt.contractId;

        let err = false;
        try {
            const contractQuery = await new ContractCallQuery()
                //Set the gas for the query
                .setGas(15000000)
                //Set the contract ID to return the request for
                .setContractId(contractId)
                //Set the contract function to call
                .setFunction(
                    "getLotsOfData",
                    new ContractFunctionParameters().addUint24(17000)
                )
                //Set the query payment for the node returning the request
                //This value must cover the cost of the request otherwise will fail
                .setQueryPayment(new Hbar(2));

            //Submit to a Hedera network
            //   const txResponse = await contractQuery.execute(client);
            //   const txResponse2 = await contractQuery2.execute(client);
            const txResponse = await contractQuery.execute(client);
            console.log("Res:", txResponse.getUint32(1));
        } catch (error) {
            console.log("Printing error:", error);
            err = error;
        }
        expect(err.toString()).to.includes("TIMEOUT");

        if (!err) {
            throw new Error("query did not error");
        }

        await client.close();
    });
});
