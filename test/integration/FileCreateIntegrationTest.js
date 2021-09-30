import FileCreateTransaction from "../src/file/FileCreateTransaction.js";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction.js";
import FileInfoQuery from "../src/file/FileInfoQuery.js";
import Hbar from "../src/Hbar.js";
import Status from "../src/Status.js";
import Timestamp from "../src/Timestamp.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("FileCreate", function () {
    it("should be executable", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        let response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents("[e2e::FileCreateTransaction]")
            .execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        let info = await new FileInfoQuery()
            .setFileId(file)
            .setQueryPayment(new Hbar(22))
            .execute(env.client);

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
                .execute(env.client)
        ).getReceipt(env.client);

        await env.close();
    });

    it("should be executable with empty contents", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        let response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);

        await env.close();
    });

    it("should be executable with no keys", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();

        let response = await new FileCreateTransaction().execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        await env.close();
    });

    it("should error with too large expiration time", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        let err = false;

        try {
            await (
                await new FileCreateTransaction()
                    .setKeys([operatorKey])
                    .setContents("[e2e::FileCreateTransaction]")
                    .setExpirationTime(new Timestamp(Date.now() + 99999999, 0))
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.AutorenewDurationNotInRange);
        }

        if (!err) {
            throw new Error("file creation did not error");
        }

        await env.close();
    });
});
