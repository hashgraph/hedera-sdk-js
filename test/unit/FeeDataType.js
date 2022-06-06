import * as HashgraphProto from "@hashgraph/proto";
import { FeeDataType } from "../../src/exports.js";

describe("FeeDataType", function () {
    it("has all the response codes", function () {
        for (const [s, code] of Object.entries(
            HashgraphProto.proto.SubType
        )) {
            expect(FeeDataType._fromCode(code).toString()).to.be.equal(s);
        }
    });
});
