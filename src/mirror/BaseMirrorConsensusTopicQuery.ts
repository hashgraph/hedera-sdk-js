import { ConsensusTopicQuery } from "../generated/MirrorConsensusService_pb";
import {
    ConsensusTopicId,
    ConsensusTopicIdLike
} from "../consensus/ConsensusTopicId";
import { Time } from "../Time";
import { LocalValidationError } from "../errors/LocalValidationError";
import { MirrorConsensusTopicResponse } from "./MirrorConsensusTopicResponse";

export type Listener = (message: MirrorConsensusTopicResponse) => void;
export type ErrorHandler = (error: Error) => void;

export class BaseMirrorConsensusTopicQuery {
    protected readonly _builder: ConsensusTopicQuery = new ConsensusTopicQuery();

    public setTopicId(id: ConsensusTopicIdLike): this {
        this._builder.setTopicid(new ConsensusTopicId(id)._toProto());
        return this;
    }

    public setStartTime(start: number | Date): this {
        this._builder.setConsensusstarttime(Time.fromDate(start)._toProto());
        return this;
    }

    public setEndTime(start: number | Date): this {
        this._builder.setConsensusendtime(Time.fromDate(start)._toProto());
        return this;
    }

    public setLimit(limit: number): this {
        this._builder.setLimit(limit);
        return this;
    }

    // NOT A STABLE API
    public _validate(): void {
        if (!this._builder.hasTopicid()) {
            throw new LocalValidationError("MirrorConsensusTopicQuery", [ "`.setTopicId()` is required to be called" ]);
        }
    }
}
