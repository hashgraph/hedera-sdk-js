import { ConsensusTopicResponse, ConsensusTopicQuery } from "../generated/MirrorConsensusService_pb";
import {
    ConsensusTopicId,
    ConsensusTopicIdLike
} from "../consensus/ConsensusTopicId";
import { Time } from "../Time";
import { LocalValidationError } from "../errors/LocalValidationError";
import { MirrorConsensusTopicResponse } from "./MirrorConsensusTopicResponse";
import * as crypto from "crypto";
import * as utf8 from "@stablelib/utf8";
import {
    EncryptionKey,
    AES_128_CTR,
    currentChunkOffset,
    chunkCountOffset,
    uuidOffset,
    ivOffset,
    saltOffset,
    keyFingerPrintOffset,
    passphraseFingerPrintOffset,
    messageOffset
} from "../crypto/EncryptionKey";

export type Listener = (message: MirrorConsensusTopicResponse) => void;
export type ErrorHandler = (error: Error) => void;
export type EncryptionKeyProvider = (
    keyFingerPrint: Uint8Array,
    passphraseFingerPrint: Uint8Array,
    salt: Uint8Array
) => EncryptionKey;

export class BaseMirrorConsensusTopicQuery {
    protected readonly _builder: ConsensusTopicQuery = new ConsensusTopicQuery();
    protected provider: EncryptionKeyProvider | null = null;
    protected messages: { [uuid: string]: { read: number; chunks: Uint8Array[] } } = {};

    public setTopicId(id: ConsensusTopicIdLike): this {
        this._builder.setTopicid(new ConsensusTopicId(id)._toProto());
        return this;
    }

    public setStartTime(start: number | Date): this {
        this._builder.setConsensusstarttime(Time.fromDate(start)._toProto());
        return this;
    }

    public setEndTime(start: number | Date): this {
        this._builder.setConsensusendtime(Time.fromDate(start)._toProto());
        return this;
    }

    public setLimit(limit: number): this {
        this._builder.setLimit(limit);
        return this;
    }

    public setEncryptionKeyProvider(provider: EncryptionKeyProvider): this {
        this.provider = provider;
        return this;
    }

    // NOT A STABLE API
    public _validate(): void {
        if (!this._builder.hasTopicid()) {
            throw new LocalValidationError("MirrorConsensusTopicQuery", [ "`.setTopicId()` is required to be called" ]);
        }
    }
}

export function handleListener(
    provider: EncryptionKeyProvider | null,
    messages: { [uuid: string]: { read: number; chunks: Uint8Array[] } },
    message: ConsensusTopicResponse,
    listener: Listener
): void {
    if (provider != null) {
        const view = new DataView(message.getMessage_asU8(), 0);
        const currentChunk = view.getUint32(currentChunkOffset);
        const chunkCount = view.getUint32(chunkCountOffset);
        const uuid = utf8.decode(message.getMessage_asU8()
            .subarray(uuidOffset, uuidOffset + 16));
        const iv = message.getMessage_asU8()
            .subarray(ivOffset, ivOffset + 16);
        const salt = message.getMessage_asU8()
            .subarray(saltOffset, saltOffset + 16);
        const keyFingerPrint = message.getMessage_asU8()
            .subarray(keyFingerPrintOffset, keyFingerPrintOffset + 4);
        const passphraseFingerPrint = message.getMessage_asU8()
            .subarray(passphraseFingerPrintOffset, passphraseFingerPrintOffset + 4);
        const cipherText = message.getMessage_asU8()
            .subarray(messageOffset, message.getMessage_asU8().length);

        const key = provider(keyFingerPrint, passphraseFingerPrint, salt);

        const decipher = crypto.createDecipheriv(AES_128_CTR, key._key, iv);
        const msg = Buffer.concat([ decipher.update(cipherText), decipher[ "final" ]() ]);
        if (messages[ uuid ] == null) {
            messages[ uuid ] = { read: 0, chunks: new Array(chunkCount) };
        }

        // Ignore message if we've already read that current chunk
        if (messages[ uuid ].chunks[ currentChunk ] == null) {
            messages[ uuid ].read += 1;
        }

        messages[ uuid ].chunks[ currentChunk ] = msg;

        if (messages[ uuid ].read === chunkCount) {
            let length = 0;
            for (const chunk of messages[ uuid ].chunks) {
                length += chunk.length;
            }

            const combinedMessage = new Uint8Array(length);
            let currentIndex = 0;
            for (const chunk of messages[ uuid ].chunks) {
                combinedMessage.set(chunk, currentIndex);
                currentIndex += chunk.length;
            }

            message.setMessage(combinedMessage);
            listener(new MirrorConsensusTopicResponse(message));
        }
    } else {
        listener(new MirrorConsensusTopicResponse(message));
    }
}
