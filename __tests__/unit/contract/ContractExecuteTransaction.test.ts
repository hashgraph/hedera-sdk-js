import { ContractExecuteTransaction, ContractFunctionParams, Hbar } from "../../../src/exports";
import {mockClient, privateKey} from "../MockClient";

describe("ContractExecuteTransaction", () => {
    it("serializes and deserializes correctly; ContractExecuteTransaction", () => {
        const transaction = new ContractExecuteTransaction()
            .setContractId({ shard: 0, realm: 0, contract: 5 })
            .setGas(141)
            .setPayableAmount(10000)
            .setFunction("set_message", new ContractFunctionParams().addString("this is random message"))
            .setMaxTransactionFee(1e6)
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .build(mockClient)
            .sign(privateKey);

        const tx = transaction._toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeDpwCgIYBRCNARiQTiJkLpgmAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABZ0aGlzIGlzIHJhbmRvbSBtZXNzYWdlAAAAAAAAAAAAAA==",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "YdNskiTEGqOeF269LOjhnNJ3PIt2/aZg+HWgNQVTTbiBP7nr1xI9rrO94MNdHhos8yaoq5r1mXfCsxrBcHqgDQoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHg6cAoCGAUQjQEYkE4iZC6YJgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWdGhpcyBpcyByYW5kb20gbWVzc2FnZQAAAAAAAAAAAAA=",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
