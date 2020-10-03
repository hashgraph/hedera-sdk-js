import FileCreateTransaction from "../src/file/FileCreateTransaction.js";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction.js";
import FileContentsQuery from "../src/file/FileContentsQuery.js";
import Hbar from "../src/Hbar.js";
import newClient from "./client/index.js";
import * as utf8 from "../src/encoding/utf8.js";

describe("FileContents", function () {
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

        const contents = await new FileContentsQuery()
            .setFileId(file)
            .setNodeAccountId(response.nodeId)
            .setQueryPayment(new Hbar(1))
            .execute(client);

        expect(utf8.decode(contents)).to.be.equal(
            "[e2e::FileCreateTransaction]"
        );

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .setNodeAccountId(response.nodeId)
                .execute(client)
        ).getReceipt(client);
    });
});
