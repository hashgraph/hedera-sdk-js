import {
    FileAppendTransaction,
    FileCreateTransaction,
    FileDeleteTransaction,
    FileInfoQuery,
    Hbar,
    Status,
} from "../../src/exports.js";
import { bigContents } from "./contents.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("FileAppend", function () {
    let env;
    let newContentsLength;
    let newContents;
    let operatorKey;

    before(async function () {
        env = await IntegrationTestEnv.new();
        newContentsLength = 5000;
        newContents = generateUInt8Array(newContentsLength);
        operatorKey = env.operatorKey.publicKey;
    });
    it("should be executable", async function () {
        this.timeout(120000);

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
        expect(info.keys.toArray().length).to.be.equal(1);

        // There should only be one key
        for (const key of info.keys) {
            expect(key.toString()).to.be.equal(operatorKey.toString());
        }

        await (
            await new FileAppendTransaction()
                .setFileId(file)
                .setContents("[e2e::FileAppendTransaction]")
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new FileInfoQuery()
            .setFileId(file)
            .setQueryPayment(new Hbar(1))
            .execute(env.client);

        expect(info.fileId.toString()).to.be.equal(file.toString());
        expect(info.size.toInt()).to.be.equal(56);
        expect(info.isDeleted).to.be.false;
        expect(info.keys.toArray().length).to.be.equal(1);

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

    it("should be chunk contents", async function () {
        this.timeout(120000 * 2);

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
        expect(info.keys.toArray().length).to.be.equal(1);

        // There should only be one key
        for (const key of info.keys) {
            expect(key.toString()).to.be.equal(operatorKey.toString());
        }

        await (
            await new FileAppendTransaction()
                .setFileId(file)
                .setContents(bigContents)
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new FileInfoQuery()
            .setFileId(file)
            .setQueryPayment(new Hbar(1))
            .execute(env.client);

        expect(info.fileId.toString()).to.be.equal(file.toString());
        expect(info.size.toInt()).to.be.equal(13523);
        expect(info.isDeleted).to.be.false;
        expect(info.keys.toArray().length).to.be.equal(1);

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

    it("should error with no file ID set", async function () {
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

        let err = false;

        try {
            await (
                await new FileAppendTransaction()
                    .setContents("[e2e::FileAppendTransaction]")
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidFileId);
        }

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("file append transaction did not error");
        }
    });

    it("should not error with no contents appended", async function () {
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

        await (
            await new FileAppendTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("should keep content after deserialization", async function () {
        this.timeout(120000);

        let response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(Buffer.from(""))
            .execute(env.client);

        let { fileId } = await response.getReceipt(env.client);

        expect(fileId).to.not.be.null;
        expect(fileId != null ? fileId.num > 0 : false).to.be.true;

        const tx = new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(newContents);

        const txBytes = tx.toBytes();
        const txFromBytes = FileAppendTransaction.fromBytes(txBytes);

        await (await txFromBytes.execute(env.client)).getReceipt(env.client);

        const content = await new FileInfoQuery()
            .setFileId(fileId)
            .execute(env.client);
        expect(content.size.toInt()).to.be.equal(newContentsLength);
    });

    it("should be able to freeze after deserialze", async function () {
        this.timeout(120000);

        const NEW_CONTENTS_LENGTH = 5000;
        const NEW_CONTENTS = generateUInt8Array(NEW_CONTENTS_LENGTH);
        const operatorKey = env.operatorKey.publicKey;

        let response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(Buffer.from(""))
            .execute(env.client);

        let { fileId } = await response.getReceipt(env.client);

        expect(fileId).to.not.be.null;
        expect(fileId != null ? fileId.num > 0 : false).to.be.true;

        const tx = new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(NEW_CONTENTS);

        const txBytes = tx.toBytes();
        const txFromBytes = FileAppendTransaction.fromBytes(txBytes);

        txFromBytes.freezeWith(env.client);

        expect(txFromBytes.isFrozen()).to.be.true;
    });

    after(async function () {
        await env.close();
    });
});

function generateUInt8Array(length) {
    const uint8Array = new Uint8Array(length);
    return uint8Array.fill(1);
}
