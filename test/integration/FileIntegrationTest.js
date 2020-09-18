import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import FileCreateTransaction from "../src/account/AccountCreateTransaction";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction";
import FileContentsQuery from "../src/file/FileContentsQuery";
import FileInfoQuery from "../src/file/FileInfoQuery";
import FileAppendTransaction from "../src/file/FileAppendTransaction";
import FileUpdateTransaction from "../src/file/FileUpdateTransaction";

describe("FileIntegration", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorKey = client.getOperatorKey();

        const response = await new FileCreateTransaction()
            .setKey(operatorKey)
            .setContents("[e2e::FileCreateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        let receipt = await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .setTransactionId(response.transactionId)
            .execute(client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        let info = await new FileInfoQuery()
            .setFileId(file)
            .setNodeId(response.nodeId)
            .setQueryPayment(new Hbar(22))
            .execute(client);

        expect(info.fileId).to.be.equal(file);
        expect(info.size).to.be.equal(28);
        expect(info.deleted).to.be.false;
        expect(info.keys.get(0).toString()).to.be.equal(operatorKey.toString());

        await new FileAppendTransaction()
            .setNodeId(response.nodeId)
            .setFileId(file)
            .setContents("[e2e::FileAppendTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .execute(client);

        info = await new FileInfoQuery()
            .setNodeId(response.nodeId)
            .setFileId(file)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.fileId).to.be.equal(file);
        expect(info.size).to.be.equal(56);
        expect(info.deleted).to.be.false;
        expect(info.keys.get(0).toString()).to.be.equal(operatorKey.toString());

        const contents = await new FileContentsQuery()
            .setNodeId(response.nodeId)
            .setFileId(file)
            .setQueryPayment(new Hbar(1))
            .execute(client);

        expect(contents.toString()).to.be.equal(
            "[e2e::FileCreateTransaction][e2e::FileAppendTransaction]"
        );

        await new FileUpdateTransaction()
            .setNodeId(response.nodeId)
            .setFileId(file)
            .setContents("[e2e::FileUpdateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .execute(client);

        info = await new FileInfoQuery()
            .setNodeId(response.nodeId)
            .setFileId(file)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.fileId).to.be.equal(file);
        expect(info.size).to.be.equal(28);
        expect(info.deleted).to.be.false;
        expect(info.keys.get(0).toString()).to.be.equal(operatorKey.toString());

        await new FileDeleteTransaction()
            .setFileId(file)
            .setNodeId(response.nodeId)
            .execute(client);

        await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .execute(client);

        info = await new FileInfoQuery()
            .setNodeId(response.nodeId)
            .setFileId(file)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.fileId).to.be.equal(file);
        expect(info.deleted).to.be.true;
        expect(info.keys.get(0).toString()).to.be.equal(operatorKey.toString());

        client.close();
    });
});
