import { Client, Ed25519PrivateKey, FileContentsQuery, FileCreateTransaction, FileInfoQuery, FileUpdateTransaction, FileAppendTransaction, FileDeleteTransaction, Hbar } from "../../../src/index-node";
import * as utf8 from "@stablelib/utf8";

describe("FileCreateTransaction", () => {
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
            .setContents("[e2e::FileCreateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        const file = receipt.getFileId();

        let info = await new FileInfoQuery()
            .setFileId(file)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.fileId).toStrictEqual(file);
        expect(info.size).toBe(28);
        expect(info.isDeleted).toBe(false);
        expect(info.keys[ 0 ].toString()).toBe(operatorPrivateKey.publicKey.toString());

        transactionId = await new FileAppendTransaction()
            .setFileId(file)
            .setContents("[e2e::FileAppendTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);

        info = await new FileInfoQuery()
            .setFileId(file)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.fileId).toStrictEqual(file);
        expect(info.size).toBe(56);
        expect(info.isDeleted).toBe(false);
        expect(info.keys[ 0 ].toString()).toBe(operatorPrivateKey.publicKey.toString());

        const contents = await new FileContentsQuery()
            .setFileId(file)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(utf8.decode(contents)).toBe("[e2e::FileCreateTransaction][e2e::FileAppendTransaction]");

        transactionId = await new FileUpdateTransaction()
            .setFileId(file)
            .setContents("[e2e::FileUpdateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);

        info = await new FileInfoQuery()
            .setFileId(file)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.fileId).toStrictEqual(file);
        expect(info.size).toBe(28);
        expect(info.isDeleted).toBe(false);
        expect(info.keys[ 0 ].toString()).toBe(operatorPrivateKey.publicKey.toString());

        transactionId = await new FileDeleteTransaction()
            .setFileId(file)
            .setMaxTransactionFee(new Hbar(5))
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
    }, 60000);
});
