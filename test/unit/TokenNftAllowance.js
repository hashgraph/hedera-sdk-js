import { expect } from "chai";

import {
    TokenNftAllowance,
    TokenId, 
    AccountId,
} from "../../src/exports.js";
import Long from "long";

describe("TokenNftAllowance", function () {
    it("toProtobuf() with serial numbers", function () {
        const tokenId = new TokenId(1);
        const serial = Long.fromNumber(3);
        const spenderAccountId = new AccountId(4);

        const allowance = new TokenNftAllowance({
            tokenId,
            spenderAccountId,
            serialNumbers: [serial],
        });

        expect(allowance._toProtobuf()).to.deep.equal({
            tokenId: tokenId._toProtobuf(),
            spender: spenderAccountId._toProtobuf(),
            serialNumbers: [serial],
            approvedForAll: null,
        });
    });

    it("toProtobuf() with no serial numbers", function () {
        const tokenId = new TokenId(1);
        const spenderAccountId = new AccountId(4);

        const allowance = new TokenNftAllowance({
            tokenId,
            spenderAccountId,
            serialNumbers: null,
        });

        expect(allowance._toProtobuf()).to.deep.equal({
            tokenId: tokenId._toProtobuf(),
            spender: spenderAccountId._toProtobuf(),
            serialNumbers: null,
            approvedForAll: { value: true },
        });
    });
});
