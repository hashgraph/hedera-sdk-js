import { AccountId, TokenId } from "../../src/exports.js";
import AirdropCancelTransaction from "../../src/token/AirdropCancelTransaction.js";
import PendingAirdropId from "../../src/token/PendingAirdropId.js";

describe("AirdropClaimTransaction", function () {
    it("from | to bytes", async function () {
        const pendingAirdropId = new PendingAirdropId({
            tokenId: new TokenId(0, 0, 123),
            serial: 456,
            senderId: new AccountId(0, 0, 789),
            receiverId: new AccountId(0, 0, 987),
        });

        const tx = new AirdropCancelTransaction({
            pendingAirdropIds: [pendingAirdropId],
        });
        console.log(tx.toBytes());

        const tx2 = AirdropCancelTransaction.fromBytes(tx.toBytes());

        expect(tx2.pendingAirdropIds[0]).to.deep.equal(pendingAirdropId);
    });
});
