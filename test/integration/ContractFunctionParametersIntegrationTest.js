import {
    AccountId,
    PrivateKey,
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
    "0x608060405234801561001057600080fd5b50611644806100206000396000f3fe608060405234801561001057600080fd5b50600436106103db5760003560e01c80637ec32d841161020a578063ba945bdb11610125578063dbb04ed9116100b8578063e713cda811610087578063e713cda814610c1a578063f4e490f514610c3d578063f6e877f414610c5e578063f8293f6e14610c84578063ffb8050114610ca657600080fd5b8063dbb04ed914610b7e578063e05e91e014610ba7578063e066de5014610bce578063e0f53e2414610bf457600080fd5b8063c7d8b87e116100f4578063c7d8b87e14610ae7578063cbd2e6a514610b0d578063cdb9e4e814610b32578063d79d4d4014610b5857600080fd5b8063ba945bdb14610a51578063bb6b524314610a77578063c503772d14610a9d578063c6c18a1c14610abd57600080fd5b8063a1bda1221161019d578063b4e3e7b11161016c578063b4e3e7b1146109c3578063b834bfe9146109e9578063b8da8d1614610a0a578063b989c7ee14610a3057600080fd5b8063a1bda1221461093a578063a401d60d1461095b578063a75761f114610981578063b2db404a146109a257600080fd5b806394cd7c80116101d957806394cd7c80146108b157806398508ba3146108d25780639b1794ae146108f3578063a08b9f671461091957600080fd5b80637ec32d8414610828578063881c8fb71461084957806388b7e6f51461086f578063923f5edf1461089057600080fd5b806333520ec3116102fa578063628bc3ef1161028d57806370a5cb811161025c57806370a5cb811461079457806372a06b4d146107c0578063796a27ea146107e15780637d0dc2621461080757600080fd5b8063628bc3ef1461071057806364e008c11461073157806368ef4466146107525780636a54715c1461077357600080fd5b8063407b899b116102c9578063407b899b1461069c57806344e7b037146106bd578063545e2113146106e357806359adb2df1461059257600080fd5b806333520ec3146106115780633b45e6e0146106325780633e1a2771146106535780633f396e671461067457600080fd5b806311ec6c901161037257806322937ea91161034157806322937ea9146105925780632ef16e8e146105ae5780632f47a40d146105cf5780632f6c1bb4146105f057600080fd5b806311ec6c9014610509578063129ed5da1461052a57806312cd95a114610550578063189cea8e1461057157600080fd5b806308123e09116103ae57806308123e09146104805780630a958dc8146104a657806310d54553146104c7578063118b8415146104e857600080fd5b8063017fa10b146103e0578063021d88ab1461040e578063037454301461043957806306ac6fe11461045a575b600080fd5b6103f16103ee36600461117a565b90565b6040516001600160801b0390911681526020015b60405180910390f35b61041c6103ee36600461158c565b6040516bffffffffffffffffffffffff9091168152602001610405565b6104476103ee366004610ce2565b604051600c9190910b8152602001610405565b6104686103ee366004611153565b6040516001600160781b039091168152602001610405565b61048e6103ee36600461149e565b60405166ffffffffffffff9091168152602001610405565b6104b46103ee366004610fd7565b60405160049190910b8152602001610405565b6104d56103ee366004610d8e565b60405160119190910b8152602001610405565b6104f66103ee366004610f7d565b604051601e9190910b8152602001610405565b6105176103ee366004610df1565b60405160139190910b8152602001610405565b6105386103ee3660046111ef565b6040516001600160981b039091168152602001610405565b61055e6103ee366004610daf565b60405160129190910b8152602001610405565b61057f6103ee366004610e54565b60405160169190910b8152602001610405565b6105a06103ee366004610f9e565b604051908152602001610405565b6105bc6103ee366004610f5c565b604051601d9190910b8152602001610405565b6105dd6103ee3660046110bd565b604051600a9190910b8152602001610405565b6105fe6103ee366004610eb7565b60405160199190910b8152602001610405565b61061f6103ee366004610ed8565b604051601a9190910b8152602001610405565b6106406103ee366004610d6d565b60405160109190910b8152602001610405565b6106616103ee366004610f1a565b604051601c9190910b8152602001610405565b6106826103ee3660046114ed565b60405168ffffffffffffffffff9091168152602001610405565b6106aa6103ee36600461103a565b60405160079190910b8152602001610405565b6106cb6103ee366004611238565b6040516001600160a01b039091168152602001610405565b6106f66106f136600461107c565b610cca565b60408051600093840b81529190920b602082015201610405565b61071e6103ee36600461109c565b60405160099190910b8152602001610405565b61073f6103ee366004610e75565b60405160179190910b8152602001610405565b6107606103ee366004610e12565b60405160149190910b8152602001610405565b6107816103ee366004611019565b60405160069190910b8152602001610405565b6107a26103ee3660046110ff565b6040516cffffffffffffffffffffffffff9091168152602001610405565b6107ce6103ee36600461107c565b60405160009190910b8152602001610405565b6107ef6103ee366004611349565b6040516001600160d81b039091168152602001610405565b6108156103ee366004610ef9565b604051601b9190910b8152602001610405565b6108366103ee366004610f3b565b60405160029190910b8152602001610405565b6108576103ee366004611286565b6040516001600160b01b039091168152602001610405565b61087d6103ee366004610d4c565b604051600f9190910b8152602001610405565b61089e6103ee366004610e33565b60405160159190910b8152602001610405565b6108bf6103ee366004610e96565b60405160189190910b8152602001610405565b6108e06103ee366004610d0a565b604051600d9190910b8152602001610405565b6109016103ee3660046112ad565b6040516001600160b81b039091168152602001610405565b6109276103ee3660046110de565b604051600b9190910b8152602001610405565b6109486103ee366004610dd0565b60405160019190910b8152602001610405565b6109696103ee3660046113e1565b6040516001600160f01b039091168152602001610405565b61098f6103ee366004611216565b60405161ffff9091168152602001610405565b6109b06103ee366004610ff8565b60405160059190910b8152602001610405565b6109d16103ee36600461112c565b6040516001600160701b039091168152602001610405565b6109f76103ee366004610d2b565b604051600e9190910b8152602001610405565b610a186103ee36600461125f565b6040516001600160a81b039091168152602001610405565b610a3e6103ee366004610fb6565b60405160039190910b8152602001610405565b610a5f6103ee3660046111a1565b6040516001600160881b039091168152602001610405565b610a856103ee3660046112fb565b6040516001600160c81b039091168152602001610405565b610aab6103ee366004611516565b60405160ff9091168152602001610405565b610acb6103ee366004611561565b6040516affffffffffffffffffffff9091168152602001610405565b610af56103ee366004611408565b6040516001600160f81b039091168152602001610405565b610b1b6103ee366004611478565b60405165ffffffffffff9091168152602001610405565b610b406103ee366004611370565b6040516001600160e01b039091168152602001610405565b610b666103ee366004611322565b6040516001600160d01b039091168152602001610405565b610b8c6103ee366004611537565b60405169ffffffffffffffffffff9091168152602001610405565b610bb56103ee3660046114c5565b60405167ffffffffffffffff9091168152602001610405565b610bdc6103ee366004611397565b6040516001600160e81b039091168152602001610405565b610c026103ee3660046112d4565b6040516001600160c01b039091168152602001610405565b610c286103ee36600461142f565b60405163ffffffff9091168152602001610405565b610c4b6103ee36600461105b565b60405160089190910b8152602001610405565b610c6c6103ee3660046111c8565b6040516001600160901b039091168152602001610405565b610c926103ee3660046113be565b60405162ffffff9091168152602001610405565b610cb46103ee366004611453565b60405164ffffffffff9091168152602001610405565b60008082610cd98160146115b8565b91509150915091565b600060208284031215610cf3578081fd5b813580600c0b8114610d03578182fd5b9392505050565b600060208284031215610d1b578081fd5b813580600d0b8114610d03578182fd5b600060208284031215610d3c578081fd5b813580600e0b8114610d03578182fd5b600060208284031215610d5d578081fd5b813580600f0b8114610d03578182fd5b600060208284031215610d7e578081fd5b81358060100b8114610d03578182fd5b600060208284031215610d9f578081fd5b81358060110b8114610d03578182fd5b600060208284031215610dc0578081fd5b81358060120b8114610d03578182fd5b600060208284031215610de1578081fd5b81358060010b8114610d03578182fd5b600060208284031215610e02578081fd5b81358060130b8114610d03578182fd5b600060208284031215610e23578081fd5b81358060140b8114610d03578182fd5b600060208284031215610e44578081fd5b81358060150b8114610d03578182fd5b600060208284031215610e65578081fd5b81358060160b8114610d03578182fd5b600060208284031215610e86578081fd5b81358060170b8114610d03578182fd5b600060208284031215610ea7578081fd5b81358060180b8114610d03578182fd5b600060208284031215610ec8578081fd5b81358060190b8114610d03578182fd5b600060208284031215610ee9578081fd5b813580601a0b8114610d03578182fd5b600060208284031215610f0a578081fd5b813580601b0b8114610d03578182fd5b600060208284031215610f2b578081fd5b813580601c0b8114610d03578182fd5b600060208284031215610f4c578081fd5b81358060020b8114610d03578182fd5b600060208284031215610f6d578081fd5b813580601d0b8114610d03578182fd5b600060208284031215610f8e578081fd5b813580601e0b8114610d03578182fd5b600060208284031215610faf578081fd5b5035919050565b600060208284031215610fc7578081fd5b81358060030b8114610d03578182fd5b600060208284031215610fe8578081fd5b81358060040b8114610d03578182fd5b600060208284031215611009578081fd5b81358060050b8114610d03578182fd5b60006020828403121561102a578081fd5b81358060060b8114610d03578182fd5b60006020828403121561104b578081fd5b81358060070b8114610d03578182fd5b60006020828403121561106c578081fd5b81358060080b8114610d03578182fd5b60006020828403121561108d578081fd5b813580820b8114610d03578182fd5b6000602082840312156110ad578081fd5b81358060090b8114610d03578182fd5b6000602082840312156110ce578081fd5b813580600a0b8114610d03578182fd5b6000602082840312156110ef578081fd5b813580600b0b8114610d03578182fd5b600060208284031215611110578081fd5b81356cffffffffffffffffffffffffff81168114610d03578182fd5b60006020828403121561113d578081fd5b81356001600160701b0381168114610d03578182fd5b600060208284031215611164578081fd5b81356001600160781b0381168114610d03578182fd5b60006020828403121561118b578081fd5b81356001600160801b0381168114610d03578182fd5b6000602082840312156111b2578081fd5b81356001600160881b0381168114610d03578182fd5b6000602082840312156111d9578081fd5b81356001600160901b0381168114610d03578182fd5b600060208284031215611200578081fd5b81356001600160981b0381168114610d03578182fd5b600060208284031215611227578081fd5b813561ffff81168114610d03578182fd5b600060208284031215611249578081fd5b81356001600160a01b0381168114610d03578182fd5b600060208284031215611270578081fd5b81356001600160a81b0381168114610d03578182fd5b600060208284031215611297578081fd5b81356001600160b01b0381168114610d03578182fd5b6000602082840312156112be578081fd5b81356001600160b81b0381168114610d03578182fd5b6000602082840312156112e5578081fd5b81356001600160c01b0381168114610d03578182fd5b60006020828403121561130c578081fd5b81356001600160c81b0381168114610d03578182fd5b600060208284031215611333578081fd5b81356001600160d01b0381168114610d03578182fd5b60006020828403121561135a578081fd5b81356001600160d81b0381168114610d03578182fd5b600060208284031215611381578081fd5b81356001600160e01b0381168114610d03578182fd5b6000602082840312156113a8578081fd5b81356001600160e81b0381168114610d03578182fd5b6000602082840312156113cf578081fd5b813562ffffff81168114610d03578182fd5b6000602082840312156113f2578081fd5b81356001600160f01b0381168114610d03578182fd5b600060208284031215611419578081fd5b81356001600160f81b0381168114610d03578182fd5b600060208284031215611440578081fd5b813563ffffffff81168114610d03578182fd5b600060208284031215611464578081fd5b813564ffffffffff81168114610d03578182fd5b600060208284031215611489578081fd5b813565ffffffffffff81168114610d03578182fd5b6000602082840312156114af578081fd5b813566ffffffffffffff81168114610d03578182fd5b6000602082840312156114d6578081fd5b813567ffffffffffffffff81168114610d03578182fd5b6000602082840312156114fe578081fd5b813568ffffffffffffffffff81168114610d03578182fd5b600060208284031215611527578081fd5b813560ff81168114610d03578182fd5b600060208284031215611548578081fd5b813569ffffffffffffffffffff81168114610d03578182fd5b600060208284031215611572578081fd5b81356affffffffffffffffffffff81168114610d03578182fd5b60006020828403121561159d578081fd5b81356bffffffffffffffffffffffff81168114610d03578182fd5b600081810b83820b82821282607f038213811516156115d9576115d96115f8565b82607f190382128116156115ef576115ef6115f8565b50019392505050565b634e487b7160e01b600052601160045260246000fdfea2646970667358221220fc28f06e721d257e77a43671c4de60de239b31a83a290baf6054ddea4b434a0a64736f6c63430008040033";

describe.only("ContractFunctionParameters", function () {
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
        const contractResponse = await contractTx.execute(env.client);

        //Get the receipt of the file create transaction
        const contractReceipt = await contractResponse.getReceipt(env.client);

        //Get the smart contract ID
        newContractId = contractReceipt.contractId;

        //Log the smart contract ID
        console.log("The smart contract ID is " + newContractId);
    });
    it("should return the right uint8 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint8",
                new ContractFunctionParameters().addUint8(255)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint8(0)).to.be.equal(255);
    });

    it("should return the right min int8 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt8",
                new ContractFunctionParameters().addInt8(-128)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);
        expect(txResponse.getInt8(0)).to.be.equal(-128);
    });

    it("should return the right min multiple int8 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt8Multiple", // return two params: input & input (+) 20 // -128 + 20 = - 108
                new ContractFunctionParameters().addInt8(-128)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt8(0)).to.be.equal(-128);
        expect(txResponse.getInt8(1)).to.be.equal(-108);
    });

    it("should return the right max int8 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt8",
                new ContractFunctionParameters().addInt8(127)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt8(0)).to.be.equal(127);
    });

    it("should return the right uint16 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint16",
                new ContractFunctionParameters().addUint16(65535)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint32(0)).to.be.equal(65535);
    });

    it("should return the right min int16 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt16",
                new ContractFunctionParameters().addInt16(-32768)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt32(0)).to.be.equal(-32768);
    });

    it("should return the right max int16 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt16",
                new ContractFunctionParameters().addInt16(32767)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt32(0)).to.be.equal(32767);
    });

    it("should return the right uint16 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint24",
                new ContractFunctionParameters().addUint24(16777215)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint32(0)).to.be.equal(16777215);
    });

    it("should return the right min int24 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt24",
                new ContractFunctionParameters().addInt24(-8388608)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt32(0)).to.be.equal(-8388608);
    });

    it("should return the right max int24 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt24",
                new ContractFunctionParameters().addInt24(8388607)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt32(0)).to.be.equal(8388607);
    });

    it("should return the right uint32 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint32",
                new ContractFunctionParameters().addUint32(4294967295)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint32(0)).to.be.equal(4294967295);
    });

    it("should return the right min int32 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt32",
                new ContractFunctionParameters().addInt32(-2147483648)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt32(0)).to.be.equal(-2147483648);
    });

    it("should return the right max int32 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt32",
                new ContractFunctionParameters().addInt32(2147483647)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt32(0)).to.be.equal(2147483647);
    });

    it("should return the right uint40 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint40",
                new ContractFunctionParameters().addUint40(1099511627775)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint40(0).toNumber()).to.be.equal(1099511627775);
    });

    it("should return the right min int40 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt40",
                new ContractFunctionParameters().addInt40(-549755813888)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);
        console.log("HERE INT40 Responce", txResponse);
        expect(txResponse.getInt40(0)).to.be.equal(-549755813888);
    });

    it("should return the right max int40 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt40",
                new ContractFunctionParameters().addInt40(549755813887)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt40(0)).to.be.equal(549755813887);
    });

    it("should return the right uint48 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint48",
                new ContractFunctionParameters().addUint48(281474976710655)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint48(0).toNumber()).to.be.equal(281474976710655);
    });

    it("should return the right min int48 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt48",
                new ContractFunctionParameters().addInt48(-140737488355328)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt48(0)).to.be.equal(-140737488355328);
    });

    it("should return the right max int48 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt48",
                new ContractFunctionParameters().addInt48(140737488355327)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt48(0)).to.be.equal(140737488355327);
    });

    it("should return the right uint56 value", async function () {
        const maxUint56 = new BigNumber("0xFFFFFFFFFFFFFF", 16);

        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint56",
                new ContractFunctionParameters().addUint56(maxUint56)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint56(0).toNumber()).to.be.equal(maxUint56);
    });

    it("should return the right min int56 value", async function () {
        const minInt56 = new BigNumber("-80000000000000", 16);
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt56",
                new ContractFunctionParameters().addInt56(minInt56)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt56(0)).to.be.equal(minInt56);
    });

    it("should return the right max int56 value", async function () {
        const maxInt56 = new BigNumber("7FFFFFFFFFFFFF", 16);

        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt56",
                new ContractFunctionParameters().addInt56(maxInt56)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt56(0)).to.be.equal(maxInt56);
    });

    it("should return the right uint64 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint64",
                new ContractFunctionParameters().addUint64(18446744073709551615)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint64(0)).to.be.equal(18446744073709551615);
    });

    it("should return the right min int64 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt64",
                new ContractFunctionParameters().addInt64(-9223372036854775808)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt64(0)).to.be.equal(-9223372036854775808);
    });

    it("should return the right max int64 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt64",
                new ContractFunctionParameters().addInt64(9223372036854775807)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt64(0)).to.be.equal(9223372036854775807);
    });

    after(async function () {
        await env.close();
    });
});
