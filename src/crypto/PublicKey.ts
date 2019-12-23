import * as pb from "../generated/BasicTypes_pb";
import { Ed25519PrivateKey } from "./Ed25519PrivateKey";
import { Ed25519PublicKey } from "./Ed25519PublicKey";
import { ContractId } from "../contract/ContractId";
import { ThresholdKey } from "./ThresholdKey";
import { KeyList } from "./KeyList";

export abstract class PublicKey {
    public abstract _toProtoKey(): pb.Key;
}

export function _fromProtoKey(key: pb.Key): PublicKey {
    if (key.hasEd25519()) {
        return new Ed25519PublicKey(key.getEcdsa384_asU8());
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
