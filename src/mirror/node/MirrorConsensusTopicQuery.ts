import * as grpc from "@grpc/grpc-js";
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

        const handle = new MirrorSubscriptionHandle();

        this._makeServerStreamRequest(handle, 0, client, listener, errorHandler);

        return handle;
    }

    private _makeServerStreamRequest(
        handle: MirrorSubscriptionHandle,
        attempt: number,
        client: MirrorClient,
        listener: Listener,
        errorHandler?: ErrorHandler
    ): void {
        const list: { [ id: string]: ConsensusTopicResponse[] | null } = {};
        let shouldRetry = true;

        const response = client._client.makeServerStreamRequest(
            `/${ConsensusService.serviceName}/${ConsensusService.subscribeTopic.methodName}`,
            (req) => Buffer.from(req.serializeBinary()),
            ConsensusTopicResponse.deserializeBinary,
            this._builder,
            new grpc.Metadata(),
            {}
        )
            .on("data", (message: ConsensusTopicResponse): void => {
                shouldRetry = false;

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
                if (!shouldRetry || attempt > 10) {
                    if (errorHandler != null) {
                        errorHandler(new Error(`Received status code: ${status.code} and message: ${status.details}`));
                    }
                } else if (attempt < 10 &&
                    shouldRetry &&
                    (status.code === grpc.status.NOT_FOUND ||
                        status.code === grpc.status.UNAVAILABLE)) {
                    setTimeout(() => {
                        this._makeServerStreamRequest(
                            handle,
                            attempt + 1,
                            client,
                            listener,
                            errorHandler
                        );
                    }, 250 * 2 ** attempt);
                }
            })
            .on("end", (status?: grpc.StatusObject): void => {
                if (errorHandler != null && status != null) {
                    errorHandler(new Error(`Received status code: ${status.code} and message: ${status.details}`));
                }
            })
            .on("error", () => {
                // Do nothing. `on("status")` will be called after this which has the retry loop
            });

        handle._setCall(response.cancel);
    }
}
