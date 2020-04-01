import { ConsensusService } from "../../generated/MirrorConsensusService_pb_service";
import { ConsensusTopicResponse } from "../../generated/MirrorConsensusService_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { MirrorClient } from "./MirrorClient";
import { MirrorSubscriptionHandle } from "../MirrorSubscriptionHandle";
import { BaseMirrorConsensusTopicQuery, ErrorHandler, Listener, handleListener } from "../BaseMirrorConsensusTopicQuery";

export class MirrorConsensusTopicQuery extends BaseMirrorConsensusTopicQuery {
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
                handleListener(provider, messages, message, listener);
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
