import { AccountUpdateTransaction, Hbar } from "../../src/exports";
import { mockClient, privateKey } from "../MockClient";
import { TransactionBody } from "../../src/generated/TransactionBody_pb";


describe('AccountUpdateTransaction', () => {
    it('serializes correctly', () => {
        const transaction = new AccountUpdateTransaction(mockClient)
            // deterministic values
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .setAccountId({ account: 3 })
            .setKey(privateKey.publicKey)
            .setTransactionFee(Hbar.of(1))
            .build();

        const bodybytes = "Cg4KCAjcyQcQ258JEgIYAxICGAMYgMLXLyICCHh6KBICGAMaIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=";

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes,
            sigmap: undefined,
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
            "cryptocreateaccount": undefined,
            "cryptodelete": undefined,
            "cryptodeleteclaim": undefined,
            "cryptotransfer": undefined,
            "cryptoupdateaccount": {
                "accountidtoupdate": {
                    "accountnum": 3,
                    "realmnum": 0,
                    "shardnum": 0,
                },
                "autorenewperiod": undefined,
                "expirationtime": undefined,
                "key": {
                    "contractid": undefined,
                    "ecdsa384": "",
                    "ed25519": "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                    "keylist": undefined,
                    "rsa3072": "",
                    "thresholdkey": undefined,
                },
                "proxyaccountid": undefined,
                "proxyfraction": 0,
                "receiverecordthreshold": 0,
                "receiverecordthresholdwrapper": undefined,
                "receiversigrequired": false,
                "receiversigrequiredwrapper": undefined,
                "sendrecordthreshold": 0,
                "sendrecordthresholdwrapper": undefined
            },
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
