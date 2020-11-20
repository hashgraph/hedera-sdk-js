import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import TransactionId from "../src/transaction/TransactionId.js";
import Transaction from "../src/transaction/Transaction.js";
import AccountId from "../src/account/AccountId.js";
import Timestamp from "../src/Timestamp.js";
import * as hex from "../src/encoding/hex.js";
import { PrivateKey } from "../src/exports.js";

describe("Transaction", function () {
    it("toBytes", async function () {
        const key = PrivateKey.fromString(
            "302e020100300506032b657004220420a58d361e61756ee809686255fda09bacb846ea8aa589c67ac39cfbcf82dd511c"
        );
        const account = AccountId.fromString("0.0.1004");
        const validStart = new Timestamp(1451, 590);
        const transactionId = new TransactionId(account, validStart);

        const hexBytes =
            "0ace011a660a640a206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc481a40f9a34a33a369150aabc2d5cce076799bac2ddf8edc7192223d7e8d6e903b3c175274077294230f955b30d64d64cfba05f8d6eae0204f4b80540460d6aa5ca10422640a110a0608ab0b10ce0412070800100018ec0712060800100018032202087832005a410a2212206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc4830ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda030ace011a660a640a206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc481a403dcbdb02d469bcdebd03806a6c91827eeffe6b974dab83c17cf1c9b59066d21163170fe14b988951b3c605c3c9d2c0df048680970a71c0fb6802d1e7e312da0322640a110a0608ab0b10ce0412070800100018ec0712060800100018042202087832005a410a2212206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc4830ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda03";

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
