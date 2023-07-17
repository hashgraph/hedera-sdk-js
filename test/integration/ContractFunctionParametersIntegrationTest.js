import {
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractCallQuery,
    Hbar,
    ContractFunctionParameters,
    ContractDeleteTransaction,
    FileAppendTransaction,
    FileDeleteTransaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";
import BigNumber from "bignumber.js";

let smartContractBytecode =
    "0x60806040523480156200001157600080fd5b5060408051608081018252600491810182815263082d8caf60e31b60608301908152908252600160208301529091600091620000509183919062000064565b506020820151816001015590505062000147565b82805462000072906200010a565b90600052602060002090601f016020900481019282620000965760008555620000e1565b82601f10620000b157805160ff1916838001178555620000e1565b82800160010185558215620000e1579182015b82811115620000e1578251825591602001919060010190620000c4565b50620000ef929150620000f3565b5090565b5b80821115620000ef5760008155600101620000f4565b600181811c908216806200011f57607f821691505b602082108114156200014157634e487b7160e01b600052602260045260246000fd5b50919050565b6120d380620001576000396000f3fe608060405234801561001057600080fd5b506004361061048b5760003560e01c806381dbe13e11610262578063bb6b524311610151578063dbb04ed9116100ce578063e713cda811610092578063e713cda814610e01578063f4e490f514610e24578063f6e877f414610e45578063f8293f6e14610e6b578063fba1bc4c14610e8d578063ffb8050114610ea257600080fd5b8063dbb04ed914610d38578063de9fb48414610d61578063e05e91e014610d8e578063e066de5014610db5578063e0f53e2414610ddb57600080fd5b8063cbd2e6a511610115578063cbd2e6a514610ca5578063cdb9e4e814610cca578063d1b10ad714610678578063d79d4d4014610cf0578063dade0c0b14610d1657600080fd5b8063bb6b524314610be7578063bd90536a14610c0d578063c503772d14610c35578063c6c18a1c14610c55578063c7d8b87e14610c7f57600080fd5b8063a1bda122116101df578063b4e3e7b1116101a3578063b4e3e7b114610b33578063b834bfe914610b59578063b8da8d1614610b7a578063b989c7ee14610ba0578063ba945bdb14610bc157600080fd5b8063a1bda12214610aaa578063a401d60d14610acb578063a75761f114610af1578063aa80ca2e1461073e578063b2db404a14610b1257600080fd5b8063923f5edf11610226578063923f5edf14610a0057806394cd7c8014610a2157806398508ba314610a425780639b1794ae14610a63578063a08b9f6714610a8957600080fd5b806381dbe13e14610983578063827147ce146105da578063881c8fb71461099e57806388b7e6f5146109c4578063909c5b24146109e557600080fd5b806338fa66581161037e578063628bc3ef116102fb57806372a06b4d116102bf57806372a06b4d146108fa578063796a27ea1461091b5780637d0dc262146109415780637ec32d84146109625780637f8082f71461073e57600080fd5b8063628bc3ef1461084a57806364e008c11461086b57806368ef44661461088c5780636a54715c146108ad57806370a5cb81146108ce57600080fd5b806344e7b0371161034257806344e7b0371461069457806348d848d0146107e45780634bbc9a6714610802578063545e21131461081d57806359adb2df1461067857600080fd5b806338fa66581461073e5780633b45e6e0146107595780633e1a27711461077a5780633f396e671461079b578063407b899b146107c357600080fd5b8063129ed5da1161040c5780632421101f116103d05780632421101f146106945780632ef16e8e146106ba5780632f47a40d146106db5780632f6c1bb4146106fc57806333520ec31461071d57600080fd5b8063129ed5da146105f557806312cd95a11461061b578063189cea8e1461063c5780631d1145621461065d57806322937ea91461067857600080fd5b80630a958dc8116104535780630a958dc81461055657806310d5455314610577578063118b84151461059857806311ec6c90146105b9578063126bc815146105da57600080fd5b8063017fa10b14610490578063021d88ab146104be57806303745430146104e957806306ac6fe11461050a57806308123e0914610530575b600080fd5b6104a161049e36600461188f565b90565b6040516001600160801b0390911681526020015b60405180910390f35b6104cc61049e366004611c7a565b6040516bffffffffffffffffffffffff90911681526020016104b5565b6104f761049e366004611416565b604051600c9190910b81526020016104b5565b61051861049e366004611868565b6040516001600160781b0390911681526020016104b5565b61053e61049e366004611b8c565b60405166ffffffffffffff90911681526020016104b5565b61056461049e3660046116ec565b60405160049190910b81526020016104b5565b61058561049e3660046114bb565b60405160119190910b81526020016104b5565b6105a661049e3660046116aa565b604051601e9190910b81526020016104b5565b6105c761049e36600461151e565b60405160139190910b81526020016104b5565b6105e861049e3660046113db565b6040516104b59190611e65565b61060361049e366004611904565b6040516001600160981b0390911681526020016104b5565b61062961049e3660046114dc565b60405160129190910b81526020016104b5565b61064a61049e366004611581565b60405160169190910b81526020016104b5565b61066b61049e3660046110a0565b6040516104b59190611cf1565b61068661049e3660046113c3565b6040519081526020016104b5565b6106a261049e36600461107d565b6040516001600160a01b0390911681526020016104b5565b6106c861049e366004611689565b604051601d9190910b81526020016104b5565b6106e961049e3660046117d2565b604051600a9190910b81526020016104b5565b61070a61049e3660046115e4565b60405160199190910b81526020016104b5565b61072b61049e366004611605565b604051601a9190910b81526020016104b5565b61074c61049e3660046111cf565b6040516104b59190611d78565b61076761049e36600461149a565b60405160109190910b81526020016104b5565b61078861049e366004611647565b604051601c9190910b81526020016104b5565b6107a961049e366004611bdb565b60405168ffffffffffffffffff90911681526020016104b5565b6107d161049e36600461174f565b60405160079190910b81526020016104b5565b6107f261049e3660046113a9565b60405190151581526020016104b5565b61081061049e366004611141565b6040516104b59190611d3e565b61083061082b366004611791565b610ec6565b60408051600093840b81529190920b6020820152016104b5565b61085861049e3660046117b1565b60405160099190910b81526020016104b5565b61087961049e3660046115a2565b60405160179190910b81526020016104b5565b61089a61049e36600461153f565b60405160149190910b81526020016104b5565b6108bb61049e36600461172e565b60405160069190910b81526020016104b5565b6108dc61049e366004611814565b6040516cffffffffffffffffffffffffff90911681526020016104b5565b61090861049e366004611791565b60405160009190910b81526020016104b5565b61092961049e366004611a37565b6040516001600160d81b0390911681526020016104b5565b61094f61049e366004611626565b604051601b9190910b81526020016104b5565b61097061049e366004611668565b60405160029190910b81526020016104b5565b61099161049e366004611307565b6040516104b59190611e11565b6109ac61049e366004611974565b6040516001600160b01b0390911681526020016104b5565b6109d261049e366004611479565b604051600f9190910b81526020016104b5565b6109f361049e366004611256565b6040516104b59190611db0565b610a0e61049e366004611560565b60405160159190910b81526020016104b5565b610a2f61049e3660046115c3565b60405160189190910b81526020016104b5565b610a5061049e366004611437565b604051600d9190910b81526020016104b5565b610a7161049e36600461199b565b6040516001600160b81b0390911681526020016104b5565b610a9761049e3660046117f3565b604051600b9190910b81526020016104b5565b610ab861049e3660046114fd565b60405160019190910b81526020016104b5565b610ad961049e366004611acf565b6040516001600160f01b0390911681526020016104b5565b610aff61049e36600461192b565b60405161ffff90911681526020016104b5565b610b2061049e36600461170d565b60405160059190910b81526020016104b5565b610b4161049e366004611841565b6040516001600160701b0390911681526020016104b5565b610b6761049e366004611458565b604051600e9190910b81526020016104b5565b610b8861049e36600461194d565b6040516001600160a81b0390911681526020016104b5565b610bae61049e3660046116cb565b60405160039190910b81526020016104b5565b610bcf61049e3660046118b6565b6040516001600160881b0390911681526020016104b5565b610bf561049e3660046119e9565b6040516001600160c81b0390911681526020016104b5565b610c20610c1b3660046113c3565b610ede565b604080519283526020830191909152016104b5565b610c4361049e366004611c04565b60405160ff90911681526020016104b5565b610c6361049e366004611c4f565b6040516affffffffffffffffffffff90911681526020016104b5565b610c8d61049e366004611af6565b6040516001600160f81b0390911681526020016104b5565b610cb361049e366004611b66565b60405165ffffffffffff90911681526020016104b5565b610cd861049e366004611a5e565b6040516001600160e01b0390911681526020016104b5565b610cfe61049e366004611a10565b6040516001600160d01b0390911681526020016104b5565b610d29610d24366004611b1d565b610eed565b6040516104b593929190611eaa565b610d4661049e366004611c25565b60405169ffffffffffffffffffff90911681526020016104b5565b610d74610d6f3660046116ec565b610f2b565b60408051600493840b81529190920b6020820152016104b5565b610d9c61049e366004611bb3565b60405167ffffffffffffffff90911681526020016104b5565b610dc361049e366004611a85565b6040516001600160e81b0390911681526020016104b5565b610de961049e3660046119c2565b6040516001600160c01b0390911681526020016104b5565b610e0f61049e366004611b1d565b60405163ffffffff90911681526020016104b5565b610e3261049e366004611770565b60405160089190910b81526020016104b5565b610e5361049e3660046118dd565b6040516001600160901b0390911681526020016104b5565b610e7961049e366004611aac565b60405162ffffff90911681526020016104b5565b610e95610f3a565b6040516104b59190611e78565b610eb061049e366004611b41565b60405164ffffffffff90911681526020016104b5565b60008082610ed5816014611fc2565b91509150915091565b60008082610ed5816001611f37565b600080606083610efe600182611ff9565b6040805180820190915260028152614f4b60f01b602082015291945063ffffffff16925090509193909250565b60008082610ed5816001611f78565b6040805180820190915260608152600060208201526000604051806040016040529081600082018054610f6c9061201e565b80601f0160208091040260200160405190810160405280929190818152602001828054610f989061201e565b8015610fe55780601f10610fba57610100808354040283529160200191610fe5565b820191906000526020600020905b815481529060010190602001808311610fc857829003601f168201915b50505050508152602001600182015481525050905090565b8035801515811461100d57600080fd5b919050565b600082601f830112611022578081fd5b813567ffffffffffffffff81111561103c5761103c61206f565b61104f601f8201601f1916602001611ee2565b818152846020838601011115611063578283fd5b816020850160208301379081016020019190915292915050565b60006020828403121561108e578081fd5b813561109981612085565b9392505050565b600060208083850312156110b2578182fd5b823567ffffffffffffffff8111156110c8578283fd5b8301601f810185136110d8578283fd5b80356110eb6110e682611f13565b611ee2565b80828252848201915084840188868560051b870101111561110a578687fd5b8694505b8385101561113557803561112181612085565b83526001949094019391850191850161110e565b50979650505050505050565b60006020808385031215611153578182fd5b823567ffffffffffffffff811115611169578283fd5b8301601f81018513611179578283fd5b80356111876110e682611f13565b80828252848201915084840188868560051b87010111156111a6578687fd5b8694505b83851015611135576111bb81610ffd565b8352600194909401939185019185016111aa565b600060208083850312156111e1578182fd5b823567ffffffffffffffff8111156111f7578283fd5b8301601f81018513611207578283fd5b80356112156110e682611f13565b80828252848201915084840188868560051b8701011115611234578687fd5b8694505b83851015611135578035835260019490940193918501918501611238565b60006020808385031215611268578182fd5b823567ffffffffffffffff8082111561127f578384fd5b818501915085601f830112611292578384fd5b81356112a06110e682611f13565b80828252858201915085850189878560051b88010111156112bf578788fd5b875b848110156112f8578135868111156112d757898afd5b6112e58c8a838b0101611012565b85525092870192908701906001016112c1565b50909998505050505050505050565b60006020808385031215611319578182fd5b823567ffffffffffffffff80821115611330578384fd5b818501915085601f830112611343578384fd5b81356113516110e682611f13565b80828252858201915085850189878560051b8801011115611370578788fd5b875b848110156112f85781358681111561138857898afd5b6113968c8a838b0101611012565b8552509287019290870190600101611372565b6000602082840312156113ba578081fd5b61109982610ffd565b6000602082840312156113d4578081fd5b5035919050565b6000602082840312156113ec578081fd5b813567ffffffffffffffff811115611402578182fd5b61140e84828501611012565b949350505050565b600060208284031215611427578081fd5b813580600c0b8114611099578182fd5b600060208284031215611448578081fd5b813580600d0b8114611099578182fd5b600060208284031215611469578081fd5b813580600e0b8114611099578182fd5b60006020828403121561148a578081fd5b813580600f0b8114611099578182fd5b6000602082840312156114ab578081fd5b81358060100b8114611099578182fd5b6000602082840312156114cc578081fd5b81358060110b8114611099578182fd5b6000602082840312156114ed578081fd5b81358060120b8114611099578182fd5b60006020828403121561150e578081fd5b81358060010b8114611099578182fd5b60006020828403121561152f578081fd5b81358060130b8114611099578182fd5b600060208284031215611550578081fd5b81358060140b8114611099578182fd5b600060208284031215611571578081fd5b81358060150b8114611099578182fd5b600060208284031215611592578081fd5b81358060160b8114611099578182fd5b6000602082840312156115b3578081fd5b81358060170b8114611099578182fd5b6000602082840312156115d4578081fd5b81358060180b8114611099578182fd5b6000602082840312156115f5578081fd5b81358060190b8114611099578182fd5b600060208284031215611616578081fd5b813580601a0b8114611099578182fd5b600060208284031215611637578081fd5b813580601b0b8114611099578182fd5b600060208284031215611658578081fd5b813580601c0b8114611099578182fd5b600060208284031215611679578081fd5b81358060020b8114611099578182fd5b60006020828403121561169a578081fd5b813580601d0b8114611099578182fd5b6000602082840312156116bb578081fd5b813580601e0b8114611099578182fd5b6000602082840312156116dc578081fd5b81358060030b8114611099578182fd5b6000602082840312156116fd578081fd5b81358060040b8114611099578182fd5b60006020828403121561171e578081fd5b81358060050b8114611099578182fd5b60006020828403121561173f578081fd5b81358060060b8114611099578182fd5b600060208284031215611760578081fd5b81358060070b8114611099578182fd5b600060208284031215611781578081fd5b81358060080b8114611099578182fd5b6000602082840312156117a2578081fd5b813580820b8114611099578182fd5b6000602082840312156117c2578081fd5b81358060090b8114611099578182fd5b6000602082840312156117e3578081fd5b813580600a0b8114611099578182fd5b600060208284031215611804578081fd5b813580600b0b8114611099578182fd5b600060208284031215611825578081fd5b81356cffffffffffffffffffffffffff81168114611099578182fd5b600060208284031215611852578081fd5b81356001600160701b0381168114611099578182fd5b600060208284031215611879578081fd5b81356001600160781b0381168114611099578182fd5b6000602082840312156118a0578081fd5b81356001600160801b0381168114611099578182fd5b6000602082840312156118c7578081fd5b81356001600160881b0381168114611099578182fd5b6000602082840312156118ee578081fd5b81356001600160901b0381168114611099578182fd5b600060208284031215611915578081fd5b81356001600160981b0381168114611099578182fd5b60006020828403121561193c578081fd5b813561ffff81168114611099578182fd5b60006020828403121561195e578081fd5b81356001600160a81b0381168114611099578182fd5b600060208284031215611985578081fd5b81356001600160b01b0381168114611099578182fd5b6000602082840312156119ac578081fd5b81356001600160b81b0381168114611099578182fd5b6000602082840312156119d3578081fd5b81356001600160c01b0381168114611099578182fd5b6000602082840312156119fa578081fd5b81356001600160c81b0381168114611099578182fd5b600060208284031215611a21578081fd5b81356001600160d01b0381168114611099578182fd5b600060208284031215611a48578081fd5b81356001600160d81b0381168114611099578182fd5b600060208284031215611a6f578081fd5b81356001600160e01b0381168114611099578182fd5b600060208284031215611a96578081fd5b81356001600160e81b0381168114611099578182fd5b600060208284031215611abd578081fd5b813562ffffff81168114611099578182fd5b600060208284031215611ae0578081fd5b81356001600160f01b0381168114611099578182fd5b600060208284031215611b07578081fd5b81356001600160f81b0381168114611099578182fd5b600060208284031215611b2e578081fd5b813563ffffffff81168114611099578182fd5b600060208284031215611b52578081fd5b813564ffffffffff81168114611099578182fd5b600060208284031215611b77578081fd5b813565ffffffffffff81168114611099578182fd5b600060208284031215611b9d578081fd5b813566ffffffffffffff81168114611099578182fd5b600060208284031215611bc4578081fd5b813567ffffffffffffffff81168114611099578182fd5b600060208284031215611bec578081fd5b813568ffffffffffffffffff81168114611099578182fd5b600060208284031215611c15578081fd5b813560ff81168114611099578182fd5b600060208284031215611c36578081fd5b813569ffffffffffffffffffff81168114611099578182fd5b600060208284031215611c60578081fd5b81356affffffffffffffffffffff81168114611099578182fd5b600060208284031215611c8b578081fd5b81356bffffffffffffffffffffffff81168114611099578182fd5b60008151808452815b81811015611ccb57602081850181015186830182015201611caf565b81811115611cdc5782602083870101525b50601f01601f19169290920160200192915050565b6020808252825182820181905260009190848201906040850190845b81811015611d325783516001600160a01b031683529284019291840191600101611d0d565b50909695505050505050565b6020808252825182820181905260009190848201906040850190845b81811015611d32578351151583529284019291840191600101611d5a565b6020808252825182820181905260009190848201906040850190845b81811015611d3257835183529284019291840191600101611d94565b6000602080830181845280855180835260408601915060408160051b8701019250838701855b82811015611e0457603f19888603018452611df2858351611ca6565b94509285019290850190600101611dd6565b5092979650505050505050565b6000602080830181845280855180835260408601915060408160051b8701019250838701855b82811015611e0457603f19888603018452611e53858351611ca6565b94509285019290850190600101611e37565b6020815260006110996020830184611ca6565b602081526000825160406020840152611e946060840182611ca6565b9050602084015160408401528091505092915050565b63ffffffff8416815267ffffffffffffffff83166020820152606060408201526000611ed96060830184611ca6565b95945050505050565b604051601f8201601f1916810167ffffffffffffffff81118282101715611f0b57611f0b61206f565b604052919050565b600067ffffffffffffffff821115611f2d57611f2d61206f565b5060051b60200190565b600080821280156001600160ff1b0384900385131615611f5957611f59612059565b600160ff1b8390038412811615611f7257611f72612059565b50500190565b60008160040b8360040b82821282647fffffffff03821381151615611f9f57611f9f612059565b82647fffffffff19038212811615611fb957611fb9612059565b50019392505050565b600081810b83820b82821282607f03821381151615611fe357611fe3612059565b82607f19038212811615611fb957611fb9612059565b600063ffffffff8381169083168181101561201657612016612059565b039392505050565b600181811c9082168061203257607f821691505b6020821081141561205357634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b038116811461209a57600080fd5b5056fea2646970667358221220a24fb4a757386fd79c7c7cb608767f7d70003a814f506c413abe673f348130f464736f6c63430008040033";

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

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
            .setQueryPayment(new Hbar(15));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        expect(txResponse.getInt256(0).toNumber()).to.be.equal(-10);
        expect(txResponse.getInt256(1).toNumber()).to.be.equal(-9);
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
            .setQueryPayment(new Hbar(15));

        //Submit to a Hedera network
        const txResponse = await contractQuery.execute(env.client);

        const result = txResponse.getResult(["tuple(string, uint256)"]);
        expect(result[0][0]).to.be.equal("Alex"); // tuple is returned as array
        expect(result[0][1].toNumber()).to.be.equal(1); // tuple is returned as array
    });

    it("contract create of A nonce, which deploys contract B in CONSTRUCTOR", async function () {
        const SMART_CONTRACT_BYTECODE =
            "6080604052348015600f57600080fd5b50604051601a90603b565b604051809103906000f0801580156035573d6000803e3d6000fd5b50506047565b605c8061009483390190565b603f806100556000396000f3fe6080604052600080fdfea2646970667358221220a20122cbad3457fedcc0600363d6e895f17048f5caa4afdab9e655123737567d64736f6c634300081200336080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea264697066735822122053dfd8835e3dc6fedfb8b4806460b9b7163f8a7248bac510c6d6808d9da9d6d364736f6c63430008120033";

        const fileCreate = await new FileCreateTransaction()
            .setKeys([env.operatorKey])
            .setContents(SMART_CONTRACT_BYTECODE)
            .execute(env.client);

        const fileId = (await fileCreate.getReceipt(env.client)).fileId;

        const contractCreate = await new ContractCreateTransaction()
            .setAdminKey(env.operatorKey)
            .setGas(100000)
            .setBytecodeFileId(fileId)
            .setContractMemo("[e2e::ContractADeploysContractBInConstructor]")
            .execute(env.client);

        const contractCreateRecord = await contractCreate.getRecord(env.client);
        const nonces =
            contractCreateRecord.contractFunctionResult.contractNonces;
        console.log(`contractNonces: ${JSON.stringify(nonces)}`);

        const contractId = contractCreateRecord.receipt.contractId;
        const contractAnonce = nonces.find(
            (nonceInfo) =>
                nonceInfo.contractId.toString() === contractId.toString()
        );
        const contractBnonce = nonces.find(
            (nonceInfo) =>
                nonceInfo.contractId.toString() !== contractId.toString()
        );

        expect(contractAnonce.toNumber()).to.be.equal(2);
        expect(contractBnonce.toNumber()).to.be.equal(1);

        const contractDeleteTx = await new ContractDeleteTransaction()
            .setTransferAccountId(env.operatorId)
            .setContractId(contractId)
            .execute(env.client);

        const contractDeleteResult = await contractDeleteTx.getReceipt(
            env.client
        );
        console.log(
            `contractDelete status: ${contractDeleteResult.status.toString()}`
        );

        const fileDeleteTx = await new FileDeleteTransaction()
            .setFileId(fileId)
            .execute(env.client);

        const fileDeleteResult = await fileDeleteTx.getReceipt(env.client);
        console.log(`fileDelete status: ${fileDeleteResult.status.toString()}`);
    });

    after(async function () {
        await env.close();
    });
});
