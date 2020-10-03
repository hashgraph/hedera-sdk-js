import Hbar from "../src/Hbar.js";
import newClient from "./client/index.js";
import FileCreateTransaction from "../src/file/FileCreateTransaction.js";
import FileInfoQuery from "../src/file/FileInfoQuery.js";
import FileAppendTransaction from "../src/file/FileAppendTransaction.js";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction.js";

describe("FileAppend", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = newClient();
        const operatorKey = client.operatorPublicKey;

        let response = await new FileCreateTransaction()
            .setKeys(operatorKey)
            .setContents("[e2e::FileCreateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        let receipt = await response.getReceipt(client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        let info = await new FileInfoQuery()
            .setFileId(file)
            .setNodeAccountId(response.nodeId)
            .setQueryPayment(new Hbar(22))
            .execute(client);

        expect(info.fileId.toString()).to.be.equal(file.toString());
        expect(info.size.toInt()).to.be.equal(28);
        expect(info.deleted).to.be.false;

        // There should only be one key
        for (const key of info.keys) {
            expect(key.toString()).to.be.equal(operatorKey.toString());
        }

        await (
            await new FileAppendTransaction()
                .setFileId(file)
                .setNodeAccountId(response.nodeId)
                .setContents("[e2e::FileAppendTransaction]")
                .setMaxTransactionFee(new Hbar(5))
                .execute(client)
        ).getReceipt(client);

        info = await new FileInfoQuery()
            .setFileId(file)
            .setNodeAccountId(response.nodeId)
            .setQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.fileId.toString()).to.be.equal(file.toString());
        expect(info.size.toInt()).to.be.equal(56);
        expect(info.deleted).to.be.false;

        // There should only be one key
        for (const key of info.keys) {
            expect(key.toString()).to.be.equal(operatorKey.toString());
        }

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .setNodeAccountId(response.nodeId)
                .execute(client)
        ).getReceipt(client);
    });
});
