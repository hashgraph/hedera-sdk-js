import FileCreateTransaction from "../src/file/FileCreateTransaction";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction";
import FileContentsQuery from "../src/file/FileContentsQuery";
import Hbar from "../src/Hbar";
import newClient from "./client";

describe("FileContents", function () {
    it("should be executable", async function () {
        this.timeout(10000);

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

        const contents = await new FileContentsQuery()
            .setFileId(file)
            .setNodeId(response.nodeId)
            .setQueryPayment(new Hbar(1))
            .execute(client);

        expect(contents.toString()).to.be.equal("[e2e::FileCreateTransaction]");

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .setNodeId(response.nodeId)
                .execute(client)
        ).getReceipt(client);
    });
});
