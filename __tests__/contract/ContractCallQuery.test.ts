import { ContractCallQuery } from "../../src/exports";
import { mockClient, mockTransaction } from "../MockClient";

describe("ContractCallQuery", () => {
    it("serializes and deserializes correctly; ContractCallQuery", () => {
        const query = new ContractCallQuery()
            .setContractId({ shard: 0, realm: 0, contract: 3 })
            .setQueryPaymentTransaction(mockTransaction);

        const tx = query._toProto().toObject();
        expect(tx).toStrictEqual({
            consensusgettopicinfo: undefined,
            contractcalllocal: {
                contractid: {
                    contractnum: 3,
                    realmnum: 0,
                    shardnum: 0
                },
                functionparameters: "",
                gas: 0,
                header: {
                    payment: {
                        body: undefined,
                        bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeHIUChIKBwoCGAIQxwEKBwoCGAMQyAE=",
                        sigmap: {
                            sigpairList: [
                                {
                                    contract: "",
                                    ecdsa384: "",
                                    ed25519: "1W86WCxMfK1Pv83GbBxXIDzpTLgwsLzOO/Nccs9QEV6ej/kp3QbJGtgO64gTXrdje6lyTdbuaLFYxxHXtje2CgoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHhyFAoSCgcKAhgCEMcBCgcKAhgDEMgB",
                                    pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                                    rsa3072: ""
                                }
                            ]
                        },
                        sigs: undefined
                    },
                    responsetype: 0
                },
                maxresultsize: 0
            },
            contractgetbytecode: undefined,
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
