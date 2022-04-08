import { AccountId, Query, AccountInfoQuery } from "../../src/index.js";

describe("AccountInfo", function () {
    it("[to|from]Bytes()", async function () {
        const accountId = new AccountId(10);

        const query = Query.fromBytes(
            new AccountInfoQuery().setAccountId(accountId).toBytes()
        );

        expect(query instanceof AccountInfoQuery).to.be.true;

        expect(query.accountId.toString()).to.be.equal(accountId.toString());
    });
});
