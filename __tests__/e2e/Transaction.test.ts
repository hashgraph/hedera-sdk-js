import {
    Ed25519PrivateKey,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    Hbar,
    TransactionId
} from "../../src/index-node";
import { getClientForIntegrationTest } from "./client-setup";

describe("Transaction", () => {
    it("has the same hash as hedera returns in a record", async() => {
        const client = await getClientForIntegrationTest();

        const key1 = await Ed25519PrivateKey.generate();

        const transaction = await new AccountCreateTransaction()
            .setNodeAccountId("0.0.5")
            .setKey(key1.publicKey)
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .build(client)
            .signWith(client._getOperatorKey()!, client._getOperatorSigner()!);

        const hash = transaction.hash();

        let transactionId = await transaction.execute(client);

        const record = await transactionId.getRecord(client);
        const recordHash = record.transactionHash;

        // console.log(`after signing:\n${hash}`);
        // console.log(`the result:\n${recordHash}`);
        expect(hash).toStrictEqual(recordHash);

        const account = record.receipt?.getAccountId()!;

        await new Promise((r) => setTimeout(r, 5000));

        transactionId = await new AccountDeleteTransaction()
            .setDeleteAccountId(account)
            .setTransferAccountId(client._getOperatorAccountId()!)
            .setMaxTransactionFee(new Hbar(1).asTinybar().dividedBy(2))
            .setTransactionId(new TransactionId(account))
            .build(client)
            .sign(key1)
            .execute(client);

        await transactionId.getReceipt(client);
    }, 60000);
});