import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import TransactionId from "../src/transaction/TransactionId.js";
import Transaction from "../src/transaction/Transaction.js";
import AccountId from "../src/account/AccountId.js";
import Timestamp from "../src/Timestamp.js";
import * as hex from "../src/encoding/hex.js";
import { PrivateKey } from "../src/exports.js";

describe("Transcation", function () {
    it("toBytes", async function () {
        const key = PrivateKey.fromString(
            "302e020100300506032b657004220420a58d361e61756ee809686255fda09bacb846ea8aa589c67ac39cfbcf82dd511c"
        );
        const account = AccountId.fromString("0.0.1004");
        const validStart = new Timestamp(1451, 590);
        const transactionId = new TransactionId(account, validStart);

        const hexBytes =
            "0ad6012ad3010a690a110a0608ab0b10ce0412070800100018ec071206080010001803188084af5f2202087832005a410a2212206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc4830ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0312660a640a206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc481a404bcdcf30bd9388887fa4f4f2fab62a6207da9c9d3595e30927a07cf8765389e2c4d02241e04068c90b917fcf3f335e490bf881e08d845ccd26b6e7ebce3745080ad6012ad3010a690a110a0608ab0b10ce0412070800100018ec071206080010001804188084af5f2202087832005a410a2212206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc4830ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0312660a640a206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc481a4068b997900cbf3a4d83ab75c89a2039fc44dac13f5219f723268ab72c2cbdb990bbb499297f88d2d351031dd52dd58e184145da07eef2780b2ac8bd74c58abb0d";

        const transaction = await new AccountCreateTransaction()
            .setKey(key)
            .setNodeAccountIds([new AccountId(3), new AccountId(4)])
            .setTransactionId(transactionId)
            .freeze()
            .sign(key);

        const transactionBytesHex = hex.encode(transaction.toBytes());
        expect(transactionBytesHex).to.eql(hexBytes);

        const transactionFromBytes = Transaction.fromBytes(
            transaction.toBytes()
        );
        const transactionFromBytesToBytes = hex.encode(
            transactionFromBytes.toBytes()
        );

        expect(transactionFromBytesToBytes).to.eql(hexBytes);
    });
});
