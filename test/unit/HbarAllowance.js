import { expect } from "chai";

import { HbarAllowance, AccountId, Hbar } from "../../src/exports.js";

describe("HbarAllowance", function () {
    it("toProtobuf()", function () {
        const spenderAccountId = new AccountId(4);
        const hbarAmount = Hbar.fromTinybars(100);

        const allowance = new HbarAllowance({
            spenderAccountId,
            amount: hbarAmount,
        });

        expect(allowance._toProtobuf()).to.deep.equal({
            spender: spenderAccountId._toProtobuf(),
            amount: hbarAmount.toTinybars(),
        });
    });
});
