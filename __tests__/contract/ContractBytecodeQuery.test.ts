import {ContractBytecodeQuery} from "../../exports";
import {mockClient, mockTransaction} from "../MockClient";

describe("ContractBytecodeQuery", () => {
    it('serializes and deserializes correctly; ContractBytecodeQuery', () => {
        const transaction = new ContractBytecodeQuery(mockClient)
            .setContractId({ shard: 0, realm: 0, contract: 3 })
            .setPayment(mockTransaction.toProto());

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            contractcalllocal: undefined,
            contractgetbytecode: {
                contractid: {
                    contractnum: 3,
                    realmnum: 0,
                    shardnum: 0,
                },
                header: {
                    payment:  {
                        body: undefined,
                        bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeHIUChIKBwoCGAIQxwEKBwoCGAMQyAE=",
                        sigmap: undefined,
                        sigs: undefined,
                    },
                    responsetype: 0,
                },
            },
            contractgetinfo: undefined,
            contractgetrecords: undefined,
            cryptogetaccountbalance: undefined,
            cryptogetaccountrecords: undefined,
            cryptogetclaim: undefined,
            cryptogetinfo: undefined,
            cryptogetproxystakers: undefined,
            filegetcontents: undefined,
            filegetinfo: undefined,
            getbykey: undefined,
            getbysolidityid: undefined,
            transactiongetfastrecord: undefined,
            transactiongetreceipt: undefined,
            transactiongetrecord: undefined
        });
    });
});