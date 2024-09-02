import { AccountId, TokenId } from "../../src/exports.js";
import AirdropClaimTransaction from "../../src/token/AirdropClaimTransaction.js";
import PendingAirdropId from "../../src/token/PendingAirdropId.js";

describe("AirdropClaimTransaction", function () {
    it("from | to bytes", async function () {
        const pendingAirdropId = new PendingAirdropId({
            tokenId: new TokenId(0, 0, 123),
            serial: 456,
            senderId: new AccountId(0, 0, 789),
            receiverId: new AccountId(0, 0, 987),
        });
        const tx = new AirdropClaimTransaction({
            pendingAirdropIds: [pendingAirdropId],
        });

        const tx2 = AirdropClaimTransaction.fromBytes(tx.toBytes());

        expect(tx2.pendingAirdropIds[0]).to.deep.equal(pendingAirdropId);
    });
});
