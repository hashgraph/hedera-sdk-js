import {ContractInfoQuery} from "../../exports";
import {mockClient, mockTransaction} from "../MockClient";

describe("ContractInfoQuery", () => {
    it('serializes and deserializes correctly; ContractInfoQuery', () => {
        const transaction = new ContractInfoQuery(mockClient)
            .setContractId({ shard: 0, realm: 0, contract: 3 })
            .setPayment(mockTransaction.toProto());

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            contractcalllocal: undefined,
            contractgetbytecode: undefined,
            contractgetinfo: {
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