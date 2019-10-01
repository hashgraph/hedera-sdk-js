import { Key } from "../generated/BasicTypes_pb";

export interface PublicKey {
    _toProtoKey(): Key;
}
