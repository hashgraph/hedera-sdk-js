import FileCreateTransaction from "../src/file/FileCreateTransaction.js";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction.js";
import FileUpdateTransaction from "../src/file/FileUpdateTransaction.js";
import FileInfoQuery from "../src/file/FileInfoQuery.js";
import Hbar from "../src/Hbar.js";
import Status from "../src/Status.js";
import newClient from "./client/index.js";

describe("FileUpdate", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
        const operatorKey = client.operatorPublicKey;

        let response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents("[e2e::FileCreateTransaction]")
            .execute(client);

        let receipt = await response.getReceipt(client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        let info = await new FileInfoQuery()
            .setFileId(file)
            .setNodeAccountIds([response.nodeId])
            .setQueryPayment(new Hbar(22))
            .execute(client);

        expect(info.fileId.toString()).to.be.equal(file.toString());
        expect(info.size.toInt()).to.be.equal(28);
        expect(info.isDeleted).to.be.false;

        // There should only be one key
        for (const key of info.keys) {
            expect(key.toString()).to.be.equal(operatorKey.toString());
        }

        await (
            await new FileUpdateTransaction()
                .setNodeAccountIds([response.nodeId])
                .setFileId(file)
                .setContents("[e2e::FileUpdateTransaction]")
                .execute(client)
        ).getReceipt(client);

        info = await new FileInfoQuery()
            .setFileId(file)
            .setNodeAccountIds([response.nodeId])
            .setQueryPayment(new Hbar(22))
            .execute(client);

        expect(info.fileId.toString()).to.be.equal(file.toString());
        expect(info.size.toInt()).to.be.equal(28);
        expect(info.isDeleted).to.be.false;

        // There should only be one key
        for (const key of info.keys) {
            expect(key.toString()).to.be.equal(operatorKey.toString());
        }

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .setNodeAccountIds([response.nodeId])
                .execute(client)
        ).getReceipt(client);
    });

    it("should error when file ID is not set", async function () {
        this.timeout(15000);

        const client = await newClient();

        let err = false;

        try {
            await (
                await new FileUpdateTransaction()
                    .setContents("[e2e::FileUpdateTransaction]")
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidFileId);
        }

        if (!err) {
            throw new Error("file update did not error");
        }
    });
});
