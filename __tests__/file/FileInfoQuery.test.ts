import {mockClient, mockTransaction} from "../MockClient";
import {FileInfoQuery} from "../../exports";

describe("FileInfoQuery", () => {
    it('serializes and deserializes correctly; FileInfoQuery', () => {
        const query = new FileInfoQuery(mockClient)
            .setFileId({ shard: 0, realm: 0, file: 5 })
            .setPayment(mockTransaction.toProto());

        const tx = query.toProto().toObject();
        expect(tx).toStrictEqual({
            contractcalllocal: undefined,
            contractgetbytecode: undefined,
            contractgetinfo: undefined,
            contractgetrecords: undefined,
            cryptogetaccountbalance: undefined,
            cryptogetaccountrecords: undefined,
            cryptogetclaim: undefined,
            cryptogetinfo: undefined,
            cryptogetproxystakers: undefined,
            filegetcontents: undefined,
            filegetinfo: {
                fileid: {
                    filenum: 5,
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
            getbykey: undefined,
            getbysolidityid: undefined,
            transactiongetfastrecord: undefined,
            transactiongetreceipt: undefined,
            transactiongetrecord: undefined
        }
    );
    });
});