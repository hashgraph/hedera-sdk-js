import { BaseClient } from "../BaseClient";
import { TransactionId } from "../TransactionId";
import { TransactionReceipt } from "../TransactionReceipt";
import { EncryptionKey } from "../crypto/EncryptionKey";
import { ConsensusMessageSubmitTransaction } from "./ConsensusMessageSubmitTransaction";
import { Ed25519PrivateKey } from "../crypto/Ed25519PrivateKey";
import * as utf8 from "@stablelib/utf8";

export class ConsensusClient {
    private client: BaseClient;

    private encryptionKey: EncryptionKey | null = null;

    private submitKey: Ed25519PrivateKey | null = null;

    public constructor(client: BaseClient) {
        this.client = client;
    }

    public setEncryptionKey(key: EncryptionKey): this {
        this.encryptionKey = key;
        return this;
    }

    public setSubmitKey(key: Ed25519PrivateKey): this {
        this.submitKey = key;
        return this;
    }

    public async send(message: string): Promise<this> {
        // TODO [2020-04-01]: Chunk and encrypt the message in that order
        const bytes = utf8.encode(message);
        const pendingTransactions: Promise<TransactionId>[] = [];
        const transactions: TransactionId[] = [];
        const pendingReceipts: Promise<TransactionReceipt>[] = [];
        const receipts: TransactionReceipt[] = [];

        for (let i = 0; i < bytes.length; i += 2000) {
            pendingTransactions.push(new ConsensusMessageSubmitTransaction()
                .setMessage(bytes.subarray(i, bytes.length > i + 2000 ? i + 2000 : bytes.length))
                .execute(this.client));
        }

        for (const transaction of pendingTransactions) {
            transactions.push(await transaction);
        }

        for (const transactionId of transactions) {
            pendingReceipts.push(transactionId.getReceipt(this.client));
        }

        for (const receipt of pendingReceipts) {
            receipts.push(await receipt);
        }

        return this;
    }
}
