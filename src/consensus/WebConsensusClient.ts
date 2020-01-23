import { ConsensusService } from "../generated/MirrorConsensusService_pb_service";
import { ConsensusTopicQuery, ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { ConsensusMessage } from "./ConsensusMessage";
import { ConsensusTopicId } from "./ConsensusTopicId";
import { Time } from "../Time";
import { grpc } from "@improbable-eng/grpc-web";
import { BaseConsensusClient, SubscriptionInterface } from "./BaseConsensusClient";

import Request = grpc.Request;
import Code = grpc.Code;

type ErrorHandler = (error: Error) => void;
type Listener = (message: ConsensusMessage) => void;

export class Subscription implements SubscriptionInterface {
    private request: Request;

    public constructor(request: Request) {
        this.request = request;
    }

    public unsubscribe(): void {
        this.request.close();
    }
}

export class ConsensusClient extends BaseConsensusClient {
    private endpoint: string;

    public constructor(endpoint: string) {
        super();
        this.endpoint = endpoint;
    }

    public subscribe(
        topicId: ConsensusTopicId,
        startTime: Time | null,
        listener: Listener
    ): SubscriptionInterface {
        const query = new ConsensusTopicQuery();
        query.setTopicid(topicId._toProto());

        if (startTime != null) {
            query.setConsensusstarttime(startTime!._toProto());
        }

        const errorHandler = this.errorHandler;

        const request = grpc.invoke(ConsensusService.subscribeTopic, {
            host: this.endpoint,
            request: query,
            onMessage(message: ConsensusTopicResponse): void {
                listener(new ConsensusMessage(topicId, message));
            },
            onEnd(code: Code, message: string): void {
                if (errorHandler != null) {
                    errorHandler(new Error(`Received status code: ${code} and message: ${message}`));
                }
            }
        });

        return new Subscription(request);
    }
}
