import * as pb from "../generated/BasicTypes_pb";

export abstract class PublicKey {
    public abstract _toProtoKey(): pb.Key;
}

export function _fromProtoKey(key: pb.Key): PublicKey {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { Ed25519PublicKey } = require("./Ed25519PublicKey");
    const { ContractId } = require("../contract/ContractId");
    const { ThresholdKey } = require("./ThresholdKey");
    const { KeyList } = require("./KeyList");
    /* eslint-enable @typescript-eslint/no-var-requires */

    if (key.hasEd25519()) {
        return new Ed25519PublicKey(key.getEd25519_asU8());
    }

    if (key.hasContractid()) {
        return ContractId._fromProto(key.getContractid()!);
    }

    if (key.hasThresholdkey()) {
        const tk = key.getThresholdkey()!;
        const keys = _fromProtoKeyList(tk.getKeys()!);

        return new ThresholdKey(tk.getThreshold()).addAll(...keys);
    }

    if (key.hasKeylist()) {
        return new KeyList().addAll(..._fromProtoKeyList(key.getKeylist()!));
    }

    throw new Error(`not implemented key case: ${key.getKeyCase()}`);
}

export function _fromProtoKeyList(keys: pb.KeyList): PublicKey[] {
    return keys.getKeysList().map(_fromProtoKey);
}
