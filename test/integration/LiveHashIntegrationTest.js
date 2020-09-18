import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import { PrivateKey } from "../../packages/cryptography/src";
import LiveHashAddTransaction from "../src/account/LiveHashAddTransaction";
import Status from "../src/Status";
import LiveHashDeleteTransaction from "../src/account/LiveHashDeleteTransaction";
import LiveHashQuery from "../src/account/LiveHashQuery";

describe("LiveHash", function () {
    const _hash = decode(
        "100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002"
    );
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.getOperatorId();

        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.getPublicKey())
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        let receipt = await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .setTransactionId(response.transactionId)
            .execute(client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const account = receipt.accountId;

        try {
            await new LiveHashAddTransaction()
                .setAccountId(account)
                .setDuration(Long.fromInt(30))
                .setHash(_hash)
                .setKeys(key)
                .execute(client);
        } catch (err) {
            throw Status.NotSupported.toString();
        }

        try {
            await new LiveHashDeleteTransaction()
                .setAccountId(account)
                .setHash(_hash)
                .execute(client);
        } catch (err) {
            throw Status.NotSupported.toString();
        }

        assert.doesNotThrow(() => {
            new LiveHashQuery()
                .setAccountId(account)
                .setHash(_hash)
                .execute(client);
        }, Status.NotSupported.toString());

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
