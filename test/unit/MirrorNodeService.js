import MirrorNodeService, {
    TokenKeyStatusEnum,
    TokenFreezeStatusEnum,
} from "../../src/network/MirrorNodeService.js";
import * as HashgraphProto from "@hashgraph/proto";
import { expect } from "chai";

describe("MirrorNodeService", function () {
    let mirrorNodeService;

    before(function () {
        mirrorNodeService = new MirrorNodeService();
    });

    it("should return the set timeout value", async function () {
        mirrorNodeService.setTimeout(1000);
        expect(mirrorNodeService._timeout).to.be.eql(1000);
    });

    it("getTokenFreezeStatusFrom helper function", async function () {
        const statuses = Object.values(TokenFreezeStatusEnum);

        for (let i; i < statuses.length; i++) {
            const freezeStatus = mirrorNodeService.getTokenFreezeStatusFrom(
                statuses[i],
            );
            expect(freezeStatus).to.be.eql(
                HashgraphProto.proto.TokenFreezeStatus[i],
            );
        }
    });

    it("getTokenKycStatusFrom helper function", async function () {
        const statuses = Object.values(TokenKeyStatusEnum);

        for (let i; i < statuses.length; i++) {
            const kycStatus = mirrorNodeService.getTokenKycStatusFrom(
                statuses[i],
            );
            expect(kycStatus).to.be.eql(HashgraphProto.proto.TokenKycStatus[i]);
        }
    });
});
