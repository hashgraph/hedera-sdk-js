import { ConsensusService } from "../generated/MirrorConsensusService_pb_service";
import { ConsensusTopicQuery, ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { ConsensusMessage } from "./ConsensusMessage";
import { ConsensusTopicId } from "./ConsensusTopicId";
import { Time } from "../Time";
import * as grpc from "grpc";
import { BaseConsensusClient, SubscriptionInterface } from "./BaseConsensusClient";

type ErrorHandler = (error: Error) => void;
type Listener = (message: ConsensusMessage) => void;

export class Subscription implements SubscriptionInterface {
    private stream: grpc.ClientReadableStream<ConsensusTopicResponse>;

    public constructor(stream: grpc.ClientReadableStream<ConsensusTopicResponse>) {
        this.stream = stream;
    }

    public unsubscribe(): void {
        this.stream.cancel();
    }
}

export class ConsensusClient extends BaseConsensusClient {
    private client: grpc.Client;

    public constructor(endpoint: string) {
        super();
        this.client = new grpc.Client(endpoint, grpc.credentials.createInsecure());
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

        const response = this.client.makeServerStreamRequest(
            `/${ConsensusService.serviceName}/${ConsensusService.subscribeTopic.methodName}`,
            (req) => Buffer.from(req.serializeBinary()),
            ConsensusTopicResponse.deserializeBinary,
            query,
            null,
            null
        )
            .on("data", (message: ConsensusTopicResponse): void => {
                listener(new ConsensusMessage(topicId, message));
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

        return new Subscription(response);
    }
}
