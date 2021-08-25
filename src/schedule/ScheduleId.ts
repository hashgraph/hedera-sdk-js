import { ScheduleID } from "../generated/basic_types_pb";
import { normalizeEntityId } from "../util";
import BigNumber from "bignumber.js";
import * as hex from "@stablelib/hex";

/** Normalized schedule ID returned by various methods in the SDK. */
export class ScheduleId {
    public shard: number;
    public realm: number;
    public schedule: number;

    public constructor(shard: number, realm: number, schedule: number);
    public constructor(scheduleId: ScheduleIdLike);
    public constructor(
        shardOrScheduleId: ScheduleIdLike,
        realm?: number,
        schedule?: number
    ) {
        if (
            typeof shardOrScheduleId === "number" &&
            realm != null &&
            schedule != null
        ) {
            this.shard = shardOrScheduleId as number;
            this.realm = realm!;
            this.schedule = schedule!;
        } else {
            const scheduleId = shardOrScheduleId as ScheduleIdLike;
            const id =
                scheduleId instanceof ScheduleId ?
                    scheduleId :
                    normalizeEntityId("schedule", scheduleId);

            this.shard = id.shard;
            this.realm = id.realm;
            this.schedule = id.schedule;
        }
    }

    public static fromString(id: string): ScheduleId {
        return new ScheduleId(id);
    }

    // NOT A STABLE API
    public static _fromProto(scheduleId: ScheduleID): ScheduleId {
        return new ScheduleId({
            shard: scheduleId.getShardnum(),
            realm: scheduleId.getRealmnum(),
            schedule: scheduleId.getSchedulenum()
        });
    }

    public toString(): string {
        return `${this.shard}.${this.realm}.${this.schedule}`;
    }

    // NOT A STABLE API
    public _toProto(): ScheduleID {
        const acctId = new ScheduleID();
        acctId.setShardnum(this.shard);
        acctId.setRealmnum(this.realm);
        acctId.setSchedulenum(this.schedule);
        return acctId;
    }
}

/**
 * Input type for an ID of an schedule on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<schedule>'` or `'<schedule>'`.
 *
 * A bare `number` will be taken as the schedule number with shard and realm of 0.
 */
export type ScheduleIdLike =
    | { shard?: number; realm?: number; schedule: number }
    | string
    | number
    | ScheduleId;
