import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import FileCreateTransaction from "../src/account/AccountCreateTransaction";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction";
import FileContentsQuery from "../src/file/FileContentsQuery";
import FileInfoQuery from "../src/file/FileInfoQuery";

describe("FileCreate", function () {
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

        await new FileDeleteTransaction()
            .setFileId(file)
            .setNodeId(response.nodeId)
            .execute(client);

        await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .execute(client);

        client.close();
    });
});
