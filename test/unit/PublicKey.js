import {
    AccountId,
    PrivateKey,
    TransactionId,
    TransferTransaction,
} from "../src/exports.js";

describe("PublicKey", function () {
    it("`verifyTransaction` works", async function () {
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateECDSA();

        const transaction = new TransferTransaction()
            .setTransactionId(TransactionId.generate(new AccountId(5)))
            .setNodeAccountIds([new AccountId(6)])
            .addHbarTransfer("0.0.3", -1)
            .addHbarTransfer("0.0.4", 1)
            .freeze();

        await transaction.sign(key1);
        await transaction.sign(key2);

        expect(key1.publicKey.verifyTransaction(transaction)).to.be.true;
        expect(key2.publicKey.verifyTransaction(transaction)).to.be.true;

        const signatures = transaction.getSignatures();
        expect(signatures.size).to.be.equal(1);

        for (const [nodeAccountId, nodeSignatures] of signatures) {
            expect(nodeAccountId.toString()).equals("0.0.6");

            expect(nodeSignatures.size).to.be.equal(2);
            for (const [publicKey] of nodeSignatures) {
                expect(publicKey.verifyTransaction(transaction)).to.be.true;
            }
        }
    });
});
