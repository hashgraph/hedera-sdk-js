import {
    AccountId,
    PrivateKey,
    PublicKey,
    TransactionId,
    TransferTransaction,
    Transaction,
} from "../../src/index.js";

describe("PublicKey", function () {
    it("`verifyTransaction` works", async function () {
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateECDSA();

        let transaction = new TransferTransaction()
            .setTransactionId(TransactionId.generate(new AccountId(5)))
            .setNodeAccountIds([new AccountId(6)])
            .addHbarTransfer("0.0.3", -1)
            .addHbarTransfer("0.0.4", 1)
            .freeze();

        await transaction.sign(key1);
        await transaction.sign(key2);

        expect(key1.publicKey.verifyTransaction(transaction)).to.be.true;
        expect(key2.publicKey.verifyTransaction(transaction)).to.be.true;

        let signatures = transaction.getSignatures();
        expect(signatures.size).to.be.equal(1);

        for (const [nodeAccountId, nodeSignatures] of signatures) {
            expect(nodeAccountId.toString()).equals("0.0.6");

            expect(nodeSignatures.size).to.be.equal(2);
            for (const [publicKey] of nodeSignatures) {
                expect(publicKey.verifyTransaction(transaction)).to.be.true;
            }
        }

        const bytes = transaction.toBytes();

        transaction = Transaction.fromBytes(bytes);

        expect(key1.publicKey.verifyTransaction(transaction)).to.be.true;
        expect(key2.publicKey.verifyTransaction(transaction)).to.be.true;

        signatures = transaction.getSignatures();
        expect(signatures.size).to.be.equal(1);

        for (const [nodeAccountId, nodeSignatures] of signatures) {
            expect(nodeAccountId.toString()).equals("0.0.6");

            expect(nodeSignatures.size).to.be.equal(2);
            for (const [publicKey] of nodeSignatures) {
                expect(publicKey.verifyTransaction(transaction)).to.be.true;
            }
        }
    });

    it("verify `fromStringECDSA()` works", async function () {
        const ecdsaStringKey =
            "302d300706052b8104000a0322000245f219afdfc8e61b9f6879fa7c8a16a94b35471662afa302993d7d9a29564f81";
        const publicKeyECDSA = PublicKey.fromStringECDSA(ecdsaStringKey);

        expect(publicKeyECDSA.toString()).to.be.equal(ecdsaStringKey);
    });

    it("verify `fromStringED25519()` works", async function () {
        const ed25519StringKey =
            "302a300506032b6570032100bc46c36d8aeb94270064edb8d3d4d5d29446e1bb2f36cc47b2c9b755ef0aac25";
        const publicKeyED25519 = PublicKey.fromStringED25519(
            "302a300506032b6570032100bc46c36d8aeb94270064edb8d3d4d5d29446e1bb2f36cc47b2c9b755ef0aac25"
        );

        expect(publicKeyED25519.toString()).to.be.equal(ed25519StringKey);
    });
});
