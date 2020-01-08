import { ConsensusService } from "../generated/MirrorConsensusService_pb_service";
import { ConsensusTopicQuery, ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { ConsensusMessage } from "./ConsensusMessage";
import { ConsensusTopicId } from "./ConsensusTopicId";
import { Time } from "../Time";
import * as grpc from "grpc";

type ErrorHandler = (error: Error) => void;
type Listener = (message: ConsensusMessage) => void;

export class SubscriptionClient {
    private stream: grpc.ClientReadableStream<ConsensusTopicResponse>;

    public constructor(stream: grpc.ClientReadableStream<ConsensusTopicResponse>) {
        this.stream = stream;
    }

    public unsubscribe(): void {
        this.stream.cancel();
    }
}

export class ConsensusClient {
    private client: grpc.Client;
    private errorHandler: ErrorHandler | null;

    public constructor(endpoint: string) {
        this.client = new grpc.Client(endpoint, grpc.credentials.createInsecure());
        this.errorHandler = null;
    }

    public setErrorHandler(errorHandler: ErrorHandler): this {
        this.errorHandler = errorHandler;
        return this;
    }

    public subscribe(
        topicId: ConsensusTopicId,
        startTime: Time | null,
        listener: Listener
    ): SubscriptionClient {
        const query = new ConsensusTopicQuery();
        query.setTopicid(topicId._toProto());

        if (startTime != null) {
            query.setConsensusstarttime(startTime!._toProto());
        }

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
                console.log(`status: ${JSON.stringify(status)}`);
                // response.cancel();
            });

        return new SubscriptionClient(response);
    }
}
