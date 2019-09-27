import {Key} from "../generated/BasicTypes_pb";

export interface PublicKey {
    toProtoKey(): Key;
}
