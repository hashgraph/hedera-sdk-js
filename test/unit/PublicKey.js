import {
    AccountId,
    PrivateKey,
    TransactionId,
    TransferTransaction,
} from "../src/exports.js";

describe("PublicKey", function () {
    it("`verifyTransaction` works", async function () {
        const key = PrivateKey.generateED25519();

        const transaction = new TransferTransaction()
            .setTransactionId(TransactionId.generate(new AccountId(5)))
            .setNodeAccountIds([new AccountId(6)])
            .addHbarTransfer("0.0.3", -1)
            .addHbarTransfer("0.0.4", 1)
            .freeze();

        await transaction.sign(key);

        expect(key.publicKey.verifyTransaction(transaction)).to.be.true;

        const signatures = transaction.getSignatures();

        for (const [nodeAccountId, nodeSignatures] of signatures) {
            expect(nodeAccountId.toString()).equals("0.0.6");

            for (const [publicKey] of nodeSignatures) {
                expect(publicKey.verifyTransaction(transaction)).to.be.true;
            }
        }
    });
});
