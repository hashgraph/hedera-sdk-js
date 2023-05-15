import {
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractCallQuery,
    Hbar,
    ContractFunctionParameters,
    FileAppendTransaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

let smartContractBytecode =
    "0x608060405234801561001057600080fd5b506117ce806100206000396000f3fe608060405234801561001057600080fd5b50600436106103f15760003560e01c8063881c8fb711610215578063c503772d11610125578063de9fb484116100b8578063e713cda811610087578063e713cda814610c7f578063f4e490f514610ca2578063f6e877f414610cc3578063f8293f6e14610ce9578063ffb8050114610d0b57600080fd5b8063de9fb48414610bdf578063e05e91e014610c0c578063e066de5014610c33578063e0f53e2414610c5957600080fd5b8063cdb9e4e8116100f4578063cdb9e4e814610b48578063d79d4d4014610b6e578063dade0c0b14610b94578063dbb04ed914610bb657600080fd5b8063c503772d14610ab3578063c6c18a1c14610ad3578063c7d8b87e14610afd578063cbd2e6a514610b2357600080fd5b8063a401d60d116101a8578063b834bfe911610177578063b834bfe9146109ff578063b8da8d1614610a20578063b989c7ee14610a46578063ba945bdb14610a67578063bb6b524314610a8d57600080fd5b8063a401d60d14610971578063a75761f114610997578063b2db404a146109b8578063b4e3e7b1146109d957600080fd5b806398508ba3116101e457806398508ba3146108e85780639b1794ae14610909578063a08b9f671461092f578063a1bda1221461095057600080fd5b8063881c8fb71461085f57806388b7e6f514610885578063923f5edf146108a657806394cd7c80146108c757600080fd5b806333520ec311610310578063628bc3ef116102a357806370a5cb811161027257806370a5cb81146107aa57806372a06b4d146107d6578063796a27ea146107f75780637d0dc2621461081d5780637ec32d841461083e57600080fd5b8063628bc3ef1461072657806364e008c11461074757806368ef4466146107685780636a54715c1461078957600080fd5b8063407b899b116102df578063407b899b146106b257806344e7b037146106d3578063545e2113146106f957806359adb2df146105a857600080fd5b806333520ec3146106275780633b45e6e0146106485780633e1a2771146106695780633f396e671461068a57600080fd5b806311ec6c901161038857806322937ea91161035757806322937ea9146105a85780632ef16e8e146105c45780632f47a40d146105e55780632f6c1bb41461060657600080fd5b806311ec6c901461051f578063129ed5da1461054057806312cd95a114610566578063189cea8e1461058757600080fd5b806308123e09116103c457806308123e09146104965780630a958dc8146104bc57806310d54553146104dd578063118b8415146104fe57600080fd5b8063017fa10b146103f6578063021d88ab14610424578063037454301461044f57806306ac6fe114610470575b600080fd5b61040761040436600461122c565b90565b6040516001600160801b0390911681526020015b60405180910390f35b61043261040436600461163e565b6040516bffffffffffffffffffffffff909116815260200161041b565b61045d610404366004610d94565b604051600c9190910b815260200161041b565b61047e610404366004611205565b6040516001600160781b03909116815260200161041b565b6104a4610404366004611550565b60405166ffffffffffffff909116815260200161041b565b6104ca610404366004611089565b60405160049190910b815260200161041b565b6104eb610404366004610e40565b60405160119190910b815260200161041b565b61050c61040436600461102f565b604051601e9190910b815260200161041b565b61052d610404366004610ea3565b60405160139190910b815260200161041b565b61054e6104043660046112a1565b6040516001600160981b03909116815260200161041b565b610574610404366004610e61565b60405160129190910b815260200161041b565b610595610404366004610f06565b60405160169190910b815260200161041b565b6105b6610404366004611050565b60405190815260200161041b565b6105d261040436600461100e565b604051601d9190910b815260200161041b565b6105f361040436600461116f565b604051600a9190910b815260200161041b565b610614610404366004610f69565b60405160199190910b815260200161041b565b610635610404366004610f8a565b604051601a9190910b815260200161041b565b610656610404366004610e1f565b60405160109190910b815260200161041b565b610677610404366004610fcc565b604051601c9190910b815260200161041b565b61069861040436600461159f565b60405168ffffffffffffffffff909116815260200161041b565b6106c06104043660046110ec565b60405160079190910b815260200161041b565b6106e16104043660046112ea565b6040516001600160a01b03909116815260200161041b565b61070c61070736600461112e565b610d2f565b60408051600093840b81529190920b60208201520161041b565b61073461040436600461114e565b60405160099190910b815260200161041b565b610755610404366004610f27565b60405160179190910b815260200161041b565b610776610404366004610ec4565b60405160149190910b815260200161041b565b6107976104043660046110cb565b60405160069190910b815260200161041b565b6107b86104043660046111b1565b6040516cffffffffffffffffffffffffff909116815260200161041b565b6107e461040436600461112e565b60405160009190910b815260200161041b565b6108056104043660046113fb565b6040516001600160d81b03909116815260200161041b565b61082b610404366004610fab565b604051601b9190910b815260200161041b565b61084c610404366004610fed565b60405160029190910b815260200161041b565b61086d610404366004611338565b6040516001600160b01b03909116815260200161041b565b610893610404366004610dfe565b604051600f9190910b815260200161041b565b6108b4610404366004610ee5565b60405160159190910b815260200161041b565b6108d5610404366004610f48565b60405160189190910b815260200161041b565b6108f6610404366004610dbc565b604051600d9190910b815260200161041b565b61091761040436600461135f565b6040516001600160b81b03909116815260200161041b565b61093d610404366004611190565b604051600b9190910b815260200161041b565b61095e610404366004610e82565b60405160019190910b815260200161041b565b61097f610404366004611493565b6040516001600160f01b03909116815260200161041b565b6109a56104043660046112c8565b60405161ffff909116815260200161041b565b6109c66104043660046110aa565b60405160059190910b815260200161041b565b6109e76104043660046111de565b6040516001600160701b03909116815260200161041b565b610a0d610404366004610ddd565b604051600e9190910b815260200161041b565b610a2e610404366004611311565b6040516001600160a81b03909116815260200161041b565b610a54610404366004611068565b60405160039190910b815260200161041b565b610a75610404366004611253565b6040516001600160881b03909116815260200161041b565b610a9b6104043660046113ad565b6040516001600160c81b03909116815260200161041b565b610ac16104043660046115c8565b60405160ff909116815260200161041b565b610ae1610404366004611613565b6040516affffffffffffffffffffff909116815260200161041b565b610b0b6104043660046114ba565b6040516001600160f81b03909116815260200161041b565b610b3161040436600461152a565b60405165ffffffffffff909116815260200161041b565b610b56610404366004611422565b6040516001600160e01b03909116815260200161041b565b610b7c6104043660046113d4565b6040516001600160d01b03909116815260200161041b565b610ba7610ba23660046114e1565b610d47565b60405161041b9392919061166a565b610bc46104043660046115e9565b60405169ffffffffffffffffffff909116815260200161041b565b610bf2610bed366004611089565b610d85565b60408051600493840b81529190920b60208201520161041b565b610c1a610404366004611577565b60405167ffffffffffffffff909116815260200161041b565b610c41610404366004611449565b6040516001600160e81b03909116815260200161041b565b610c67610404366004611386565b6040516001600160c01b03909116815260200161041b565b610c8d6104043660046114e1565b60405163ffffffff909116815260200161041b565b610cb061040436600461110d565b60405160089190910b815260200161041b565b610cd161040436600461127a565b6040516001600160901b03909116815260200161041b565b610cf7610404366004611470565b60405162ffffff909116815260200161041b565b610d19610404366004611505565b60405164ffffffffff909116815260200161041b565b60008082610d3e816014611726565b91509150915091565b600080606083610d5860018261175d565b6040805180820190915260028152614f4b60f01b602082015291945063ffffffff16925090509193909250565b60008082610d3e8160016116dc565b600060208284031215610da5578081fd5b813580600c0b8114610db5578182fd5b9392505050565b600060208284031215610dcd578081fd5b813580600d0b8114610db5578182fd5b600060208284031215610dee578081fd5b813580600e0b8114610db5578182fd5b600060208284031215610e0f578081fd5b813580600f0b8114610db5578182fd5b600060208284031215610e30578081fd5b81358060100b8114610db5578182fd5b600060208284031215610e51578081fd5b81358060110b8114610db5578182fd5b600060208284031215610e72578081fd5b81358060120b8114610db5578182fd5b600060208284031215610e93578081fd5b81358060010b8114610db5578182fd5b600060208284031215610eb4578081fd5b81358060130b8114610db5578182fd5b600060208284031215610ed5578081fd5b81358060140b8114610db5578182fd5b600060208284031215610ef6578081fd5b81358060150b8114610db5578182fd5b600060208284031215610f17578081fd5b81358060160b8114610db5578182fd5b600060208284031215610f38578081fd5b81358060170b8114610db5578182fd5b600060208284031215610f59578081fd5b81358060180b8114610db5578182fd5b600060208284031215610f7a578081fd5b81358060190b8114610db5578182fd5b600060208284031215610f9b578081fd5b813580601a0b8114610db5578182fd5b600060208284031215610fbc578081fd5b813580601b0b8114610db5578182fd5b600060208284031215610fdd578081fd5b813580601c0b8114610db5578182fd5b600060208284031215610ffe578081fd5b81358060020b8114610db5578182fd5b60006020828403121561101f578081fd5b813580601d0b8114610db5578182fd5b600060208284031215611040578081fd5b813580601e0b8114610db5578182fd5b600060208284031215611061578081fd5b5035919050565b600060208284031215611079578081fd5b81358060030b8114610db5578182fd5b60006020828403121561109a578081fd5b81358060040b8114610db5578182fd5b6000602082840312156110bb578081fd5b81358060050b8114610db5578182fd5b6000602082840312156110dc578081fd5b81358060060b8114610db5578182fd5b6000602082840312156110fd578081fd5b81358060070b8114610db5578182fd5b60006020828403121561111e578081fd5b81358060080b8114610db5578182fd5b60006020828403121561113f578081fd5b813580820b8114610db5578182fd5b60006020828403121561115f578081fd5b81358060090b8114610db5578182fd5b600060208284031215611180578081fd5b813580600a0b8114610db5578182fd5b6000602082840312156111a1578081fd5b813580600b0b8114610db5578182fd5b6000602082840312156111c2578081fd5b81356cffffffffffffffffffffffffff81168114610db5578182fd5b6000602082840312156111ef578081fd5b81356001600160701b0381168114610db5578182fd5b600060208284031215611216578081fd5b81356001600160781b0381168114610db5578182fd5b60006020828403121561123d578081fd5b81356001600160801b0381168114610db5578182fd5b600060208284031215611264578081fd5b81356001600160881b0381168114610db5578182fd5b60006020828403121561128b578081fd5b81356001600160901b0381168114610db5578182fd5b6000602082840312156112b2578081fd5b81356001600160981b0381168114610db5578182fd5b6000602082840312156112d9578081fd5b813561ffff81168114610db5578182fd5b6000602082840312156112fb578081fd5b81356001600160a01b0381168114610db5578182fd5b600060208284031215611322578081fd5b81356001600160a81b0381168114610db5578182fd5b600060208284031215611349578081fd5b81356001600160b01b0381168114610db5578182fd5b600060208284031215611370578081fd5b81356001600160b81b0381168114610db5578182fd5b600060208284031215611397578081fd5b81356001600160c01b0381168114610db5578182fd5b6000602082840312156113be578081fd5b81356001600160c81b0381168114610db5578182fd5b6000602082840312156113e5578081fd5b81356001600160d01b0381168114610db5578182fd5b60006020828403121561140c578081fd5b81356001600160d81b0381168114610db5578182fd5b600060208284031215611433578081fd5b81356001600160e01b0381168114610db5578182fd5b60006020828403121561145a578081fd5b81356001600160e81b0381168114610db5578182fd5b600060208284031215611481578081fd5b813562ffffff81168114610db5578182fd5b6000602082840312156114a4578081fd5b81356001600160f01b0381168114610db5578182fd5b6000602082840312156114cb578081fd5b81356001600160f81b0381168114610db5578182fd5b6000602082840312156114f2578081fd5b813563ffffffff81168114610db5578182fd5b600060208284031215611516578081fd5b813564ffffffffff81168114610db5578182fd5b60006020828403121561153b578081fd5b813565ffffffffffff81168114610db5578182fd5b600060208284031215611561578081fd5b813566ffffffffffffff81168114610db5578182fd5b600060208284031215611588578081fd5b813567ffffffffffffffff81168114610db5578182fd5b6000602082840312156115b0578081fd5b813568ffffffffffffffffff81168114610db5578182fd5b6000602082840312156115d9578081fd5b813560ff81168114610db5578182fd5b6000602082840312156115fa578081fd5b813569ffffffffffffffffffff81168114610db5578182fd5b600060208284031215611624578081fd5b81356affffffffffffffffffffff81168114610db5578182fd5b60006020828403121561164f578081fd5b81356bffffffffffffffffffffffff81168114610db5578182fd5b63ffffffff841681526000602067ffffffffffffffff851681840152606060408401528351806060850152825b818110156116b357858101830151858201608001528201611697565b818111156116c45783608083870101525b50601f01601f19169290920160800195945050505050565b60008160040b8360040b82821282647fffffffff0382138115161561170357611703611782565b82647fffffffff1903821281161561171d5761171d611782565b50019392505050565b600081810b83820b82821282607f0382138115161561174757611747611782565b82607f1903821281161561171d5761171d611782565b600063ffffffff8381169083168181101561177a5761177a611782565b039392505050565b634e487b7160e01b600052601160045260246000fdfea26469706673582212209dedf2534a95d9df525565d4d8e149a9b71ed310e4dde6a747ba297aa1eb2b9b64736f6c63430008040033";

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

    after(async function () {
        await env.close();
    });
});
