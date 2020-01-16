import { ConsensusMessage } from "./ConsensusMessage";
import { ConsensusTopicId } from "./ConsensusTopicId";
import { Time } from "../Time";

type ErrorHandler = (error: Error) => void;
type Listener = (message: ConsensusMessage) => void;

export interface SubscriptionInterface {
    unsubscribe(): void;
}

export abstract class BaseConsensusClient {
    protected errorHandler: ErrorHandler | null = null;

    public setErrorHandler(errorHandler: ErrorHandler): this {
        this.errorHandler = errorHandler;
        return this;
    }

    public abstract subscribe(
        topicId: ConsensusTopicId,
        startTime: Time | null,
        listener: Listener
    ): SubscriptionInterface;
}
