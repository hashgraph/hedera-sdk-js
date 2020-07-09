import { FileContentsQuery, FileCreateTransaction, FileInfoQuery, FileUpdateTransaction, FileAppendTransaction, FileDeleteTransaction, Hbar } from "../../../src/index-node";
import * as utf8 from "@stablelib/utf8";
import { getClientForIntegrationTest } from "../client-setup";

describe("FileCreateTransaction", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest();

        let transactionId = await new FileCreateTransaction()
            .addKey(client._getOperatorKey()!)
            .setContents("[e2e::FileCreateTransaction]")
            .setMaxTransactionFee(new Hbar(15))
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
        expect(info.keys[ 0 ].toString()).toBe(client._getOperatorKey()!.toString());

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
        expect(info.keys[ 0 ].toString()).toBe(client._getOperatorKey()!.toString());

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
        expect(info.keys[ 0 ].toString()).toBe(client._getOperatorKey()!.toString());

        transactionId = await new FileDeleteTransaction()
            .setFileId(file)
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);
    }, 60000);
});
