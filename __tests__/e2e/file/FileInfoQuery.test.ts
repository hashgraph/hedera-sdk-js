import { Client, Ed25519PrivateKey, FileCreateTransaction, TransactionId, FileDeleteTransaction, Hbar, FileInfoQuery } from "../../../src/index-node";

describe("FileInfoQuery", () => {
    it("can be executed", async () => {
        if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
            throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
        }

        const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorAccount = process.env.OPERATOR_ID;

        const client = Client
            .forTestnet()
            .setOperator(operatorAccount, operatorPrivateKey);

        let transactionId = await new FileCreateTransaction()
            .addKey(operatorPrivateKey.publicKey)
            .setContents("[e2e::FileInfoQuery]")
            .setMaxTransactionFee(new Hbar(2))
            .execute(client);

        let receipt = await transactionId.getReceipt(client);

        const file = receipt.getFileId();

        let info = await new FileInfoQuery()
            .setFileId(file)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.fileId).toStrictEqual(file);
        expect(info.size).toBe(20);
        expect(info.isDeleted).toBe(false);
        expect(info.keys[ 0 ].toString()).toBe(operatorPrivateKey.publicKey.toString());

        transactionId = await new FileDeleteTransaction()
            .setFileId(file)
            .setMaxTransactionFee(new Hbar(1))
            .execute(client);

        await transactionId.getReceipt(client);

        let errorThrown = false;
        try {
            await new FileInfoQuery()
                .setFileId(file)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client);
        } catch {
            errorThrown = true;
        }

        expect(errorThrown).toBe(true);

        // Test change
    }, 35000);
});
