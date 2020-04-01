import { ConsensusService } from "../../generated/MirrorConsensusService_pb_service";
import { ConsensusTopicResponse } from "../../generated/MirrorConsensusService_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { MirrorClient } from "./MirrorClient";
import { MirrorSubscriptionHandle } from "../MirrorSubscriptionHandle";
import { MirrorConsensusTopicResponse } from "../MirrorConsensusTopicResponse";
import {
    AES_128_CTR,
    currentChunkOffset,
    chunkCountOffset,
    uuidOffset,
    ivOffset,
    saltOffset,
    keyFingerPrintOffset,
    passphraseFingerPrintOffset,
    messageOffset
} from "../../crypto/EncryptionKey";
import { BaseMirrorConsensusTopicQuery, ErrorHandler, Listener } from "../BaseMirrorConsensusTopicQuery";
import * as crypto from "crypto";
import * as utf8 from "@stablelib/utf8";

export class MirrorConsensusTopicQuery extends BaseMirrorConsensusTopicQuery {
    private messages: { [uuid: string]: { read: number; chunks: Uint8Array[] } } = {};

    public subscribe(
        client: MirrorClient,
        listener: Listener,
        errorHandler?: ErrorHandler
    ): MirrorSubscriptionHandle {
        this._validate();

        const provider = this.provider;
        const messages = this.messages;

        const response = grpc.invoke(ConsensusService.subscribeTopic, {
            host: client.endpoint,
            request: this._builder,
            onMessage(message: ConsensusTopicResponse): void {
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
            },
            onEnd(code: grpc.Code, message: string): void {
                if (errorHandler != null) {
                    errorHandler(new Error(`Received status code: ${code} and message: ${message}`));
                }
            }
        });

        return new MirrorSubscriptionHandle(response.close);
    }
}
