import { mockTransaction } from "./MockClient";
import { NetworkVersionInfoQuery } from "../../src/exports";

describe("NetworkVersionInfoQuery", () => {
    it("serializes and deserializes correctly; NetworkVersionInfoQuery", () => {
        const query = new NetworkVersionInfoQuery()
            .setQueryPaymentTransaction(mockTransaction);

        const tx = query._toProto().toObject();
        expect(tx).toStrictEqual({
            consensusgettopicinfo: undefined,
            contractcalllocal: undefined,
            contractgetbytecode: undefined,
            contractgetinfo: undefined,
            contractgetrecords: undefined,
            cryptogetaccountbalance: undefined,
            cryptogetaccountrecords: undefined,
            cryptogetinfo: undefined,
            cryptogetlivehash: undefined,
            cryptogetproxystakers: undefined,
            filegetcontents: undefined,
            filegetinfo: undefined,
            networkgetversioninfo: {
                header: {
                    payment: {
                        body: undefined,
                        bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeHIUChIKBwoCGAIQxwEKBwoCGAMQyAE=",
                        sigmap: {
                            sigpairList: [
                                {
                                    contract: "",
                                    ecdsa384: "",
                                    ed25519: "1W86WCxMfK1Pv83GbBxXIDzpTLgwsLzOO/Nccs9QEV6ej/kp3QbJGtgO64gTXrdje6lyTdbuaLFYxxHXtje2Cg==",
                                    pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                                    rsa3072: ""
                                }
                            ]
                        },
                        sigs: undefined
                    },
                    responsetype: 0
                }
            },
            getbykey: undefined,
            getbysolidityid: undefined,
            transactiongetfastrecord: undefined,
            transactiongetreceipt: undefined,
            transactiongetrecord: undefined
        });
    });
});
