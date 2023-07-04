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
    "0x608060405234801561001057600080fd5b50611851806100206000396000f3fe608060405234801561001057600080fd5b50600436106103fc5760003560e01c806388b7e6f511610215578063c503772d11610125578063de9fb484116100b8578063e713cda811610087578063e713cda814610cb2578063f4e490f514610cd5578063f6e877f414610cf6578063f8293f6e14610d1c578063ffb8050114610d3e57600080fd5b8063de9fb48414610c12578063e05e91e014610c3f578063e066de5014610c66578063e0f53e2414610c8c57600080fd5b8063cdb9e4e8116100f4578063cdb9e4e814610b7b578063d79d4d4014610ba1578063dade0c0b14610bc7578063dbb04ed914610be957600080fd5b8063c503772d14610ae6578063c6c18a1c14610b06578063c7d8b87e14610b30578063cbd2e6a514610b5657600080fd5b8063a75761f1116101a8578063b8da8d1611610177578063b8da8d1614610a2b578063b989c7ee14610a51578063ba945bdb14610a72578063bb6b524314610a98578063bd90536a14610abe57600080fd5b8063a75761f1146109a2578063b2db404a146109c3578063b4e3e7b1146109e4578063b834bfe914610a0a57600080fd5b80639b1794ae116101e45780639b1794ae14610914578063a08b9f671461093a578063a1bda1221461095b578063a401d60d1461097c57600080fd5b806388b7e6f514610890578063923f5edf146108b157806394cd7c80146108d257806398508ba3146108f357600080fd5b80633b45e6e01161031057806364e008c1116102a357806372a06b4d1161027257806372a06b4d146107e1578063796a27ea146108025780637d0dc262146108285780637ec32d8414610849578063881c8fb71461086a57600080fd5b806364e008c11461075257806368ef4466146107735780636a54715c1461079457806370a5cb81146107b557600080fd5b806344e7b037116102df57806344e7b037146106de578063545e21131461070457806359adb2df146105b3578063628bc3ef1461073157600080fd5b80633b45e6e0146106535780633e1a2771146106745780633f396e6714610695578063407b899b146106bd57600080fd5b806311ec6c901161039357806322937ea91161036257806322937ea9146105b35780632ef16e8e146105cf5780632f47a40d146105f05780632f6c1bb41461061157806333520ec31461063257600080fd5b806311ec6c901461052a578063129ed5da1461054b57806312cd95a114610571578063189cea8e1461059257600080fd5b806308123e09116103cf57806308123e09146104a15780630a958dc8146104c757806310d54553146104e8578063118b84151461050957600080fd5b8063017fa10b14610401578063021d88ab1461042f578063037454301461045a57806306ac6fe11461047b575b600080fd5b61041261040f36600461126e565b90565b6040516001600160801b0390911681526020015b60405180910390f35b61043d61040f366004611680565b6040516bffffffffffffffffffffffff9091168152602001610426565b61046861040f366004610dd6565b604051600c9190910b8152602001610426565b61048961040f366004611247565b6040516001600160781b039091168152602001610426565b6104af61040f366004611592565b60405166ffffffffffffff9091168152602001610426565b6104d561040f3660046110cb565b60405160049190910b8152602001610426565b6104f661040f366004610e82565b60405160119190910b8152602001610426565b61051761040f366004611071565b604051601e9190910b8152602001610426565b61053861040f366004610ee5565b60405160139190910b8152602001610426565b61055961040f3660046112e3565b6040516001600160981b039091168152602001610426565b61057f61040f366004610ea3565b60405160129190910b8152602001610426565b6105a061040f366004610f48565b60405160169190910b8152602001610426565b6105c161040f366004611092565b604051908152602001610426565b6105dd61040f366004611050565b604051601d9190910b8152602001610426565b6105fe61040f3660046111b1565b604051600a9190910b8152602001610426565b61061f61040f366004610fab565b60405160199190910b8152602001610426565b61064061040f366004610fcc565b604051601a9190910b8152602001610426565b61066161040f366004610e61565b60405160109190910b8152602001610426565b61068261040f36600461100e565b604051601c9190910b8152602001610426565b6106a361040f3660046115e1565b60405168ffffffffffffffffff9091168152602001610426565b6106cb61040f36600461112e565b60405160079190910b8152602001610426565b6106ec61040f36600461132c565b6040516001600160a01b039091168152602001610426565b610717610712366004611170565b610d62565b60408051600093840b81529190920b602082015201610426565b61073f61040f366004611190565b60405160099190910b8152602001610426565b61076061040f366004610f69565b60405160179190910b8152602001610426565b61078161040f366004610f06565b60405160149190910b8152602001610426565b6107a261040f36600461110d565b60405160069190910b8152602001610426565b6107c361040f3660046111f3565b6040516cffffffffffffffffffffffffff9091168152602001610426565b6107ef61040f366004611170565b60405160009190910b8152602001610426565b61081061040f36600461143d565b6040516001600160d81b039091168152602001610426565b61083661040f366004610fed565b604051601b9190910b8152602001610426565b61085761040f36600461102f565b60405160029190910b8152602001610426565b61087861040f36600461137a565b6040516001600160b01b039091168152602001610426565b61089e61040f366004610e40565b604051600f9190910b8152602001610426565b6108bf61040f366004610f27565b60405160159190910b8152602001610426565b6108e061040f366004610f8a565b60405160189190910b8152602001610426565b61090161040f366004610dfe565b604051600d9190910b8152602001610426565b61092261040f3660046113a1565b6040516001600160b81b039091168152602001610426565b61094861040f3660046111d2565b604051600b9190910b8152602001610426565b61096961040f366004610ec4565b60405160019190910b8152602001610426565b61098a61040f3660046114d5565b6040516001600160f01b039091168152602001610426565b6109b061040f36600461130a565b60405161ffff9091168152602001610426565b6109d161040f3660046110ec565b60405160059190910b8152602001610426565b6109f261040f366004611220565b6040516001600160701b039091168152602001610426565b610a1861040f366004610e1f565b604051600e9190910b8152602001610426565b610a3961040f366004611353565b6040516001600160a81b039091168152602001610426565b610a5f61040f3660046110aa565b60405160039190910b8152602001610426565b610a8061040f366004611295565b6040516001600160881b039091168152602001610426565b610aa661040f3660046113ef565b6040516001600160c81b039091168152602001610426565b610ad1610acc366004611092565b610d7a565b60408051928352602083019190915201610426565b610af461040f36600461160a565b60405160ff9091168152602001610426565b610b1461040f366004611655565b6040516affffffffffffffffffffff9091168152602001610426565b610b3e61040f3660046114fc565b6040516001600160f81b039091168152602001610426565b610b6461040f36600461156c565b60405165ffffffffffff9091168152602001610426565b610b8961040f366004611464565b6040516001600160e01b039091168152602001610426565b610baf61040f366004611416565b6040516001600160d01b039091168152602001610426565b610bda610bd5366004611523565b610d89565b604051610426939291906116ac565b610bf761040f36600461162b565b60405169ffffffffffffffffffff9091168152602001610426565b610c25610c203660046110cb565b610dc7565b60408051600493840b81529190920b602082015201610426565b610c4d61040f3660046115b9565b60405167ffffffffffffffff9091168152602001610426565b610c7461040f36600461148b565b6040516001600160e81b039091168152602001610426565b610c9a61040f3660046113c8565b6040516001600160c01b039091168152602001610426565b610cc061040f366004611523565b60405163ffffffff9091168152602001610426565b610ce361040f36600461114f565b60405160089190910b8152602001610426565b610d0461040f3660046112bc565b6040516001600160901b039091168152602001610426565b610d2a61040f3660046114b2565b60405162ffffff9091168152602001610426565b610d4c61040f366004611547565b60405164ffffffffff9091168152602001610426565b60008082610d718160146117a9565b91509150915091565b60008082610d7181600161171e565b600080606083610d9a6001826117e0565b6040805180820190915260028152614f4b60f01b602082015291945063ffffffff16925090509193909250565b60008082610d7181600161175f565b600060208284031215610de7578081fd5b813580600c0b8114610df7578182fd5b9392505050565b600060208284031215610e0f578081fd5b813580600d0b8114610df7578182fd5b600060208284031215610e30578081fd5b813580600e0b8114610df7578182fd5b600060208284031215610e51578081fd5b813580600f0b8114610df7578182fd5b600060208284031215610e72578081fd5b81358060100b8114610df7578182fd5b600060208284031215610e93578081fd5b81358060110b8114610df7578182fd5b600060208284031215610eb4578081fd5b81358060120b8114610df7578182fd5b600060208284031215610ed5578081fd5b81358060010b8114610df7578182fd5b600060208284031215610ef6578081fd5b81358060130b8114610df7578182fd5b600060208284031215610f17578081fd5b81358060140b8114610df7578182fd5b600060208284031215610f38578081fd5b81358060150b8114610df7578182fd5b600060208284031215610f59578081fd5b81358060160b8114610df7578182fd5b600060208284031215610f7a578081fd5b81358060170b8114610df7578182fd5b600060208284031215610f9b578081fd5b81358060180b8114610df7578182fd5b600060208284031215610fbc578081fd5b81358060190b8114610df7578182fd5b600060208284031215610fdd578081fd5b813580601a0b8114610df7578182fd5b600060208284031215610ffe578081fd5b813580601b0b8114610df7578182fd5b60006020828403121561101f578081fd5b813580601c0b8114610df7578182fd5b600060208284031215611040578081fd5b81358060020b8114610df7578182fd5b600060208284031215611061578081fd5b813580601d0b8114610df7578182fd5b600060208284031215611082578081fd5b813580601e0b8114610df7578182fd5b6000602082840312156110a3578081fd5b5035919050565b6000602082840312156110bb578081fd5b81358060030b8114610df7578182fd5b6000602082840312156110dc578081fd5b81358060040b8114610df7578182fd5b6000602082840312156110fd578081fd5b81358060050b8114610df7578182fd5b60006020828403121561111e578081fd5b81358060060b8114610df7578182fd5b60006020828403121561113f578081fd5b81358060070b8114610df7578182fd5b600060208284031215611160578081fd5b81358060080b8114610df7578182fd5b600060208284031215611181578081fd5b813580820b8114610df7578182fd5b6000602082840312156111a1578081fd5b81358060090b8114610df7578182fd5b6000602082840312156111c2578081fd5b813580600a0b8114610df7578182fd5b6000602082840312156111e3578081fd5b813580600b0b8114610df7578182fd5b600060208284031215611204578081fd5b81356cffffffffffffffffffffffffff81168114610df7578182fd5b600060208284031215611231578081fd5b81356001600160701b0381168114610df7578182fd5b600060208284031215611258578081fd5b81356001600160781b0381168114610df7578182fd5b60006020828403121561127f578081fd5b81356001600160801b0381168114610df7578182fd5b6000602082840312156112a6578081fd5b81356001600160881b0381168114610df7578182fd5b6000602082840312156112cd578081fd5b81356001600160901b0381168114610df7578182fd5b6000602082840312156112f4578081fd5b81356001600160981b0381168114610df7578182fd5b60006020828403121561131b578081fd5b813561ffff81168114610df7578182fd5b60006020828403121561133d578081fd5b81356001600160a01b0381168114610df7578182fd5b600060208284031215611364578081fd5b81356001600160a81b0381168114610df7578182fd5b60006020828403121561138b578081fd5b81356001600160b01b0381168114610df7578182fd5b6000602082840312156113b2578081fd5b81356001600160b81b0381168114610df7578182fd5b6000602082840312156113d9578081fd5b81356001600160c01b0381168114610df7578182fd5b600060208284031215611400578081fd5b81356001600160c81b0381168114610df7578182fd5b600060208284031215611427578081fd5b81356001600160d01b0381168114610df7578182fd5b60006020828403121561144e578081fd5b81356001600160d81b0381168114610df7578182fd5b600060208284031215611475578081fd5b81356001600160e01b0381168114610df7578182fd5b60006020828403121561149c578081fd5b81356001600160e81b0381168114610df7578182fd5b6000602082840312156114c3578081fd5b813562ffffff81168114610df7578182fd5b6000602082840312156114e6578081fd5b81356001600160f01b0381168114610df7578182fd5b60006020828403121561150d578081fd5b81356001600160f81b0381168114610df7578182fd5b600060208284031215611534578081fd5b813563ffffffff81168114610df7578182fd5b600060208284031215611558578081fd5b813564ffffffffff81168114610df7578182fd5b60006020828403121561157d578081fd5b813565ffffffffffff81168114610df7578182fd5b6000602082840312156115a3578081fd5b813566ffffffffffffff81168114610df7578182fd5b6000602082840312156115ca578081fd5b813567ffffffffffffffff81168114610df7578182fd5b6000602082840312156115f2578081fd5b813568ffffffffffffffffff81168114610df7578182fd5b60006020828403121561161b578081fd5b813560ff81168114610df7578182fd5b60006020828403121561163c578081fd5b813569ffffffffffffffffffff81168114610df7578182fd5b600060208284031215611666578081fd5b81356affffffffffffffffffffff81168114610df7578182fd5b600060208284031215611691578081fd5b81356bffffffffffffffffffffffff81168114610df7578182fd5b63ffffffff841681526000602067ffffffffffffffff851681840152606060408401528351806060850152825b818110156116f5578581018301518582016080015282016116d9565b818111156117065783608083870101525b50601f01601f19169290920160800195945050505050565b600080821280156001600160ff1b038490038513161561174057611740611805565b600160ff1b839003841281161561175957611759611805565b50500190565b60008160040b8360040b82821282647fffffffff0382138115161561178657611786611805565b82647fffffffff190382128116156117a0576117a0611805565b50019392505050565b600081810b83820b82821282607f038213811516156117ca576117ca611805565b82607f190382128116156117a0576117a0611805565b600063ffffffff838116908316818110156117fd576117fd611805565b039392505050565b634e487b7160e01b600052601160045260246000fdfea26469706673582212205364c98c43bf562527dfb30742be8777928382a6eda15d701082fc80093ac7f364736f6c63430008040033";

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

    it("should return the right uint24 value", async function () {
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

    it("should work the right way with 0 uint32 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint32",
                new ContractFunctionParameters().addUint32(0)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint32(0)).to.be.equal(0);
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

    it("should return the right multiple values", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnMultipleTypeParams",
                new ContractFunctionParameters().addUint32(4294967295)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        const result = txResponse.getResult(["uint32", "uint64", "string"]);
        expect(result[0]).to.be.equal(4294967295); // first param returned by the contrast is in UINT32
        expect(result[1].toNumber()).to.be.equal(4294967294); // second param returned by the contract is in UINT64
        expect(result[2]).to.be.equal("OK"); // third param returned by the contract is in STRING
    });

    it("should return the right negative int40 value", async function () {
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

        expect(txResponse.getInt40(0).toNumber()).to.be.equal(-549755813888);
    });

    it("should return the right positive int40 value", async function () {
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

        expect(txResponse.getInt40(0).toNumber()).to.be.equal(549755813887);
    });

    it("should return the right multiple int40 values", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnMultipleInt40",
                new ContractFunctionParameters().addInt40(549755813885)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt40(0).toNumber()).to.be.equal(549755813885);
        expect(txResponse.getInt40(1).toNumber()).to.be.equal(549755813886);
    });

    it("should return the right int48 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt48",
                new ContractFunctionParameters().addInt48(-2147483648)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt48(0).toNumber()).to.be.equal(-2147483648);
    });

    it("should return the right int56 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt56",
                new ContractFunctionParameters().addInt56(-2147483648)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt56(0).toNumber()).to.be.equal(-2147483648);
    });

    it("should return the right int64 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt64",
                new ContractFunctionParameters().addInt64(-2147483648)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt64(0).toNumber()).to.be.equal(-2147483648);
    });

    it("should return the right negative int72 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt72",
                new ContractFunctionParameters().addInt72(
                    new BigNumber(-2).pow(71)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt72(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(71).toString(10)
        );
    });

    it("should return the right positive int72 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt72",
                new ContractFunctionParameters().addInt72(
                    new BigNumber(2).pow(71).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt72(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(71).minus(1).toString(10)
        );
    });

    it("should return the right negative int88 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt88",
                new ContractFunctionParameters().addInt88(
                    new BigNumber(-2).pow(87)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt88(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(87).toString(10)
        );
    });

    it("should return the right positive int88 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt88",
                new ContractFunctionParameters().addInt88(
                    new BigNumber(2).pow(87).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt88(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(87).minus(1).toString(10)
        );
    });

    it("should return the right negative uint96 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint96",
                new ContractFunctionParameters().addUint96(
                    new BigNumber(2).pow(96).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint96(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(96).minus(1).toString(10)
        );
    });

    it("should return the right negative int96 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt96",
                new ContractFunctionParameters().addInt96(
                    new BigNumber(-2).pow(95)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt96(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(95).toString(10)
        );
    });

    it("should return the right positive int96 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt96",
                new ContractFunctionParameters().addInt96(
                    new BigNumber(2).pow(95).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt96(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(95).minus(1).toString(10)
        );
    });

    it("should return the right negative int104 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt104",
                new ContractFunctionParameters().addInt104(
                    new BigNumber(-2).pow(103)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt104(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(103).toString(10)
        );
    });

    it("should return the right positive int104 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt104",
                new ContractFunctionParameters().addInt104(
                    new BigNumber(2).pow(103).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt104(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(103).minus(1).toString(10)
        );
    });

    it("should return the right uint104 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint104",
                new ContractFunctionParameters().addUint104(
                    new BigNumber(2).pow(104).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint104(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(104).minus(1).toString(10)
        );
    });

    it("should return the right negative int112 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt112",
                new ContractFunctionParameters().addInt112(
                    new BigNumber(-2).pow(111)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt112(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(111).toString(10)
        );
    });

    it("should return the right positive int112 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt112",
                new ContractFunctionParameters().addInt112(
                    new BigNumber(2).pow(111).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt112(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(111).minus(1).toString(10)
        );
    });

    it("should return the right positive uint112 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint112",
                new ContractFunctionParameters().addUint112(
                    new BigNumber(2).pow(112).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint112(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(112).minus(1).toString(10)
        );
    });

    it("should return the right negative int120 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt120",
                new ContractFunctionParameters().addInt120(
                    new BigNumber(-2).pow(119)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt120(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(119).toString(10)
        );
    });

    it("should return the right positive int120 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt120",
                new ContractFunctionParameters().addInt120(
                    new BigNumber(2).pow(119).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt120(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(119).minus(1).toString(10)
        );
    });

    it("should return the right positive uint120 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint120",
                new ContractFunctionParameters().addUint120(
                    new BigNumber(2).pow(120).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint120(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(120).minus(1).toString(10)
        );
    });

    it("should return the right negative int128 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt128",
                new ContractFunctionParameters().addInt128(
                    new BigNumber(-2).pow(127)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt128(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(127).toString(10)
        );
    });

    it("should return the right positive int128 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt128",
                new ContractFunctionParameters().addInt128(
                    new BigNumber(2).pow(127).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt128(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(127).minus(1).toString(10)
        );
    });

    it("should return the right positive uint128 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint128",
                new ContractFunctionParameters().addUint128(
                    new BigNumber(2).pow(128).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint128(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(128).minus(1).toString(10)
        );
    });

    it("should return the right negative int136 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt136",
                new ContractFunctionParameters().addInt136(
                    new BigNumber(-2).pow(127)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt136(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(127).toString(10)
        );
    });

    it("should return the right positive int136 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt136",
                new ContractFunctionParameters().addInt136(
                    new BigNumber(2).pow(127).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt136(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(127).minus(1).toString(10)
        );
    });

    it("should return the right positive uint136 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint136",
                new ContractFunctionParameters().addUint136(
                    new BigNumber(2).pow(128).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint136(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(128).minus(1).toString(10)
        );
    });

    it("should return the right negative int144 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt144",
                new ContractFunctionParameters().addInt144(
                    new BigNumber(-2).pow(143)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt144(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(143).toString(10)
        );
    });

    it("should return the right positive int144 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt144",
                new ContractFunctionParameters().addInt144(
                    new BigNumber(2).pow(143).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt144(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(143).minus(1).toString(10)
        );
    });

    it("should return the right positive uint144 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint144",
                new ContractFunctionParameters().addUint144(
                    new BigNumber(2).pow(144).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint144(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(144).minus(1).toString(10)
        );
    });

    it("should return the right negative int152 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt152",
                new ContractFunctionParameters().addInt152(
                    new BigNumber(-2).pow(151)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt152(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(151).toString(10)
        );
    });

    it("should return the right positive int152 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt152",
                new ContractFunctionParameters().addInt152(
                    new BigNumber(2).pow(151).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt152(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(151).minus(1).toString(10)
        );
    });

    it("should return the right positive uint152 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint152",
                new ContractFunctionParameters().addUint152(
                    new BigNumber(2).pow(152).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint152(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(152).minus(1).toString(10)
        );
    });

    it("should return the right negative int160 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt160",
                new ContractFunctionParameters().addInt160(
                    new BigNumber(-2).pow(159)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt160(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(159).toString(10)
        );
    });

    it("should return the right positive int160 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt160",
                new ContractFunctionParameters().addInt160(
                    new BigNumber(2).pow(159).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt160(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(159).minus(1).toString(10)
        );
    });

    it("should return the right positive uint160 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint160",
                new ContractFunctionParameters().addUint160(
                    new BigNumber(2).pow(160).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint160(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(160).minus(1).toString(10)
        );
    });

    it("should return the right negative int168 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt168",
                new ContractFunctionParameters().addInt168(
                    new BigNumber(-2).pow(167)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt168(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(167).toString(10)
        );
    });

    it("should return the right positive int168 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt168",
                new ContractFunctionParameters().addInt168(
                    new BigNumber(2).pow(167).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt168(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(167).minus(1).toString(10)
        );
    });

    it("should return the right positive uint168 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint168",
                new ContractFunctionParameters().addUint168(
                    new BigNumber(2).pow(168).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint168(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(168).minus(1).toString(10)
        );
    });

    it("should return the right negative int176 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt176",
                new ContractFunctionParameters().addInt176(
                    new BigNumber(-2).pow(175)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt176(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(175).toString(10)
        );
    });

    it("should return the right positive int176 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt176",
                new ContractFunctionParameters().addInt176(
                    new BigNumber(2).pow(175).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt176(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(175).minus(1).toString(10)
        );
    });

    it("should return the right positive uint176 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint176",
                new ContractFunctionParameters().addUint176(
                    new BigNumber(2).pow(176).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint176(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(176).minus(1).toString(10)
        );
    });

    it("should return the right negative int184 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt184",
                new ContractFunctionParameters().addInt184(
                    new BigNumber(-2).pow(183)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt184(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(183).toString(10)
        );
    });

    it("should return the right positive int184 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt184",
                new ContractFunctionParameters().addInt184(
                    new BigNumber(2).pow(183).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt184(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(183).minus(1).toString(10)
        );
    });

    it("should return the right positive uint184 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint184",
                new ContractFunctionParameters().addUint184(
                    new BigNumber(2).pow(184).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint184(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(184).minus(1).toString(10)
        );
    });

    it("should return the right negative int192 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt192",
                new ContractFunctionParameters().addInt192(
                    new BigNumber(-2).pow(191)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt192(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(191).toString(10)
        );
    });

    it("should return the right positive int192 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt192",
                new ContractFunctionParameters().addInt192(
                    new BigNumber(2).pow(191).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt192(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(191).minus(1).toString(10)
        );
    });

    it("should return the right positive uint192 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint192",
                new ContractFunctionParameters().addUint192(
                    new BigNumber(2).pow(192).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint192(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(192).minus(1).toString(10)
        );
    });

    it("should return the right negative int200 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt200",
                new ContractFunctionParameters().addInt200(
                    new BigNumber(-2).pow(199)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt200(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(199).toString(10)
        );
    });

    it("should return the right positive int200 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt200",
                new ContractFunctionParameters().addInt200(
                    new BigNumber(2).pow(199).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt200(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(199).minus(1).toString(10)
        );
    });

    it("should return the right positive uint200 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint200",
                new ContractFunctionParameters().addUint200(
                    new BigNumber(2).pow(200).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint200(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(200).minus(1).toString(10)
        );
    });

    it("should return the right negative int208 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt208",
                new ContractFunctionParameters().addInt208(
                    new BigNumber(-2).pow(207)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt208(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(207).toString(10)
        );
    });

    it("should return the right positive int208 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt208",
                new ContractFunctionParameters().addInt208(
                    new BigNumber(2).pow(207).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt208(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(207).minus(1).toString(10)
        );
    });

    it("should return the right positive uint208 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint208",
                new ContractFunctionParameters().addUint208(
                    new BigNumber(2).pow(208).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint208(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(208).minus(1).toString(10)
        );
    });

    it("should return the right negative int216 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt216",
                new ContractFunctionParameters().addInt216(
                    new BigNumber(-2).pow(215)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt216(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(215).toString(10)
        );
    });

    it("should return the right positive int216 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt216",
                new ContractFunctionParameters().addInt216(
                    new BigNumber(2).pow(215).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt216(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(215).minus(1).toString(10)
        );
    });

    it("should return the right positive uint216 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint216",
                new ContractFunctionParameters().addUint216(
                    new BigNumber(2).pow(216).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint216(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(216).minus(1).toString(10)
        );
    });

    it("should return the right negative int224 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt224",
                new ContractFunctionParameters().addInt224(
                    new BigNumber(-2).pow(223)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt224(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(223).toString(10)
        );
    });

    it("should return the right positive int224 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt224",
                new ContractFunctionParameters().addInt224(
                    new BigNumber(2).pow(223).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt224(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(223).minus(1).toString(10)
        );
    });

    it("should return the right positive uint224 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint224",
                new ContractFunctionParameters().addUint224(
                    new BigNumber(2).pow(224).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint224(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(224).minus(1).toString(10)
        );
    });

    it("should return the right negative int232 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt232",
                new ContractFunctionParameters().addInt232(
                    new BigNumber(-2).pow(231)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt232(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(231).toString(10)
        );
    });

    it("should return the right positive int232 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt232",
                new ContractFunctionParameters().addInt232(
                    new BigNumber(2).pow(231).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt232(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(231).minus(1).toString(10)
        );
    });

    it("should return the right positive uint232 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint232",
                new ContractFunctionParameters().addUint232(
                    new BigNumber(2).pow(232).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint232(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(232).minus(1).toString(10)
        );
    });

    it("should return the right negative int240 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt240",
                new ContractFunctionParameters().addInt240(
                    new BigNumber(-2).pow(239)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt240(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(239).toString(10)
        );
    });

    it("should return the right positive int240 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt240",
                new ContractFunctionParameters().addInt240(
                    new BigNumber(2).pow(239).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt240(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(239).minus(1).toString(10)
        );
    });

    it("should return the right positive uint240 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint240",
                new ContractFunctionParameters().addUint240(
                    new BigNumber(2).pow(240).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint240(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(240).minus(1).toString(10)
        );
    });

    it("should return the right negative int248 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt248",
                new ContractFunctionParameters().addInt248(
                    new BigNumber(-2).pow(247)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt248(0).toString(10)).to.be.equal(
            new BigNumber(-2).pow(247).toString(10)
        );
    });

    it("should return the right positive int248 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnInt248",
                new ContractFunctionParameters().addInt248(
                    new BigNumber(2).pow(247).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt248(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(247).minus(1).toString(10)
        );
    });

    it("should return the right positive uint248 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint248",
                new ContractFunctionParameters().addUint248(
                    new BigNumber(2).pow(248).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint248(0).toString(10)).to.be.equal(
            new BigNumber(2).pow(248).minus(1).toString(10)
        );
    });

    it("should return the right uint256 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint256",
                new ContractFunctionParameters().addUint256(
                    // eslint-disable-next-line no-loss-of-precision
                    new BigNumber(2).pow(256).minus(1)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint256(0).toString(10)).to.be.equal(
            // eslint-disable-next-line no-loss-of-precision
            new BigNumber(2).pow(256).minus(1).toString(10)
        );
    });

    it("should return the right zero uint256 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint256",
                new ContractFunctionParameters().addUint256(
                    // eslint-disable-next-line no-loss-of-precision
                    0
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint256(0).toNumber()).to.be.equal(
            // eslint-disable-next-line no-loss-of-precision
            0
        );
    });

    it("should return the right 20 decimal uint256 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint256",
                new ContractFunctionParameters().addUint256(
                    // eslint-disable-next-line no-loss-of-precision
                    5000000000000000000000
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint256(0).toNumber()).to.be.equal(
            // eslint-disable-next-line no-loss-of-precision
            5000000000000000000000
        );
    });

    it("should return the again right uint256 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnUint256",
                new ContractFunctionParameters().addUint256(
                    // eslint-disable-next-line no-loss-of-precision
                    50
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getUint256(0).toNumber()).to.be.equal(
            // eslint-disable-next-line no-loss-of-precision
            50
        );
    });

    it("should return the min int256 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnMultipleInt256",
                new ContractFunctionParameters().addInt256(
                    new BigNumber(-2).pow(255)
                )
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt256(0).toNumber()).to.be.equal(
            new BigNumber(-2).pow(255).toNumber()
        );
    });

    it("should return the max int256 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnMultipleInt256",
                new ContractFunctionParameters().addInt256(-10)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt256(0).toNumber()).to.be.equal(-10);
        expect(txResponse.getInt256(1).toNumber()).to.be.equal(-9);
    });

    it("should return the right int256 value", async function () {
        const contractQuery = await new ContractCallQuery()
            //Set the gas for the query
            .setGas(15000000)
            //Set the contract ID to return the request for
            .setContractId(newContractId)
            //Set the contract function to call
            .setFunction(
                "returnMultipleInt256",
                new ContractFunctionParameters().addInt256(-10)
            )
            //Set the query payment for the node returning the request
            //This value must cover the cost of the request otherwise will fail
            .setQueryPayment(new Hbar(10));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt256(0).toNumber()).to.be.equal(-10);
        expect(txResponse.getInt256(1).toNumber()).to.be.equal(-9);
    });

    after(async function () {
        await env.close();
    });
});
