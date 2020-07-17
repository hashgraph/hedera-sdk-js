import * as grpc from "grpc";
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

        const response = client._client.makeServerStreamRequest(
            `/${ConsensusService.serviceName}/${ConsensusService.subscribeTopic.methodName}`,
            (req) => Buffer.from(req.serializeBinary()),
            ConsensusTopicResponse.deserializeBinary,
            this._builder,
            null,
            null
        )
            .on("data", (message: ConsensusTopicResponse): void => {
                if (!message.hasChunkinfo()) {
                    listener(new MirrorConsensusTopicResponse(message));
                } else {
                    // eslint-disable-next-line max-len
                    const txId = TransactionId._fromProto(message.getChunkinfo()!.getInitialtransactionid()!).toString();

                    if (list[ txId ] == null) {
                        list[ txId ] = [];
                    }

                    list[ txId ]!.push(message);

                    if (list[ txId ]!.length === message.getChunkinfo()!.getTotal()) {
                        const m = list[ txId ]!;
                        list[ txId ] = null;
                        listener(new MirrorConsensusTopicResponse(m));
                    }
                }
            })
            .on("status", (status: grpc.StatusObject): void => {
                if (errorHandler != null) {
                    errorHandler(new Error(`Received status code: ${status.code} and message: ${status.details}`));
                }
            })
            .on("end", (status?: grpc.StatusObject): void => {
                if (errorHandler != null && status != null) {
                    errorHandler(new Error(`Received status code: ${status.code} and message: ${status.details}`));
                }
            });

        return new MirrorSubscriptionHandle(response.cancel);
    }
}
