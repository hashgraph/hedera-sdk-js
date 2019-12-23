import { ContractID, Key } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";
import { PublicKey } from "../crypto/PublicKey";

/** Normalized contract ID returned by various methods in the SDK. */
export class ContractId extends PublicKey {
    public shard: number;
    public realm: number;
    public contract: number;

    public constructor(contractId: ContractIdLike) {
        super()

        const id = contractId instanceof ContractId ?
            contractId :
            normalizeEntityId("contract", contractId);

        this.shard = id.shard;
        this.realm = id.realm;
        this.contract = id.contract;
    }

    public static fromString(id: string): ContractId {
        return new ContractId(id);
    }

    // NOT A STABLE API
    public static _fromProto(contractId: ContractID): ContractId {
        return new ContractId({
            shard: contractId.getShardnum(),
            realm: contractId.getRealmnum(),
            contract: contractId.getContractnum()
        });
    }

    public toString(): string {
        return `${this.shard}.${this.realm}.${this.contract}`;
    }

    // NOT A STABLE API
    public _toProto(): ContractID {
        const contractId = new ContractID();
        contractId.setShardnum(this.shard);
        contractId.setRealmnum(this.realm);
        contractId.setContractnum(this.contract);
        return contractId;
    }

    // NOT A STABLE API
    public _toProtoKey(): Key {
        const key = new Key();
        key.setContractid(this._toProto());
        return key;
    }
}

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
    | number
    | ContractId;
