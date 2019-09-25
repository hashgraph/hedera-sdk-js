import {ContractID} from "../generated/BasicTypes_pb";

/** Normalized contract ID returned by various methods in the SDK. */
export type ContractId = { shard: number; realm: number; contract: number };

/**
 * Input type for an ID of a contract on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<contract>'` or `'<contract>'`.
 *
 * A bare `number` will be taken as the contract number with shard and realm of 0.
 */
export type ContractIdLike =
    { shard?: number; realm?: number; contract: number }
    | string
    | number;

export function contractIdToSdk(contractId: ContractID): ContractId {
    return {
        shard: contractId.getShardnum(),
        realm: contractId.getRealmnum(),
        contract: contractId.getContractnum()
    };
}