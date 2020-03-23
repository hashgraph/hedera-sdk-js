import { TopicID } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";
import BigNumber from "bignumber.js";
import * as hex from "@stablelib/hex";

export class ConsensusTopicId {
    public shard: number;
    public realm: number;
    public topic: number;

    public constructor(shard: number, realm: number, topic: number);
    public constructor(topicId: ConsensusTopicIdLike);
    public constructor(
        shardOrTopicId: ConsensusTopicIdLike,
        realm?: number,
        topic?: number
    ) {
        if (typeof shardOrTopicId === "number" && realm != null && topic != null) {
            this.shard = shardOrTopicId as number;
            this.realm = realm!;
            this.topic = topic!;
        } else {
            const topicId = shardOrTopicId as ConsensusTopicIdLike;
            const id =
                      topicId instanceof ConsensusTopicId ?
                          topicId :
                          normalizeEntityId("topic", topicId);

            this.shard = id.shard;
            this.realm = id.realm;
            this.topic = id.topic;
        }
    }

    public static fromString(id: string): ConsensusTopicId {
        return new ConsensusTopicId(id);
    }

    // NOT A STABLE API
    public static _fromProto(topicId: TopicID): ConsensusTopicId {
        return new ConsensusTopicId({
            shard: topicId.getShardnum(),
            realm: topicId.getRealmnum(),
            topic: topicId.getTopicnum()
        });
    }

    public toString(): string {
        return `${this.shard}.${this.realm}.${this.topic}`;
    }

    public static fromSolidityAddress(address: string): ConsensusTopicId {
        if (address.length !== 40) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        // First 4 bytes encoded as 8 characters
        const shard = new BigNumber(address.slice(0, 8), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const realm = new BigNumber(address.slice(8, 24), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const topic = new BigNumber(address.slice(24, 40), 16).toNumber();

        return new ConsensusTopicId(shard, realm, topic);
    }

    public toSolidityAddress(): string {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.topic);

        return hex.encode(buffer, true);
    }

    // NOT A STABLE API
    public _toProto(): TopicID {
        const acctId = new TopicID();
        acctId.setShardnum(this.shard);
        acctId.setRealmnum(this.realm);
        acctId.setTopicnum(this.topic);
        return acctId;
    }
}

export type ConsensusTopicIdLike =
    { shard?: number; realm?: number; topic: number }
    | string
    | number
    | ConsensusTopicId;
