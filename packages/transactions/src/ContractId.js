import { root } from "../generated/proto.js";
import * as hex from "@hashgraph/cryptography/encoding/hex.js";
import { normalizeEntityId } from "./util.js";

/**
 * Input type for an ID of a contract on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<contract>'` or `'<contract>'`.
 *
 * A bare `number` will be taken as the contract number with shard and realm of 0.
 *
 * @typedef {{ shard?: number; realm?: number; contract: number } | string | number | ContractId} ContractIdLike
 */

/** Normalized contract ID returned by various methods in the SDK. */
export default class ContractId {
    /**
     * @param {ContractIdLike} shardOrContractId
     * @param {number | undefined} realm
     * @param {number | undefined} contract
     */
    constructor(shardOrContractId, realm, contract) {
        if (
            typeof shardOrContractId === "number" &&
            realm != null &&
            contract != null
        ) {
            /**
             * @type {number}
             */
            this.shard = shardOrContractId;

            /**
             * @type {number}
             */
            this.realm = realm;

            /**
             * @type {number}
             */
            this.contract = contract;
        } else {
            const contractId = shardOrContractId;
            const id =
                contractId instanceof ContractId
                    ? contractId
                    : normalizeEntityId("contract", contractId);

            this.shard = id.shard ?? 0;
            this.realm = id.realm ?? 0;
            this.contract = id instanceof ContractId ? id.contract : id.entity;
        }
    }

    /**
     * @param {string} id
     * @returns {ContractId}
     */
    static fromString(id) {
        return new ContractId(id, undefined, undefined);
    }

    /**
     * NOT A STABLE API
     *
     * @param {root.proto.ContractID} contractId
     * @param contractId
     * @returns {ContractId}
     */
    static _fromProtobuf(contractId) {
        return new ContractId({
            shard: contractId.getShardnum(),
            realm: contractId.getRealmnum(),
            contract: contractId.getContractnum(),
        }, undefined, undefined);
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.shard}.${this.realm}.${this.contract}`;
    }

    // /**
    //  * @param {string} address
    //  * @returns {ContractId}
    //  */
    // static fromSolidityAddress(address) {
    //     if (address.length !== 40) {
    //         throw new Error(`Invalid hex encoded solidity address length:
    //                 expected length 40, got length ${address.length}`);
    //     }

    //     // First 4 bytes encoded as 8 characters
    //     const shard = new BigNumber(address.slice(0, 8), 16).toNumber();
    //     // Next 8 bytes encoded as 16 characters
    //     const realm = new BigNumber(address.slice(8, 24), 16).toNumber();
    //     // Next 8 bytes encoded as 16 characters
    //     const contract = new BigNumber(address.slice(24, 40), 16).toNumber();

    //     return new ContractId(shard, realm, contract);
    // }

    /**
     * @returns {string}
     */
    toSolidityAddress() {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.contract);

        return hex.encode(buffer);
    }

    /**
     * NOT A STABLE API
     *
     * @returns {root.proto.ContractID}
     */
    _toProtobuf() {
        const proto = new root.proto.ContractID();
        proto.setShardnum(this.shard);
        proto.setRealmnum(this.realm);
        proto.setContractnum(this.contract);
        return proto;
    }
}
