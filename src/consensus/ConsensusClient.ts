import { BaseClient } from "../BaseClient";
import { TransactionId } from "../TransactionId";
import { TransactionReceipt } from "../TransactionReceipt";
import {
    EncryptionKey,
    currentChunkOffset,
    chunkCountOffset
} from "../crypto/EncryptionKey";
import { ConsensusMessageSubmitTransaction } from "./ConsensusMessageSubmitTransaction";
import { Ed25519PrivateKey } from "../crypto/Ed25519PrivateKey";
import { ConsensusTopicId } from "./ConsensusTopicId";
import * as utf8 from "@stablelib/utf8";

export class ConsensusClient {
    private client: BaseClient;

    private encryptionKey: EncryptionKey | null = null;

    private submitKey: Ed25519PrivateKey | null = null;

    private topicId: ConsensusTopicId | null = null;

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

    public setTopicId(id: ConsensusTopicId): this {
        this.topicId = id;
        return this;
    }

    public async send(message: string): Promise<this> {
        const bytes = utf8.encode(message);
        const pendingTransactions: Promise<TransactionId>[] = [];
        const transactions: TransactionId[] = [];
        const pendingReceipts: Promise<TransactionReceipt>[] = [];
        const receipts: TransactionReceipt[] = [];

        console.log(`[encrypt] bytes.length: ${bytes.length}`);

        const chunkCount = ((bytes.length | 0) / 2000) | 0;

        console.log(`[encrypt] chunkCount: ${chunkCount}`);

        for (let i = 0; i < chunkCount + 1; i += 1) {
            console.log(`[encrypt] currentChunk: ${i}`);

            let msg: Uint8Array;
            const length = i === chunkCount ? bytes.length % 2000 : 2000;

            console.log(`[encrypt] length: ${length}`);
            if (this.encryptionKey != null) {
                msg = await this.encryptionKey.encrypt(bytes.subarray(
                    i * 2000,
                    (i * 2000) + length
                ));
            } else {
                msg = new Uint8Array(length + 8);
                msg.set(bytes.subarray(i * 2000, (i * 2000) + length), 8);
            }
            console.log(`[encrypt] msg: ${msg}`);

            // Set current chunk anc total chunk count.
            const view = new DataView(msg.buffer, 0);
            view.setUint32(currentChunkOffset, i);
            view.setUint32(chunkCountOffset, chunkCount);

            console.log(`[encrypt] msg: ${msg}`);

            pendingTransactions.push(new ConsensusMessageSubmitTransaction()
                .setTopicId(this.topicId!)
                .setMessage(msg)
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
