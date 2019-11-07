import { AccountCreateTransaction, Hbar } from "../../src/exports";
import { mockClient, privateKey } from "../MockClient";
import { TransactionBody } from "../../src/generated/TransactionBody_pb";


describe('AccountCreateTransaction', () => {
    it('serializes correctly', () => {
        const transaction = new AccountCreateTransaction(mockClient)
            // deterministic values
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .setKey(privateKey.publicKey)
            .setTransactionFee(Hbar.of(1))
            .build();

        const bodybytes = "Cg4KCAjcyQcQ258JEgIYAxICGAMYgMLXLyICCHhaPwoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktzD//////////384//////////9/SgUI0MjhAw==";

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes,
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "Vueml5zTmYI2f9O2kcw6/zKFaIPn5WCOKD/jvhwO+EFN55yepuYa566qbD8Z274nncCi/aqVrr/M6NIu91OnAQoOCggI3MkHENufCRICGAMSAhgDGIDC1y8iAgh4Wj8KIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLcw//////////9/OP//////////f0oFCNDI4QM=",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });

        const txnBody = TransactionBody.deserializeBinary(Buffer.from(bodybytes, "base64")).toObject();

        // `toObject()` sets not-present properties explicitly to undefined
        expect(txnBody).toStrictEqual({
            "contractcall": undefined,
            "contractcreateinstance": undefined,
            "contractdeleteinstance": undefined,
            "contractupdateinstance": undefined,
            "cryptoaddclaim": undefined,
            "cryptocreateaccount": {
                "autorenewperiod": {
                    "seconds": 7890000
                },
                "initialbalance": "0",
                "key": {
                    "contractid": undefined,
                    "ecdsa384": "",
                    "ed25519": "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                    "keylist": undefined,
                    "rsa3072": "",
                    "thresholdkey": undefined,
                },
                "newrealmadminkey": undefined,
                "proxyaccountid": undefined,
                "realmid": undefined,
                "receiverecordthreshold": "9223372036854775807",
                "receiversigrequired": false,
                "sendrecordthreshold": "9223372036854775807",
                "shardid": undefined,
            },
            "cryptodelete": undefined,
            "cryptodeleteclaim": undefined,
            "cryptotransfer": undefined,
            "cryptoupdateaccount": undefined,
            "fileappend": undefined,
            "filecreate": undefined,
            "filedelete": undefined,
            "fileupdate": undefined,
            "freeze": undefined,
            "generaterecord": false,
            "memo": "",
            "nodeaccountid": {
                "accountnum": 3,
                "realmnum": 0,
                "shardnum": 0
            },
            "systemdelete": undefined,
            "systemundelete": undefined,
            "transactionfee": "100000000",
            "transactionid": {
                "accountid": {
                    "accountnum": 3,
                    "realmnum": 0,
                    "shardnum": 0
                },
                "transactionvalidstart": {
                    "nanos": 151515,
                    "seconds": 124124
                }
            },
            "transactionvalidduration": {
                "seconds": 120
            }
        });
    });
});
