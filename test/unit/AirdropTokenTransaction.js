/* eslint-disable mocha/no-setup-in-describe */

import {
    AccountId,
    AirdropTokenTransaction,
    TokenId,
} from "../../src/index.js";
import TokenTransferList from "../../src/token/TokenTransferList.js";
import AccountAmount from "../../src/token/AccountAmount.js";

describe("Transaction", function () {
    it("toBytes", async function () {
        const user = new AccountId(0, 0, 1);
        const tokenId = new TokenId(0, 0, 1);
        let accountAmounts = new AccountAmount()
            .setAccountId(user)
            .setIsApproval(true)
            .setAmount(1000);

        let transferList = new TokenTransferList()
            .setAccountAmounts([accountAmounts])
            .setTokenId(tokenId)
            .setExpectedDecimals(1);

        const transaction = new AirdropTokenTransaction().setTokenTransfers([
            transferList,
        ]);

        console.log(AirdropTokenTransaction.fromBytes(transaction.toBytes()));
        /*console.log(
            AirdropTokenTransaction._fromProtobuf(transaction._toProtobuf()),
        );*/
    });
});
