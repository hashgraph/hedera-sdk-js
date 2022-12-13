import {
    FileCreateTransaction,
    FileDeleteTransaction,
    FileInfoQuery,
    Hbar,
    Status,
    Timestamp,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("FileCreate", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });
    it("should be executable", async function () {
        this.timeout(120000);

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
    });

    it("should be executable with empty contents", async function () {
        this.timeout(120000);

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
    });

    it("should be executable with no keys", async function () {
        this.timeout(120000);

        let response = await new FileCreateTransaction().execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;
    });

    it("should error with too large expiration time", async function () {
        this.timeout(120000);

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
    });

    after(async function () {
        await env.close();
    });
});
