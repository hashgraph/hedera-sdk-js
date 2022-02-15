import "mocha";
import { expect } from "chai";
import Long from "long";

import { TokenAllowance, AccountId, TokenId } from "../../src/exports.js";

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
