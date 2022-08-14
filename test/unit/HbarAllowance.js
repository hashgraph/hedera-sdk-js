import { expect } from "chai";

import { HbarAllowance, AccountId, Hbar } from "../../src/index.js";
import * as symbols from "../../src/Symbols.js";

describe("HbarAllowance", function () {
    it("toProtobuf()", function () {
        const ownerAccountId = new AccountId(3);
        const spenderAccountId = new AccountId(4);
        const hbarAmount = Hbar.fromTinybars(100);

        const allowance = new HbarAllowance({
            ownerAccountId,
            spenderAccountId,
            amount: hbarAmount,
        });

        expect(allowance[symbols.toProtobuf]()).to.deep.equal({
            owner: ownerAccountId[symbols.toProtobuf](),
            spender: spenderAccountId[symbols.toProtobuf](),
            amount: hbarAmount.toTinybars(),
        });
    });
});
