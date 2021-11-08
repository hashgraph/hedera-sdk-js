import TransferTransaction from "../src/account/TransferTransaction.js";
import HbarUnit from "../src/HbarUnit.js";
import Hbar from "../src/Hbar.js";
import TokenId from "../src/token/TokenId.js";
import AccountId from "../src/account/AccountId.js";
import Transaction from "../src/transaction/Transaction.js";
import TransactionId from "../src/transaction/TransactionId.js";
import Timestamp from "../src/Timestamp.js";

describe("TransferTransaction", function () {
    it("should combine multiple same accountId tansfers into one transfer", function () {
        const expectedHbar = 3;
        const accountId = "0.0.0";

        const transfer = new TransferTransaction()
            .addHbarTransfer(accountId, 1)
            .addHbarTransfer(accountId, 1);

        transfer.addHbarTransfer(accountId, 1);
        transfer.addHbarTransfer("0.0.1", 1);

        expect(
            transfer.hbarTransfers.get(accountId).to(HbarUnit.Hbar).toNumber()
        ).to.be.equal(new Hbar(expectedHbar).to(HbarUnit.Hbar).toNumber());
    });

    it("should load ntf transfers from bytes", function () {
        const tokenId = new TokenId(1, 1, 1);
        const serialNum = 111111111;
        const fromAccount = new AccountId(1, 1, 1);
        const toAccount = new AccountId(2, 2, 2);
        const transferTransaction = new TransferTransaction();
        transferTransaction.addNftTransfer(
            tokenId,
            serialNum,
            fromAccount,
            toAccount
        );
        transferTransaction.addNftTransfer(
            tokenId,
            serialNum,
            fromAccount,
            toAccount
        );
        transferTransaction.setTransactionId(
            new TransactionId(new AccountId(3, 3, 3), new Timestamp(4, 4))
        );
        transferTransaction.setNodeAccountIds([new AccountId(4, 4, 4)]);
        transferTransaction.freeze();

        const transferTransactionFromBytes = Transaction.fromBytes(
            transferTransaction.toBytes()
        );

        expect(transferTransaction.nftTransfers.keys()).to.eql(
            transferTransactionFromBytes.nftTransfers.keys()
        );
        expect(transferTransaction.nftTransfers.values()).to.eql(
            transferTransactionFromBytes.nftTransfers.values()
        );
    });
});
