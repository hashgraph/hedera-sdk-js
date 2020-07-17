import { grpc } from "@improbable-eng/grpc-web";
import { ConsensusTopicResponse } from "../../generated/MirrorConsensusService_pb";
import { ConsensusService } from "../../generated/MirrorConsensusService_pb_service";
import { TransactionId } from "../../TransactionId";
import { BaseMirrorConsensusTopicQuery, ErrorHandler, Listener } from "../BaseMirrorConsensusTopicQuery";
import { MirrorConsensusTopicResponse } from "../MirrorConsensusTopicResponse";
import { MirrorSubscriptionHandle } from "../MirrorSubscriptionHandle";
import { MirrorClient } from "./MirrorClient";

export class MirrorConsensusTopicQuery extends BaseMirrorConsensusTopicQuery {
    public subscribe(
        client: MirrorClient,
        listener: Listener,
        errorHandler?: ErrorHandler
    ): MirrorSubscriptionHandle {
        this._validate();

        const list: { [ id: string]: ConsensusTopicResponse[] | null } = {};

        const response = grpc.invoke(ConsensusService.subscribeTopic, {
            host: client.endpoint,
            request: this._builder,
            onMessage(message: ConsensusTopicResponse): void {
                if (!message.hasChunkinfo()) {
                    listener(new MirrorConsensusTopicResponse(message));
                } else {
                    const chunkInfo = message.getChunkinfo()!;

                    // eslint-disable-next-line max-len
                    const txId = TransactionId._fromProto(chunkInfo.getInitialtransactionid()!).toString();

                    if (list[ txId ] == null) {
                        list[ txId ] = [];
                    }

                    list[ txId ]!.push(message);

                    if (list[ txId ]!.length === chunkInfo.getTotal()) {
                        const m = list[ txId ]!;
                        list[ txId ] = null;
                        listener(new MirrorConsensusTopicResponse(m));
                    }
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
