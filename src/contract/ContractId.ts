import { ContractID, Key } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";
import { PublicKey } from "../crypto/PublicKey";
import BigNumber from "bignumber.js";
import * as hex from "@stablelib/hex";

/** Normalized contract ID returned by various methods in the SDK. */
export class ContractId extends PublicKey {
    public shard: number;
    public realm: number;
    public contract: number;

    public constructor(shard: number, realm: number, contract: number);
    public constructor(contractId: ContractIdLike);
    public constructor(shardOrContractId: ContractIdLike, realm?: number, contract?: number) {
        super();

        if (typeof shardOrContractId === "number" && realm != null && contract != null) {
            this.shard = shardOrContractId as number;
            this.realm = realm!;
            this.contract = contract!;
        } else {
            const contractId = shardOrContractId as ContractIdLike;
            const id = contractId instanceof ContractId ?
                contractId :
                normalizeEntityId("contract", contractId);

            this.shard = id.shard;
            this.realm = id.realm;
            this.contract = id.contract;
        }
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

    public static fromSolidityAddress(address: string): ContractId {
        if (address.length !== 40) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        // First 4 bytes encoded as 8 characters
        const shard = new BigNumber(address.slice(0, 8), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const realm = new BigNumber(address.slice(8, 24), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const contract = new BigNumber(address.slice(24, 40), 16).toNumber();

        return new ContractId(shard, realm, contract);
    }

    public toSolidityAddress(): string {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.contract);

        return hex.encode(buffer, true);
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
