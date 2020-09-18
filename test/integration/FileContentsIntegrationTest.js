import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import FileCreateTransaction from "../src/account/AccountCreateTransaction";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction";
import FileContentsQuery from "../src/file/FileContentsQuery";

describe("FileContents", function () {
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

        let contents = await new FileContentsQuery()
            .setFileId(file)
            .setNodeId(response.nodeId)
            .setQueryPayment(new Hbar(1))
            .execute(client);

        expect(contents.toString()).to.be.equal("[e2e::FileCreateTransaction]");

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
