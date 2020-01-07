import { ConsensusServiceClient, ResponseStream, Status } from "../generated/MirrorConsensusService_pb_service";
import { ConsensusTopicQuery, ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { ConsensusMessage } from "./ConsensusMessage";
import { ConsensusTopicId } from "./ConsensusTopicId";
import { Time } from "../Time";
import { grpc } from "@improbable-eng/grpc-web";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import { BrowserHeaders } from "browser-headers";

type ErrorHandler = (error: Error) => void;
type Listener = (message: ConsensusMessage) => void;

export class SubscriptionClient {
    private stream: ResponseStream<ConsensusTopicResponse>;

    public constructor(stream: ResponseStream<ConsensusTopicResponse>) {
        this.stream = stream;
    }

    public unsubscribe(): void {
        this.stream.cancel();
    }
}

export class ConsensusClient {
    private client: ConsensusServiceClient;
    private errorHandler: ErrorHandler | null;

    public constructor(endpoint: string) {
        this.client = new ConsensusServiceClient(endpoint);
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

        const response = this.client.subscribeTopic(query, new BrowserHeaders({
                "Connection": "Keep-Alive",
                "Keep-Alive": "timeout=5, max=1000"
            }))
            .on("data", (message: ConsensusTopicResponse): void => {
                console.log("Received message inside client");
                listener(new ConsensusMessage(topicId, message));
            })
            .on("status", (status: Status): void => {
                console.log(`status: ${JSON.stringify(status)}`);
                // response.cancel();
            });

        return new SubscriptionClient(response);
    }
}
