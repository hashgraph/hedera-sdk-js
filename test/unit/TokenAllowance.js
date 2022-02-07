import { expect } from "chai";

import { TokenAllowance, AccountId, TokenId } from "../../src/exports.js";
import Long from "long";

describe("TokenAllowance", function () {
    it("toProtobuf()", function () {
        const tokenId = new TokenId(1);
        const spenderAccountId = new AccountId(4);
        const tokenAmount = Long.fromNumber(100);

        const allowance = new TokenAllowance({
            tokenId,
            spenderAccountId,
            amount: tokenAmount,
        });

        expect(allowance._toProtobuf()).to.deep.equal({
            tokenId: tokenId._toProtobuf(),
            spender: spenderAccountId._toProtobuf(),
            amount: tokenAmount,
        });
    });
});
